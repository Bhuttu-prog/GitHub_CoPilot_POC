import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { type Catalog, type TestCase, loadCatalogs, projectRoot } from './catalog';

type Outcome = 'Passed' | 'Failed' | 'Flaky' | 'Skipped' | 'Not run';
type PlaywrightTest = { projectName: string; status: 'expected' | 'unexpected' | 'flaky' | 'skipped' };
type PlaywrightSpec = { title: string; tests: PlaywrightTest[] };
type PlaywrightSuite = { specs?: PlaywrightSpec[]; suites?: PlaywrightSuite[] };

type TraceabilityRow = TestCase & { module: string; results: Record<string, Outcome> };
type Summary = {
  generatedAt: string;
  requirements: number;
  testCases: number;
  automated: number;
  automationCoverage: string;
  executions: number;
  passed: number;
  failed: number;
  passRate: string;
  knownDefects: number;
  projects: string[];
};

const reportsDirectory = path.join(projectRoot, 'reports');
const resultsPath = path.join(reportsDirectory, 'results.json');
const testCaseIdPattern = /TC-[A-Z0-9]{2,8}-\d{3}/;
const outcomeByStatus: Record<PlaywrightTest['status'], Outcome> = {
  expected: 'Passed',
  unexpected: 'Failed',
  flaky: 'Flaky',
  skipped: 'Skipped',
};
const outcomeSeverity: Outcome[] = ['Failed', 'Flaky', 'Passed', 'Skipped', 'Not run'];

function collectSpecs(suites: PlaywrightSuite[] = []): PlaywrightSpec[] {
  return suites.flatMap((suite) => [...(suite.specs ?? []), ...collectSpecs(suite.suites)]);
}

function worstOutcome(current: Outcome | undefined, next: Outcome): Outcome {
  if (!current) return next;
  return outcomeSeverity.indexOf(next) < outcomeSeverity.indexOf(current) ? next : current;
}

function readExecutionResults(): Map<string, Record<string, Outcome>> {
  const resultsByTestCase = new Map<string, Record<string, Outcome>>();
  if (!existsSync(resultsPath)) return resultsByTestCase;

  const report = JSON.parse(readFileSync(resultsPath, 'utf8')) as { suites: PlaywrightSuite[] };
  for (const spec of collectSpecs(report.suites)) {
    const testCaseId = spec.title.match(testCaseIdPattern)?.[0];
    if (!testCaseId) continue;
    const results = resultsByTestCase.get(testCaseId) ?? {};
    for (const { projectName, status } of spec.tests) {
      results[projectName] = worstOutcome(results[projectName], outcomeByStatus[status]);
    }
    resultsByTestCase.set(testCaseId, results);
  }
  return resultsByTestCase;
}

function buildRows(catalogs: Catalog[], resultsByTestCase: Map<string, Record<string, Outcome>>): TraceabilityRow[] {
  return catalogs.flatMap((catalog) =>
    catalog.testCases.map((testCase) => ({
      ...testCase,
      module: catalog.module,
      results: resultsByTestCase.get(testCase.id) ?? {},
    })),
  );
}

function percentage(part: number, whole: number): string {
  return whole === 0 ? '0%' : `${Math.round((part / whole) * 100)}%`;
}

function requirementStatus(outcomes: Outcome[], linked: TraceabilityRow[]): string {
  if (outcomes.includes('Failed')) return 'Failed';
  if (outcomes.length === 0) return 'Not run';
  if (linked.some((row) => row.defectId)) return 'Known defect';
  return 'Passed';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

function summarize(catalogs: Catalog[], rows: TraceabilityRow[], projects: string[]): Summary {
  const executions = rows.flatMap((row) => Object.values(row.results));
  const automated = rows.filter((row) => row.automation.status === 'Automated');
  return {
    generatedAt: new Date().toISOString(),
    requirements: catalogs.reduce((count, catalog) => count + catalog.requirements.length, 0),
    testCases: rows.length,
    automated: automated.length,
    automationCoverage: percentage(automated.length, rows.length),
    executions: executions.length,
    passed: executions.filter((outcome) => outcome === 'Passed').length,
    failed: executions.filter((outcome) => outcome === 'Failed').length,
    passRate: percentage(executions.filter((outcome) => outcome === 'Passed').length, executions.length),
    knownDefects: rows.filter((row) => row.defectId).length,
    projects,
  };
}

function renderHtml(catalogs: Catalog[], rows: TraceabilityRow[], summary: Summary): string {
  const kpis = [
    ['Requirements', summary.requirements],
    ['Test cases', summary.testCases],
    ['Automation coverage', summary.automationCoverage],
    ['Executions', summary.executions],
    ['Pass rate', summary.passRate],
    ['Known defects', summary.knownDefects],
  ];
  const requirementRows = catalogs.flatMap((catalog) =>
    catalog.requirements.map((requirement) => {
      const linked = rows.filter((row) => row.requirementIds.includes(requirement.id));
      const outcomes = linked.flatMap((row) => Object.values(row.results));
      const status = requirementStatus(outcomes, linked);
      const badgeClass = status === 'Known defect' ? 'defect' : status.replace(' ', '-');
      return `<tr><td>${requirement.id}</td><td>${escapeHtml(requirement.description)}</td><td>${linked
        .map((row) => row.id)
        .join(', ')}</td><td><span class="badge ${badgeClass}">${status}</span></td></tr>`;
    }),
  );
  const testCaseRows = rows.map((row) => {
    const results = summary.projects
      .map((project) => {
        const outcome = row.results[project] ?? 'Not run';
        return `<td><span class="badge ${outcome.replace(' ', '-')}">${outcome}</span></td>`;
      })
      .join('');
    const defect = row.defectId ? `<span class="badge defect">${row.defectId}</span>` : '';
    return `<tr data-module="${row.module}"><td>${row.id}</td><td>${escapeHtml(row.title)} ${defect}</td><td>${row.requirementIds.join(
      ', ',
    )}</td><td class="${row.priority}">${row.priority}</td><td>${row.type}</td><td>${row.technique}</td><td>${row.tags.join(
      ' ',
    )}</td><td>${row.automation.status}</td>${results}</tr>`;
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Requirements Traceability Matrix</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; background: #f5f7fb; color: #1f2937; }
  header { background: linear-gradient(120deg, #0f766e, #2563eb); color: #fff; padding: 28px 40px; }
  header h1 { margin: 0 0 6px; font-size: 26px; }
  main { padding: 24px 40px 48px; }
  .kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 28px; }
  .kpi { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .kpi strong { display: block; font-size: 28px; color: #0f766e; }
  .kpi span { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: .04em; }
  h2 { font-size: 18px; margin: 28px 0 12px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); font-size: 13px; }
  th { background: #111827; color: #fff; text-align: left; padding: 10px; position: sticky; top: 0; }
  td { padding: 9px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:hover td { background: #f0fdfa; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .Passed { background: #dcfce7; color: #166534; } .Failed { background: #fee2e2; color: #991b1b; }
  .Flaky { background: #fef3c7; color: #92400e; } .Skipped, .Not-run { background: #e5e7eb; color: #374151; }
  .defect { background: #ede9fe; color: #5b21b6; }
  td.P1 { color: #b91c1c; font-weight: 700; } td.P2 { color: #c2410c; font-weight: 600; }
  input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; width: 320px; margin-bottom: 12px; }
</style>
</head>
<body>
<header>
  <h1>Requirements Traceability Matrix</h1>
  <div>Requirement → Test case → Automated spec → Cross-browser result · generated ${summary.generatedAt}</div>
</header>
<main>
  <section class="kpis">${kpis.map(([label, value]) => `<div class="kpi"><strong>${value}</strong><span>${label}</span></div>`).join('')}</section>
  <h2>Requirement coverage</h2>
  <table><thead><tr><th>Requirement</th><th>Description</th><th>Test cases</th><th>Status</th></tr></thead><tbody>${requirementRows.join('')}</tbody></table>
  <h2>Test cases</h2>
  <input id="filter" placeholder="Filter by ID, title, tag or status…" oninput="filterRows(this.value)">
  <table id="test-cases"><thead><tr><th>ID</th><th>Title</th><th>Requirements</th><th>Priority</th><th>Type</th><th>Technique</th><th>Tags</th><th>Automation</th>${summary.projects
    .map((project) => `<th>${project}</th>`)
    .join('')}</tr></thead><tbody>${testCaseRows.join('')}</tbody></table>
</main>
<script>
  function filterRows(term) {
    const query = term.toLowerCase();
    document.querySelectorAll('#test-cases tbody tr').forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
  }
</script>
</body>
</html>`;
}

function main(): void {
  const catalogs = loadCatalogs();
  const resultsByTestCase = readExecutionResults();
  const rows = buildRows(catalogs, resultsByTestCase);
  const projects = [...new Set([...resultsByTestCase.values()].flatMap((results) => Object.keys(results)))].sort();
  const summary = summarize(catalogs, rows, projects);

  mkdirSync(reportsDirectory, { recursive: true });
  writeFileSync(
    path.join(reportsDirectory, 'traceability.json'),
    JSON.stringify({ summary, testCases: rows }, null, 2),
  );
  writeFileSync(path.join(reportsDirectory, 'traceability.html'), renderHtml(catalogs, rows, summary));

  console.table(
    catalogs.map((catalog) => {
      const moduleRows = rows.filter((row) => row.module === catalog.module);
      return {
        module: catalog.module,
        requirements: catalog.requirements.length,
        testCases: moduleRows.length,
        automated: moduleRows.filter((row) => row.automation.status === 'Automated').length,
        failed: moduleRows.filter((row) => Object.values(row.results).includes('Failed')).length,
      };
    }),
  );
  console.log(
    `Automation coverage ${summary.automationCoverage} · pass rate ${summary.passRate} across ${summary.executions} executions`,
  );
  if (!existsSync(resultsPath))
    console.log('No reports/results.json found. Run "npm test" to include execution results.');
  console.log('Traceability matrix written to reports/traceability.html');
}

main();
