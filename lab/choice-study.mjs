import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
for (let i = 1; i <= 7; i++) { await p.click('[data-next]'); await p.waitForTimeout(1600); await p.screenshot({ path: `lab/choice-study/s${i}.png`, clip: { x: 0, y: 100, width: 1440, height: 720 } }); }
await b.close();
