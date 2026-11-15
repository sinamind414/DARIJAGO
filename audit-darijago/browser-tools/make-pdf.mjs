import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(pathToFileURL('../rapport-audit.html').href, { waitUntil: 'networkidle' });
await page.pdf({
  path: '../RAPPORT-AUDIT-DARIJAGO.pdf',
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:8px;color:#6b7280;width:100%;text-align:right;padding-right:16mm;">Audit DARIJAGO — 14/11/2026</div>',
  footerTemplate: '<div style="font-size:8px;color:#6b7280;width:100%;text-align:center;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' }
});
await browser.close();
console.log('PDF OK');
