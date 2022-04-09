const puppeteer = require('puppeteer');

// HELPER FUNCTIONS //

async function log(text) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(text);
}

async function getHighestScore (page) {
    const highestScore = await page.evaluate(() => {
        console.log("Hello from browser");
        const rowNodeList = document.querySelectorAll('#score-table tr');
        // Delete the first element
        const rowArray = Array.from(rowNodeList).slice(1);
        const highestScoreTr = rowArray[0];
        const dataNodeList = highestScoreTr.querySelectorAll('td');
        const dataArray = Array.from(dataNodeList);
        const [ place, name, score ] = dataArray.map(td => td.textContent);
        return score;
    });
    return highestScore;
}

async function findClosestEnemy(heroBoundingBox, enemies) {
    let closestEnemy;
    let minDist = 999999999;
    for (let enemy of enemies) {
        let enemyBoundingBox = await enemy.boundingBox();
        if (enemyBoundingBox) {
            let dist = enemyBoundingBox.x - heroBoundingBox.x; 
            if (dist > 0 && minDist > dist) {
                closestEnemy = enemy;
                minDist = dist;
            } 
        } 
    } 
    return closestEnemy;
}

///////////////////////////////////

(async () => {
    // 1. initialize pupeteer
    // 2. headless: false => determines weather the browser will be opened 
    // 5. defaultViewport => Opened browser has a default viewport, this can be disabled by passing this field null
    // 6.  args:['--start-maximized'] => Maximizes the browser window 
    const browser = await puppeteer.launch({
        // headless: false,
        // defaultViewport: null,
        // args:[
        //     '--start-maximized'
        // ]
    });

    // 7. Open a new page
    const page = await browser.newPage();
    
    // 8. Go to the URL
    await page.goto('file:///home/ilayda/workspace/PuppeteerExample/index.html');

    // 9. Fill the text field
    await page.$eval('input[name=username]', el => el.value = 'ilayda');
    
    // 10. Click the button
    await page.click("#username-submit");

    // 11. Open the leaderboard, close the leaderboard
    const leaderboardButton = await page.$("#btn-leaderboard");
    await leaderboardButton.click();
    const highestScore = await getHighestScore(page);
    await leaderboardButton.click();
    const finalScore = parseInt(highestScore) + 1;
    
    // 12. Start the game
    await page.click("button.play");

    // 13. Get current score
    let score = await page.$eval(".score", (element) => element.innerHTML);
    
    // 14. Get single element
    const hero = await page.$('[data-char="hero"]');

    // 15. Play the game
    while (!score.includes(finalScore)) {
        // 16. Get multiple elements
        const enemies = await page.$$('[data-char="enemy"]');
        
        // 17. Get the rainbow charater's current position information
        const heroBoundingBox =  await hero.boundingBox();
        const closestEnemy = await findClosestEnemy(heroBoundingBox, enemies);

        if (closestEnemy) {
            // 18. Find the X position of an element
            const closestEnemyXPosition = (await closestEnemy.boundingBox()).x;

            // 19. Find the classname of an element
            const closestEnemyType = await (await closestEnemy.getProperty('className')).jsonValue();
            
            // 20. Start to jump or crouch
            if (closestEnemyXPosition - heroBoundingBox.x <= heroBoundingBox.width + 70) {
                if (closestEnemyType === 'worm-like-enemy') {
                    await page.keyboard.press('ArrowUp');
                } else {
                    await page.keyboard.press('ArrowDown');
                }
            }

            // 21. Find the element and get the required property 
            score = await page.$eval(".score", (element) => element.innerHTML);
            log(`${score}`);
        }
    }

    // 22. Close the browser
    await browser.close();
})();