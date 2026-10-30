const { chromium } = require('@playwright/test');

// Deliberately fixed checkpoint; advance these expectations with the editorial update.
(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const failures = [], errors = [];
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
        page.on('pageerror', error => errors.push(error.message));
        await page.clock.install({ time: new Date('2026-10-30T04:15:00Z') });
        await page.goto('http://localhost:3000/npl', { waitUntil: 'domcontentloaded' });
        const card = page.locator('section[aria-label="Match spotlight"],section[aria-label="मुख्य खेल"]');
        await card.getByText(/#07/).waitFor();
        await card.getByText('12:30 NPT').waitFor();
        for (const width of [320, 390, 768, 1280]) {
            await page.setViewportSize({ width, height: 950 });
            const fits = await card.evaluate(node => {
                const rect = node.getBoundingClientRect();
                return rect.left >= -1 && rect.right <= innerWidth + 1 && node.scrollWidth <= node.clientWidth + 1;
            });
            if (!fits) failures.push({ width, overflow: true });
            await card.screenshot({ path: `/tmp/npl-hero-${width}.png` });
        }
        await card.getByRole('button', { name: /Latest result|पछिल्लो नतिजा/ }).click();
        await card.getByText(/#06/).waitFor();
        if (!/187\/6/.test(await card.getByTestId('npl-score-karnali').innerText())) failures.push({ wrongWinnerScore: true });
        await card.screenshot({ path: '/tmp/npl-hero-result.png' });
        if (await card.getByRole('button', { name: /View scorecard|स्कोरकार्ड हेर्नुहोस्/ }).count()) failures.push({ unrelatedScorecard: true });
        await card.getByRole('link', { name: /View result source|नतिजाको स्रोत/ }).waitFor();
        await page.getByRole('button', { name: /^(Standings|अंक तालिका)$/ }).click();
        await page.getByRole('cell', { name: '+0.533', exact: true }).waitFor();
        await page.getByRole('button', { name: /^(Fixtures & Results|खेल तालिका)$/ }).click();
        if (await page.getByText(/16:30 NPT/).count()) failures.push({ staleFixtureTime: true });
        await page.getByText(/187\/6 \(19.5 ov\)/).nth(1).waitFor();
        console.log(JSON.stringify({ responsiveCases: 4, resultSwitch: 'passed', standings: 'passed', fixtures: 'passed', failures, errors }, null, 2));
        if (failures.length || errors.length) process.exitCode = 1;
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
