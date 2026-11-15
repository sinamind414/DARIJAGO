import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
const out = { errors };
await page.goto('http://127.0.0.1:3000/?autostart=1', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="nav-tab-apprendre"]');
// axe details on learn
const axe = await new AxeBuilder({ page }).analyze();
out.axeLearnDetails = axe.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0,6).map(n => ({ target: n.target, html: n.html.slice(0,160), summary: n.failureSummary })) }));
// language switch via data-lang-code
await page.click('[data-testid="nav-tab-profil"]');
await page.click('[data-lang-code="en"]');
await page.waitForTimeout(400);
out.lang = await page.evaluate(() => ({ lang: document.documentElement.lang, title: document.title, stored: localStorage.getItem('darijago_lang_v1') }));
// dialogue offline fallback
await page.click('[data-lang-code="fr"]');
await page.click('[data-testid="nav-tab-parcours"]');
await page.click('[data-testid="parcours-subtab-dialogues"]');
await page.waitForTimeout(500);
const input = page.locator('input[placeholder]');
await input.fill('Salam, labes?');
await input.press('Enter');
await page.waitForTimeout(1200);
out.dialogueText = await page.evaluate(() => document.body.innerText.slice(-1200));
await page.screenshot({ path: '../tests/flow-dialogue.png', fullPage: false });
// oral unsupported / record
await page.click('[data-testid="nav-tab-apprendre"]');
await page.waitForSelector('[data-testid="oral-record-btn"]');
await page.click('[data-testid="oral-record-btn"]');
await page.waitForTimeout(1200);
out.oralNotice = await page.locator('[data-testid="oral-speech-notice"]').textContent().catch(()=>null);
out.oralFallbackVisible = await page.locator('[data-testid="oral-fallback-input"]').isVisible().catch(()=>false);
await page.screenshot({ path: '../tests/flow-oral.png', fullPage: false });
writeFileSync('../tests/flow2.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
