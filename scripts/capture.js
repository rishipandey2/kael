import puppeteer from 'puppeteer-core';
import path from 'path';

const OUT_DIR = 'C:/Users/rahul/.gemini/antigravity/brain/b4575e1e-8c4a-4851-b17e-0fb24ed027ef';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE_URL = 'http://localhost:4174';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop Dark
  console.log('Capturing Desktop Dark...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-dark.png') });

  // 2. Desktop Light
  console.log('Capturing Desktop Light...');
  await page.goto(`${BASE_URL}/?theme=light`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-light.png') });

  // 3. Tablet Light
  console.log('Capturing Tablet Light...');
  await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 1, isMobile: true });
  await page.goto(`${BASE_URL}/?theme=light`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'tablet-light.png') });

  // 4. Mobile Dark (iPhone 14/15/16)
  console.log('Capturing Mobile Dark...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-dark.png') });

  // 5. Mobile Light
  console.log('Capturing Mobile Light...');
  await page.goto(`${BASE_URL}/?theme=light`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-light.png') });

  // 6. Mobile Reminder Modal
  console.log('Capturing Mobile Reminder Modal...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.click('#task-reminder-btn');
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-reminder-picker.png') });

  // 7. Desktop Search Modal
  console.log('Capturing Desktop Search Modal...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.click('#topbar-search-btn');
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-search-modal.png') });

  await browser.close();
  console.log('All screenshots captured with exact device emulation.');
}

run().catch(console.error);
