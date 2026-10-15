const assert = require('node:assert/strict');
const loader = require('./load-ts.cjs');
const { responseContract } = loader()('src/api/contracts.ts');
const { estimateReadingMinutes } = loader()('src/utils/editorial.ts');
const base = process.argv[2] || 'http://127.0.0.1:3001';
async function get(route) {
    const response = await fetch(base + route, { signal: AbortSignal.timeout(25000) });
    const body = await response.json();
    assert.equal(response.ok && body.success, true, `${route}: ${body.error || response.status}`);
    const contract = responseContract(route); return contract ? contract.parse(body.data) : body.data;
}
(async () => {
    const home = await get('/api/v1/home');
    assert.ok(home.articles.length, 'Smoke test needs a published article');
    const first = home.articles[0];
    const detail = await get('/api/v1/articles/' + encodeURIComponent(first.slug));
    assert.equal(detail.readingMinutes.en, estimateReadingMinutes(detail.content.en));
    assert.equal(detail.readingMinutes.ne, estimateReadingMinutes(detail.content.ne));
    const author = first.author.en || first.author.ne;
    const results = await get('/api/v1/articles?author=' + encodeURIComponent(author));
    assert.ok(results.items.length);
    assert.ok(results.items.every(item => item.author.en.toLowerCase() === author.toLowerCase() || item.author.ne.toLowerCase() === author.toLowerCase()));
    const absent = await get('/api/v1/articles?author=NoSuchAuthor-SmokeTest'); assert.equal(absent.items.length, 0);
    const search = await get('/api/v1/search?q=' + encodeURIComponent(author)); assert.ok(search.authors.some(name => name.en === author || name.ne === author));
    if (home.leadBrief) { const brief = await get('/api/v1/briefs/' + encodeURIComponent(home.leadBrief.slug)); assert.ok(brief.content.en || brief.content.ne); }
    await get('/api/v1/authors');
    console.log('Live API smoke passed: home, full reader, reading times, author filter, author search, authors directory and brief reader.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
