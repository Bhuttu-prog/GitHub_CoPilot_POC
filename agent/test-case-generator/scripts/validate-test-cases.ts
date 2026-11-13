import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import { type Catalog, projectRoot, readCatalogFiles, schemaPath } from './catalog';

const forbiddenTitlePrefixes = /^(verify|check|test|validate|ensure)\b/i;

function schemaErrors(catalogFiles: ReturnType<typeof readCatalogFiles>): string[] {
  const validate = new Ajv({ allErrors: true }).compile(JSON.parse(readFileSync(schemaPath, 'utf8')));
  return catalogFiles.flatMap(({ file, content }) =>
    validate(content)
      ? []
      : (validate.errors ?? []).map((error) => `${file}: ${error.instancePath || '/'} ${error.message}`),
  );
}

function ruleErrors(file: string, catalog: Catalog, seenIds: Set<string>): string[] {
  const errors: string[] = [];
  const requirementIds = new Set(catalog.requirements.map(({ id }) => id));
  const coveredRequirements = new Set<string>();

  for (const requirement of catalog.requirements) {
    if (!requirement.id.startsWith(`REQ-${catalog.module}-`)) {
      errors.push(`${file}: ${requirement.id} must use the module prefix REQ-${catalog.module}-`);
    }
  }

  for (const testCase of catalog.testCases) {
    const label = `${file}: ${testCase.id}`;

    if (seenIds.has(testCase.id)) errors.push(`${label} is duplicated`);
    seenIds.add(testCase.id);

    if (!testCase.id.startsWith(`TC-${catalog.module}-`)) {
      errors.push(`${label} must use the module prefix TC-${catalog.module}-`);
    }
    if (forbiddenTitlePrefixes.test(testCase.title)) {
      errors.push(`${label} title must state the expected behaviour, not start with "${testCase.title.split(' ')[0]}"`);
    }
    if (!testCase.tags.some((tag) => tag === '@smoke' || tag === '@regression')) {
      errors.push(`${label} must be tagged @smoke or @regression`);
    }
    if (testCase.priority === 'P1' && testCase.severity === 'Trivial') {
      errors.push(`${label} cannot be P1 with Trivial severity`);
    }

    for (const requirementId of testCase.requirementIds) {
      if (!requirementIds.has(requirementId)) errors.push(`${label} references unknown requirement ${requirementId}`);
      coveredRequirements.add(requirementId);
    }

    errors.push(...automationErrors(label, testCase));
  }

  for (const requirementId of requirementIds) {
    if (!coveredRequirements.has(requirementId)) errors.push(`${file}: ${requirementId} has no test case`);
  }

  return errors;
}

function automationErrors(label: string, testCase: Catalog['testCases'][number]): string[] {
  const { status, spec } = testCase.automation;
  if (status !== 'Automated') {
    return spec ? [`${label} is ${status} and must not reference a spec`] : [];
  }
  if (!spec) return [`${label} is Automated and must reference a spec`];

  const specPath = path.join(projectRoot, spec);
  if (!existsSync(specPath)) return [`${label} references missing spec ${spec}`];
  if (!readFileSync(specPath, 'utf8').includes(testCase.id)) return [`${label} is not implemented in ${spec}`];
  return [];
}

function main(): void {
  const catalogFiles = readCatalogFiles();
  const errors = schemaErrors(catalogFiles);

  if (errors.length === 0) {
    const seenIds = new Set<string>();
    for (const { file, content } of catalogFiles) {
      errors.push(...ruleErrors(file, content as Catalog, seenIds));
    }
  }

  if (errors.length > 0) {
    console.error(`Test case validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`  ✖ ${error}`));
    process.exit(1);
  }

  const total = catalogFiles.reduce((count, { content }) => count + (content as Catalog).testCases.length, 0);
  console.log(`✔ ${total} test cases in ${catalogFiles.length} catalog(s) conform to the schema and design rules`);
}

main();
