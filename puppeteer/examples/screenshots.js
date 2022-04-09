const fs = require('fs');
const puppeteer = require('puppeteer');

function syncFolder(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
}

(async () => {
    const resourcesURL = "./puppeteer/resources/screenshots";
    syncFolder(resourcesURL);

    const browser = await puppeteer.launch({
        // headless: false, slowMo: 350
    });

    const page = await browser.newPage();

    await page.setViewport({width: 1920, height: 1080})

    await page.goto('https://ubuntu.com/');

    await page.click('#cookie-policy-button-accept');

    await page.screenshot({ path: `${resourcesURL}/ss1.png`, fullPage: true});

    const logo = await page.$(".p-navigation__image");
    await logo.screenshot({ path: `${resourcesURL}/ss-logo.png`});

    await page.emulateVisionDeficiency('achromatopsia');
    await page.screenshot({ path: `${resourcesURL}/achromatopsia.png`});

    await page.emulateVisionDeficiency('deuteranopia');
    await page.screenshot({ path: `${resourcesURL}/deuteranopia.png` });

    await page.emulateVisionDeficiency('blurredVision');
    await page.screenshot({ path: `${resourcesURL}/blurred-vision.png` });

    await page.emulateVisionDeficiency('protanopia');
    await page.screenshot({ path: `${resourcesURL}/protanopia.png` });

    await page.emulateVisionDeficiency('tritanopia');
    await page.screenshot({ path: `${resourcesURL}/tritanopia.png` });

    await browser.close();
})();