const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on('request', (request) => {
    console.log('>>', request.method(), request.url())
    if (request.resourceType() === 'image') request.abort()
    else request.continue()
  });

  page.on('response', (response) => {
    console.log('<<', response.status(), response.url());
  });

  await page.goto('https://jaas.ai/');
  await page.screenshot({ path: 'screenshot.png', fullPage: true});
  await browser.close();
})()
