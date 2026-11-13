import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AutomationStatus = "Automated" | "Candidate" | "Manual";

export type TestCase = {
  id: string;
  title: string;
  requirementIds: string[];
  priority: "P1" | "P2" | "P3" | "P4";
  severity: "Critical" | "Major" | "Minor" | "Trivial";
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

const skillScriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(skillScriptsDirectory, "../../..");
export const catalogDirectory = path.join(
  repoRoot,
  "test-case-generation/test-cases",
);
export const schemaPath = path.join(
  repoRoot,
  "agent/test-case-generator/test-case.schema.json",
);
export const testScriptsRoot = path.join(repoRoot, "test-scripts");

export function readCatalogFiles(): CatalogFile[] {
  return readdirSync(catalogDirectory)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({
      file: path.join("test-case-generation/test-cases", file),
      content: JSON.parse(
        readFileSync(path.join(catalogDirectory, file), "utf8"),
      ),
    }));
}

export function loadCatalogs(): Catalog[] {
  return readCatalogFiles().map(({ content }) => content as Catalog);
}
