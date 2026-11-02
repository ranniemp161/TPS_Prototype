// Gap from the bath's bottom edge to the What is Postpartum Care heading (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1280, 720], [1920, 1080], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  console.log(w + 'x' + h, JSON.stringify(await p.evaluate(() => {
    const bath = document.querySelector('.act--bath').getBoundingClientRect();
    const turn = document.querySelector('.act--turn').getBoundingClientRect();
    const hd = document.querySelector('#confinement-heading').getBoundingClientRect();
    const s = getComputedStyle(document.querySelector('.act--turn'));
    return { bathToHeading: Math.round(hd.top - bath.bottom), turnTopVsBath: Math.round(turn.top - bath.bottom), padTop: s.paddingTop, marginTop: s.marginTop };
  })));
  await p.close();
}
await b.close();
