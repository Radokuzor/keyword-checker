import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

// Desktop
const desktop = await browser.newPage();
await desktop.setViewportSize({ width: 1280, height: 800 });
await desktop.goto('http://localhost:3001');
await desktop.fill('input', 'email marketing');
await desktop.click('button:text("Analyze")');
await desktop.waitForSelector('text=Results for', { timeout: 5000 });
await desktop.screenshot({ path: 'C:/Users/radOk/Desktop/kw-desktop-layout.png', fullPage: false });
console.log('Desktop screenshot saved');

// Mobile
const mobile = await browser.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto('http://localhost:3001');
await mobile.fill('input', 'email marketing');
await mobile.click('button:text("Analyze")');
await mobile.waitForSelector('text=Results for', { timeout: 5000 });
await mobile.screenshot({ path: 'C:/Users/radOk/Desktop/kw-mobile-layout.png', fullPage: true });
console.log('Mobile screenshot saved');

await browser.close();
