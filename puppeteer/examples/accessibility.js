const puppeteer = require('puppeteer');

function findFocusedNode(node) {
    if (node.focused)
        return node
    for (const child of node.children || []) {
        const foundNode = findFocusedNode(child);
        if (foundNode)
            return foundNode;
    }
    return null;
}

async function updateSnapshot(page) {
    let snapshot = await page.accessibility.snapshot();
    return findFocusedNode(snapshot);
}

(async () => {
    const browser = await puppeteer.launch({
        // headless: false, 
        // slowMo: 500
    });
    const page = await browser.newPage();

    await page.goto('https://ubuntu.com');
    
    await page.keyboard.press("Enter");

    let snapshot = await page.accessibility.snapshot();
    console.log(snapshot)

    await page.keyboard.press("Tab");
    let n = await updateSnapshot(page);
    
    while (!n || n.name !== "Products") {
        await page.keyboard.press("Tab");
        n = await updateSnapshot(page);
        console.log(`Current focused element: ${n.name}`);
    }

    await page.keyboard.press("Enter");
    n = await updateSnapshot(page);
    console.log(`${n.name} element is expanded.`);
    console.log(n);
    await browser.close();
})();