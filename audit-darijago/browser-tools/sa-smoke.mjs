import { chromium } from 'playwright';
import fs from 'node:fs';

const out = [];
const browser = await chromium.launch({ headless: true });

async function run(label, viewport, url) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('pageerror: ' + String(e).slice(0, 200)));
  const t0 = Date.now();
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(1500);
  const title = await page.title();
  const h1 = await page.locator('h1').first().innerText().catch(() => '(aucun)');
  const text = (await page.locator('body').innerText()).slice(0, 400);
  const metaDesc = await page.getAttribute('meta[name="description"]', 'content').catch(() => null);
  const lang = await page.getAttribute('html', 'lang');
  out.push({ label, url, status: resp?.status(), loadMs, title, lang, metaDesc, h1: h1.replace(/\n/g, ' '), errors, text: text.replace(/\n/g, ' | ') });
  await page.screenshot({ path: `/home/user/audit-darijago/tests/sa-${label}.png`, fullPage: false });
  await ctx.close();
}

await run('home-desktop', { width: 1366, height: 900 }, 'https://www.speak-algerian.com/');
await run('home-mobile', { width: 390, height: 844 }, 'https://www.speak-algerian.com/');
await run('pricing-mobile', { width: 390, height: 844 }, 'https://www.speak-algerian.com/pricing');
await run('vocabulary-mobile', { width: 390, height: 844 }, 'https://www.speak-algerian.com/vocabulary');
await run('games-mobile', { width: 390, height: 844 }, 'https://www.speak-algerian.com/games');

await browser.close();
fs.writeFileSync('/home/user/audit-darijago/tests/sa-smoke.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
