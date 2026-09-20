/* Full page shot of the programme builder, with every scroll entrance
 * triggered first.
 *
 *   node lab/programme-shot.mjs <url> <out.png> [width]
 *
 * lab/shot.mjs already takes a full page shot, but it fires the camera
 * before anything has scrolled, so every section still carrying a `.rise`
 * comes out at zero opacity. This walks the document first, waits for the
 * observer, then returns to the top so the sticky summary is where a
 * visitor first meets it.
 *
 * WHAT A FULL PAGE SHOT CANNOT SHOW YOU: it resizes the viewport to the
 * height of the document, so every `vh` unit and every `100vh` cap goes
 * slack. A summary panel capped to the window height looks perfect here
 * and lays its buttons across the care areas on a real phone. Anything
 * that depends on the window being a window belongs in
 * lab/programme-panel.mjs, which measures at real viewport sizes.
 */
import { chromium } from 'playwright-core';

const [url, out, w = '1440'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: 900 } });

await p.goto(url, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);

await p.evaluate(async () => {
  // v1.css sets scroll-behavior: smooth on html, so scrollTo animates and
  // the walk below finishes before the page has arrived anywhere. Without
  // this the observer never fires and every section shoots at zero opacity.
  document.documentElement.style.scrollBehavior = 'auto';
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 90));
  }
  window.scrollTo(0, 0);
});
await p.waitForTimeout(900);

const info = await p.evaluate(() => ({
  h: document.documentElement.scrollHeight,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  unrevealed: document.querySelectorAll('.rise:not(.is-in)').length
}));

await p.screenshot({ path: out, fullPage: true });
console.log(`${w}px wide, document ${info.h}px, horizontal overflow ${info.overflow}px, sections still unrevealed ${info.unrevealed}`);
await b.close();
