
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  const path = require('path');
  const uri = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  console.log('Navigating to', uri);
  await page.goto(uri);
  await page.waitForTimeout(4000);
  console.log('Clicking run btn...');
  await page.click('#run-btn');
  await page.waitForTimeout(4000);
  await browser.close();
})();
