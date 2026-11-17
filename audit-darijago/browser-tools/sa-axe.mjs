import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const browser = await chromium.launch({ headless: true });
const res = [];
for (const [label, url] of [['home','https://www.speak-algerian.com/'],['pricing','https://www.speak-algerian.com/pricing'],['login','https://www.speak-algerian.com/login']]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  res.push({ label, violations: r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })) });
  await ctx.close();
}
await browser.close();
fs.writeFileSync('/home/user/audit-darijago/tests/sa-axe.json', JSON.stringify(res, null, 2));
console.log(JSON.stringify(res, null, 2));
