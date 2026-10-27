/* Start screen layout check (TJ, 13 Oct 2026): photo top and foot level with the words, title on one line. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1835, 605], [1280, 800], [1024, 768], [390, 844], [360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const m = await p.evaluate(() => {
    const r = s => document.querySelector(s).getBoundingClientRect();
    const h1 = r('.dk-h1--start'), copy = r('.dk-start__copy'), fr = r('.dk-start__frame'), note = r('.dk-start .dk-note'), deck = r('[data-deck]');
    const h = document.querySelector('.dk-h1--start'); const lh = parseFloat(getComputedStyle(h).lineHeight);
    return { h1px: Math.round(parseFloat(getComputedStyle(h).fontSize)), h1Lines: Math.round(h1.height / lh), h1Over: Math.round(h.scrollWidth - h.clientWidth),
      copyTop: Math.round(copy.top), frameTop: Math.round(fr.top), noteBottom: Math.round(note.bottom), frameBottom: Math.round(fr.bottom), frameW: Math.round(fr.width), copyW: Math.round(copy.width),
      inDeck: fr.bottom <= deck.bottom + 1 && copy.bottom <= deck.bottom + 1, fit: document.querySelector('.dk').getAttribute('data-fit'), tight: document.querySelector('.dk-page--start').classList.contains('is-tight') };
  });
  console.log(w + 'x' + h, JSON.stringify(m));
  await p.screenshot({ path: `lab/bespoke-header/layout-${w}x${h}.png` });
  await p.close();
}
await b.close();
