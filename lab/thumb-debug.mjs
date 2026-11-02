// Debug: number span with the clip off, half transparent, to see its photo's alignment (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await p.evaluate(() => document.querySelector('.gal__list').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(() => { const s = document.querySelectorAll('.gal__num')[1]; const c = getComputedStyle(s); return [c.backgroundPosition, c.backgroundSize, c.backgroundOrigin, c.transform, c.opacity, getComputedStyle(s.parentElement).transform, getComputedStyle(s.parentElement.querySelector('img')).objectPosition]; })));
await p.addStyleTag({ content: '.gal__num { -webkit-background-clip: border-box !important; background-clip: border-box !important; opacity: .5 !important; -webkit-text-fill-color: red !important; }' });
await p.waitForTimeout(500);
await p.locator('.gal__list').screenshot({ path: path.join(OUT, 'thumb-debug-390.png') });
await b.close();
