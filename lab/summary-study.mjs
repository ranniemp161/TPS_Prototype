import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
for (let i = 1; i <= 7; i++) { await p.click('[data-next]'); await p.waitForTimeout(900); }
for (let i = 8; i <= 12; i++) { await p.click('[data-next]'); await p.waitForTimeout(1500); await p.screenshot({ path: `lab/choice-study/sum${i}.png` }); const n = await p.evaluate(() => document.querySelector('[data-step-name]').textContent + ' | ' + document.querySelector('[data-next]').textContent); console.log(i, n); }
await b.close();
