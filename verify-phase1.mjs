import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:3001');

// 1. Check background
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
console.log('Body bg:', bg);

// 2. Header
const headerText = await page.textContent('header');
console.log('Header:', headerText?.trim().slice(0, 60));

// 3. Hero headline
const h1 = await page.textContent('h1');
console.log('H1:', h1?.trim());

// 4. Input placeholder
const ph = await page.getAttribute('input', 'placeholder');
console.log('Placeholder:', ph);

await page.screenshot({ path: 'C:/Users/radOk/Desktop/kw-before.png' });
console.log('Screenshot: kw-before.png');

// 5. Type and search
await page.fill('input', 'email marketing');
await page.click('button:text("Analyze")');
console.log('Clicked Analyze');

// Loading skeleton
await page.waitForTimeout(200);
const hasSpinner = await page.locator('.animate-spin').count();
console.log('Spinner count:', hasSpinner);

// Wait for results
await page.waitForSelector('text=Results for', { timeout: 5000 });
console.log('Results appeared');

await page.screenshot({ path: 'C:/Users/radOk/Desktop/kw-results.png', fullPage: true });
console.log('Screenshot: kw-results.png');

// 6. Card section labels
const labels = await page.locator('p.uppercase').allTextContents();
console.log('Card labels:', labels);

// 7. Recommended keyword chips
const chips = await page.locator('div:has(> p:text("Related Keywords")) button').allTextContents();
console.log('Chips:', chips);

// 8. Click a chip
if (chips.length > 0) {
  await page.locator('div:has(> p:text("Related Keywords")) button').first().click();
  await page.waitForTimeout(200);
  const hasSpinner2 = await page.locator('.animate-spin').count();
  console.log('Spinner after chip click:', hasSpinner2);
  await page.waitForSelector('text=Results for', { timeout: 5000 });
  await page.screenshot({ path: 'C:/Users/radOk/Desktop/kw-chip-result.png', fullPage: true });
  console.log('Chip re-search worked, screenshot: kw-chip-result.png');
}

await browser.close();
console.log('DONE');
