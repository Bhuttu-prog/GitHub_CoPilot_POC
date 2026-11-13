import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

type ElementInfo = {
  tag: string;
  role: string | null;
  type: string | null;
  id: string | null;
  name: string | null;
  label: string | null;
  placeholder: string | null;
  text: string;
  visible: boolean;
};

const interactiveSelector = 'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="tab"]';
const implicitRoles: Record<string, string> = {
  a: 'link',
  button: 'button',
  select: 'combobox',
  textarea: 'textbox',
  checkbox: 'checkbox',
  radio: 'radio',
  submit: 'button',
  text: 'textbox',
  email: 'textbox',
  password: 'textbox',
  search: 'searchbox',
  number: 'spinbutton',
};

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function suggestLocator(element: ElementInfo): string {
  const role = element.role ?? implicitRoles[element.tag === 'input' ? (element.type ?? 'text') : element.tag];
  const accessibleName = element.label ?? (element.text || null);
  if (element.label) return `page.getByLabel(${quote(element.label)})`;
  if (role && accessibleName && role !== 'textbox') {
    return `page.getByRole('${role}', { name: ${quote(accessibleName)} })`;
  }
  if (element.placeholder) return `page.getByPlaceholder(${quote(element.placeholder)})`;
  if (element.id) return `page.locator('#${element.id}')`;
  if (element.name) return `page.locator('${element.tag}[name="${element.name}"]')`;
  return `UNSTABLE page.locator('${element.tag}') - request a data-testid`;
}

async function main(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: npm run tc:explore -- <url>');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator(interactiveSelector).first().waitFor({ state: 'attached' });

  const ariaSnapshot = await page.locator('body').ariaSnapshot();
  const elements = await page.locator(interactiveSelector).evaluateAll((nodes) =>
    nodes.map((node) => {
      const element = node as HTMLInputElement;
      const label = element.labels?.[0]?.innerText.trim() || element.getAttribute('aria-label');
      return {
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute('role'),
        type: element.getAttribute('type'),
        id: element.id || null,
        name: element.getAttribute('name'),
        label: label || null,
        placeholder: element.getAttribute('placeholder'),
        text: element.tagName === 'SELECT' ? '' : (element.innerText || element.value || '').trim().slice(0, 60),
        visible: Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length),
      };
    }),
  );
  await browser.close();

  const inventory = elements
    .filter((element) => element.visible)
    .map((element) => ({ ...element, suggestedLocator: suggestLocator(element) }));

  const outputDirectory = path.join(process.cwd(), 'reports/exploration');
  const fileName = new URL(url).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(
    path.join(outputDirectory, `${fileName}.json`),
    JSON.stringify({ url, ariaSnapshot, inventory }, null, 2),
  );

  console.log(`# ${url}\n\n## Accessibility tree\n${ariaSnapshot}\n\n## Interactive elements (${inventory.length})`);
  inventory.forEach((element) =>
    console.log(`- ${element.tag}${element.type ? `[${element.type}]` : ''} → ${element.suggestedLocator}`),
  );
  console.log(`\nSaved to reports/exploration/${fileName}.json`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
