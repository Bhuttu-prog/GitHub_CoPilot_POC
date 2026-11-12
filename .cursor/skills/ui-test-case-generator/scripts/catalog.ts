import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type AutomationStatus = 'Automated' | 'Candidate' | 'Manual';

export type TestCase = {
  id: string;
  title: string;
  requirementIds: string[];
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  severity: 'Critical' | 'Major' | 'Minor' | 'Trivial';
  type: string;
  technique: string;
  tags: string[];
  preconditions: string[];
  testData?: Record<string, unknown>;
  steps: { action: string; expected?: string }[];
  expectedResult: string;
  defectId?: string;
  notes?: string;
  automation: { status: AutomationStatus; spec?: string };
};

export type Requirement = { id: string; description: string };

export type Catalog = {
  module: string;
  feature: string;
  application: string;
  requirements: Requirement[];
  testCases: TestCase[];
};

export type CatalogFile = { file: string; content: unknown };

export const projectRoot = process.cwd();
export const catalogDirectory = path.join(projectRoot, 'test-cases');
export const schemaPath = path.join(projectRoot, '.cursor/skills/ui-test-case-generator/test-case.schema.json');

export function readCatalogFiles(): CatalogFile[] {
  return readdirSync(catalogDirectory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => ({
      file: path.join('test-cases', file),
      content: JSON.parse(readFileSync(path.join(catalogDirectory, file), 'utf8')),
    }));
}

export function loadCatalogs(): Catalog[] {
  return readCatalogFiles().map(({ content }) => content as Catalog);
}
