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

  // Test iPhone standalone launch screen simulation
  console.log('Capturing iPhone Launch Screen...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  
  // Set html background dark so there's never a white flash
  await page.evaluateOnNewDocument(() => {
    document.documentElement.style.backgroundColor = '#0B0B0C';
  });

  // Navigate but take snapshot immediately before launch screen dismisses
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(OUT_DIR, 'iphone-launch-screen.png') });

  // Wait for main app to fully settle
  console.log('Capturing Mobile Dark after launch...');
  await page.waitForNetworkIdle();
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-dark.png') });

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

  // 5. Mobile Light
  console.log('Capturing Mobile Light...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${BASE_URL}/?theme=light`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-light.png') });

  await browser.close();
  console.log('All verification captures completed successfully.');
}

run().catch(console.error);
