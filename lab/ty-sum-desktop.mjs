/* Tailored For You at 1440: the summary line must still read as one sentence. node lab/ty-sum-desktop.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.waitForTimeout(1200);
console.log(JSON.stringify(await p.evaluate(() => { const e = document.querySelector('.ty__sum'); return [e.innerText, Math.round(e.getBoundingClientRect().height), getComputedStyle(e).fontSize, getComputedStyle(e.querySelector('.ty__br')).display]; })));
await b.close();
