import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));

// Scroll to the peak the instant it exists, before the entrance settles.
const peakTop = await p.evaluate(() => document.querySelector('.act--peak').offsetTop);
await p.evaluate(y => scrollTo(0, y + 5), peakTop);

const read = () => p.evaluate(() => {
  const night = document.querySelector('.dissolve__night');
  const heading = document.querySelector('.act--peak [data-kinetic]');
  const plate = document.querySelector('.act--peak .plate');
  return {
    nightOpacity: +getComputedStyle(night).opacity,
    headingText: heading ? heading.textContent.trim() : null,
    headingLineOpacity: heading ? getComputedStyle(heading.querySelector('.kin-line > span')).opacity : null,
    plateOpacity: +getComputedStyle(plate).opacity,
    isReady: document.querySelector('.act--peak').classList.contains('is-ready'),
  };
});

console.log('immediately on arrival, before entrance settles:');
console.log(await read());

// Try to force the crossfade during the entrance window by scrolling hard.
await p.evaluate(y => scrollTo(0, y + 900), peakTop);
await p.waitForTimeout(200);
console.log('\n200ms in, scrolled 900px into the act, entrance still running:');
console.log(await read());

await p.waitForTimeout(1300);
console.log('\nafter entrance window (1500ms total), same scroll position:');
console.log(await read());

// Now scroll further and confirm the crossfade actually responds.
await p.evaluate(y => scrollTo(0, y + 2400), peakTop);
await p.waitForTimeout(300);
console.log('\nscrolled deeper into the act, after entrance has cleared:');
console.log(await read());

await p.screenshot({ path: `${out}/peak-entrance.png` });
await b.close();
