// Loads the published site in a real browser and fails if it is broken in a
// way HTTP status codes cannot see: a JS exception, a missing image, a
// stylesheet that 404s. A deploy can be perfectly green and still show the
// client a half-rendered page, and that is the case this catches.
import { chromium } from 'playwright';

const SITE = process.env.SITE ?? 'https://ranniemp161.github.io/TPS_Prototype/';

// Requests we do not control and will not fail the build over. The page is
// still checked for whether it rendered; this only stops a third-party blip
// from crying wolf.
const THIRD_PARTY = [/fonts\.googleapis\.com/, /fonts\.gstatic\.com/, /cdnjs\.cloudflare\.com/];
const isThirdParty = (url) => THIRD_PARTY.some((re) => re.test(url));

const problems = [];
const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`console error: ${m.text()}`);
});
page.on('pageerror', (e) => problems.push(`uncaught exception: ${e.message}`));
page.on('requestfailed', (r) => {
  if (!isThirdParty(r.url())) problems.push(`request failed: ${r.url()} (${r.failure()?.errorText})`);
});
page.on('response', (r) => {
  if (r.status() >= 400 && !isThirdParty(r.url())) problems.push(`HTTP ${r.status()}: ${r.url()}`);
});

const response = await page.goto(SITE, { waitUntil: 'load', timeout: 45000 });
if (!response || !response.ok()) problems.push(`root returned HTTP ${response?.status() ?? 'no response'}`);

// Give the intro animation a beat; a headline that is still faded in at
// capture time is not a failure, but an empty one is.
await page.waitForTimeout(2500);

const heading = (await page.locator('h1').first().innerText().catch(() => '')).trim();
if (!heading) problems.push('no <h1> text found - the page may not have rendered');

const styled = await page.evaluate(() => {
  const sheets = [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.getAttribute('href'));
  return { sheets, hasV1: sheets.some((h) => h && h.includes('v1.css')) };
});
if (!styled.hasV1) problems.push(`v1.css is not linked from the root page (found: ${styled.sheets.join(', ')})`);

await browser.close();

console.log(`site     : ${SITE}`);
console.log(`headline : ${heading || '(none)'}`);
console.log(`styles   : ${styled.sheets.join(', ')}`);

if (problems.length) {
  console.log('\nProblems:');
  for (const p of problems) console.log(`  - ${p}`);
  console.log(`\n::error::Smoke test found ${problems.length} problem(s) on the live site.`);
  process.exit(1);
}
console.log('\nOK - live site loads clean.');
