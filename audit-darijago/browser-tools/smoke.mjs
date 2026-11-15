import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';
const mode = process.argv[2] || 'original';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const consoleErrors = [], pageErrors = [], failedRequests = [], responses = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e)));
page.on('requestfailed', r => failedRequests.push({ url: r.url(), error: r.failure()?.errorText }));
page.on('response', r => { if (r.url().includes('/api/') || r.status() >= 400) responses.push({ url: r.url(), status: r.status() }); });
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 60000 }).catch(e => pageErrors.push('goto: '+e.message));
await page.waitForTimeout(2500);
const info = await page.evaluate(() => ({ title: document.title, rootChildren: document.getElementById('root')?.children.length ?? -1, rootHtmlLength: document.getElementById('root')?.innerHTML.length ?? -1, bodyText: document.body.innerText.slice(0, 500), scripts: [...document.scripts].map(s => ({ src: s.src, type: s.type })) }));
await page.screenshot({ path: `../tests/smoke-${mode}.png`, fullPage: true });
let axe = null;
if (info.rootChildren > 0) {
  axe = await new AxeBuilder({ page }).analyze().then(r => ({ violations: r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })), passes: r.passes.length })).catch(e => ({ error: String(e) }));
}
const out = { mode, info, consoleErrors, pageErrors, failedRequests, responses, axe };
writeFileSync(`../tests/smoke-${mode}.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
