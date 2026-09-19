import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));
await p.waitForTimeout(500); // let the page settle before the run starts

const peakTop = await p.evaluate(() => document.querySelector('.act--peak').offsetTop);

const read = () => p.evaluate(() => ({
  night: +getComputedStyle(document.querySelector('.dissolve__night')).opacity,
  plate: +getComputedStyle(document.querySelector('.act--peak .plate')).opacity,
}));

// Simulate a real, fast wheel-scroll arrival: many small steps in quick
// succession rather than one teleport, which is what a determined scroller
// actually produces and what scrub is built to smooth.
console.log('fast continuous scroll through arrival + 1400px, sampled every 100ms:');
let y = peakTop - 400;
await p.evaluate(v => scrollTo(0, v), y);
await p.waitForTimeout(150);

const start = Date.now();
const target = peakTop + 1400;
const steps = 20;
for (let i = 0; i <= steps; i++) {
  y = (peakTop - 400) + (target - (peakTop - 400)) * (i / steps);
  await p.evaluate(v => scrollTo(0, v), y);
  await p.waitForTimeout(60);
  const r = await read();
  console.log(`t=${Date.now() - start}ms  scrollY≈${Math.round(y)}  night=${r.night.toFixed(3)}  plate=${r.plate.toFixed(3)}`);
}

await b.close();
