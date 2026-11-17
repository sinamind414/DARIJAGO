import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('file:///home/user/analyse-speak-algerian/bilan.html', { waitUntil: 'networkidle' });
await page.pdf({
  path: '/home/user/analyse-speak-algerian/BILAN-FINAL-SPEAK-ALGERIAN.pdf',
  format: 'A4', printBackground: true, displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:8px;color:#6b7280;width:100%;text-align:right;padding-right:16mm;">Bilan final — Speak Algerian / DZLingo / DARIJAGO · 15/11/2026</div>',
  footerTemplate: '<div style="font-size:8px;color:#6b7280;width:100%;text-align:center;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  margin: { top: '18mm', bottom: '18mm', left: '15mm', right: '15mm' }
});
await browser.close();
console.log('PDF OK');
