import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:4599';

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--force-prefers-reduced-motion=no-preference']
});

const page = await browser.newPage();
await page.emulate({
    viewport: { width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
    userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
});

const read = () =>
    page.evaluate(() => document.querySelector('meta[name="theme-color"]')?.content ?? 'MISSING');

const scrollTo = async (y) => {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await new Promise((r) => setTimeout(r, 250));
};

for (const path of ['/', '/about', '/contact', '/services', '/services/leaders']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 800));

    const ssr = await page.evaluate(() =>
        document.querySelector('meta[name="theme-color"]')?.content
    );
    const top = await read();

    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await scrollTo(Math.round(h * 0.35));
    const mid = await read();

    await scrollTo(h);
    const bottom = await read();

    const footerTop = await page.evaluate(() => {
        const f = document.querySelector('#footer');
        return f ? Math.round(f.getBoundingClientRect().top) : null;
    });

    console.log(
        `${path.padEnd(20)} ssr=${ssr}  top=${top}  mid=${mid}  bottom=${bottom}  footerTop=${footerTop}`
    );
}

await browser.close();
