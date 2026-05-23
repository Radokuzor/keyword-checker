import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto('http://localhost:3000');

// Click Bulk CSV
await page.click('button:text("Bulk CSV")');
await page.screenshot({ path: 'C:/Users/radOk/Desktop/kw-bulk-upload-tab.png' });
console.log('Bulk upload tab screenshot saved');

// Switch to paste tab
await page.click('button:text("Paste Keywords")');
await page.screenshot({ path: 'C:/Users/radOk/Desktop/kw-bulk-paste-tab.png' });
console.log('Bulk paste tab screenshot saved');

// Type some keywords
await page.fill('textarea', 'email marketing, content strategy, SEO audit, keyword research, link building');
await page.screenshot({ path: 'C:/Users/radOk/Desktop/kw-bulk-paste-filled.png' });
console.log('Bulk paste filled screenshot saved');

await browser.close();
