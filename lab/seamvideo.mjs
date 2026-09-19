/* Records the actual wheel-scroll handoff from the wipe finishing into the
   pin engaging, as video, so a stutter or snap can be seen rather than
   inferred from sampled frames. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({
  viewport: { width: 1600, height: 900 },
  recordVideo: { dir: out, size: { width: 1600, height: 900 } },
});
const p = await ctx.newPage();
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));

const actTop = await p.evaluate(() =>
  document.querySelector('.act--peak').getBoundingClientRect().top + scrollY
);

// Start a little before the wipe begins, end well after the pin has taken
// hold, moving in small real wheel-sized steps rather than teleporting.
await p.evaluate(v => scrollTo(0, v), actTop - 700);
await p.waitForTimeout(400);

for (let i = 0; i < 60; i++) {
  await p.mouse.wheel(0, 40);
  await p.waitForTimeout(45);
}

await p.waitForTimeout(500);
await ctx.close();
await b.close();
console.log('done');
