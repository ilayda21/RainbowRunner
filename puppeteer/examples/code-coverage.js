const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage()
    ]);

    await page.goto('https://ubuntu.com/');

    // Retrive the coverage objects
    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
    ]);

    // Examine JS Coverage
    const js_coverage = [...jsCoverage];
    let js_used_bytes = 0;
    let js_total_bytes = 0;
    let covered_js = "";
    for (const entry of js_coverage) {
        js_total_bytes += entry.text.length;
        // console.log(`Total Bytes for ${entry.url}: ${entry.text.length}`);
        for (const range of entry.ranges){
            js_used_bytes += range.end - range.start - 1;
            covered_js += entry.text.slice(range.start, range.end) + "\n";
            
        }       
    }

    const used_js = ((js_used_bytes/js_total_bytes) *100).toFixed(2);
    console.log(`JS code used by ${used_js} %`);
    
    // Examine CSS Coverage
    const css_coverage = [...cssCoverage];
    let css_used_bytes = 0;
    let css_total_bytes = 0;
    let covered_css = "";
    for (const entry of css_coverage) {
        css_total_bytes += entry.text.length;
        // console.log(`Total Bytes for ${entry.url}: ${entry.text.length}`);
        for (const range of entry.ranges){
            css_used_bytes += range.end - range.start - 1;
            covered_css += entry.text.slice(range.start, range.end) + "\n";
        }       
    }

    const used_css = ((css_used_bytes/css_total_bytes) *100).toFixed(2);
    
    console.log(`CSS used by ${used_css}%`);

        
    await browser.close();
})();