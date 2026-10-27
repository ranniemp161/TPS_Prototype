/* Tailored For You on desktop windows of many sizes (TJ, 12 Oct 2026): which mode it takes
   (held, tight, calm), and whether the card holds its words closed and open.
   node lab/ty-fit-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const sizes = [[1835, 605], [1440, 900], [1440, 800], [1440, 760], [1440, 700], [1366, 768], [1536, 864], [1280, 720], [1280, 640], [1920, 520], [960, 540], [1920, 1080]];
const b = await chromium.launch({ channel: 'chrome' });
for (const [W, H] of sizes) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href, { timeout: 60000 });
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
  const mode = await p.evaluate(() => { const t = document.querySelector('[data-ty]'); return t.classList.contains('is-calm') ? 'calm' : t.classList.contains('is-tight') ? 'tight' : 'held'; });
  const top = await p.evaluate(() => document.querySelector('[data-ty]').getBoundingClientRect().top + scrollY);
  // held: the scroll point where the photograph has landed and the card is in; calm: the card in view
  await p.evaluate(([y, m]) => scrollTo(0, m === 'calm' ? y + 40 : y + innerHeight * 1.6), [top, mode]); await p.waitForTimeout(1300);
  const fit = () => p.evaluate(() => {
    const c = document.querySelector('[data-ty] .ty__card'), r = c.getBoundingClientRect(), kids = [...c.children].map(k => k.getBoundingClientRect());
    const tb = Math.min(...kids.map(k => k.top)), bb = Math.max(...kids.map(k => k.bottom));
    const tg = document.querySelector('[data-ty] .tl-readmore__toggle').getBoundingClientRect();
    const hit = document.elementFromPoint(tg.left + tg.width / 2, tg.top + tg.height / 2);
    return { card: [Math.round(r.width), Math.round(r.height)], spillTop: Math.round(r.top - tb + 0), spillBottom: Math.round(bb - r.bottom), toggleFree: !!(hit && hit.closest('.tl-readmore__toggle')) };
  });
  const closed = await fit();
  await p.screenshot({ path: `${out}/F-${W}x${H}-closed.png` });
  await p.evaluate(() => document.querySelector('[data-ty] .tl-readmore__toggle').click()); await p.waitForTimeout(1600);
  const open = await fit();
  await p.screenshot({ path: `${out}/F-${W}x${H}-open.png` });
  const ovx = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(`${W}x${H}`.padEnd(10), mode.padEnd(6), 'closed', JSON.stringify(closed), 'open', JSON.stringify(open), ovx ? 'OVERFLOW-X' : '', errs.length ? 'ERR ' + errs.join('|') : '');
  await p.close();
}
await b.close();
