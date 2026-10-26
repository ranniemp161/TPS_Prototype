/* Programmes after the sales brochure (TJ, 26 Oct 2026): hero, the three per
   day prices on the carousel, the comparison table, no sideways scroll, no
   console errors, full page shots. Run from the prototype folder:
   node lab/programmes-brochure-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';

const outDir = process.cwd() + '/lab/shots/b6';
mkdirSync(outDir, { recursive: true });
const WANT = { '7 Days': '£360', '14 Days': '£298', '30 Days': '£224' };
const TOTAL = { '7 Days': '8 treatments', '14 Days': '15 treatments', '30 Days': '30 treatments' };
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/programmes.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);

  const title = await p.textContent('.pg-lengths__title');
  check(title.trim() === 'Live-in care programmes', `${w} hero title "${title.trim()}"`);

  // Drive the carousel as programmes-perday-shots.mjs does: it opens on 14
  // days, next goes to 30, next again loops round to 7.
  const read = () => p.evaluate(() => ({
    days: document.querySelector('[data-pg-days]').textContent,
    fee: document.querySelector('.pg-price__fee').textContent.replace(/\s+/g, ' ').trim(),
    total: (document.querySelector('[data-pg-treat]').textContent + ' treatments').replace(/\s+/g, ' ').trim(),
    live: document.querySelector('[data-pg-live]').textContent
  }));
  const seen = {};
  for (let i = 0; i < 3; i++) {
    if (i) { await p.click('[data-pg-next]'); await p.waitForTimeout(900); }
    const r = await read();
    seen[r.days] = r;
    console.log(w, JSON.stringify(r));
  }
  for (const d of Object.keys(WANT)) {
    const r = seen[d];
    check(!!r && r.fee === `from ${WANT[d]} per day`, `${w} ${d} card reads "from ${WANT[d]} per day" (got "${r && r.fee}")`);
    check(!!r && r.total === TOTAL[d], `${w} ${d} card total "${TOTAL[d]}" (got "${r && r.total}")`);
  }

  const m = await p.evaluate(() => {
    const t = document.querySelector('#what-is-included table');
    const txt = t ? t.textContent.replace(/\s+/g, ' ') : '';
    const wide = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.aurora, .sf__aurora, .pg-car, .nav, .menu'))
      .slice(0, 6).map(e => e.className || e.tagName);
    const ttl = document.querySelector('.pg-lengths__title').getBoundingClientRect();
    return {
      scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth,
      table: !!t, t8: txt.includes('8 treatments'), t15: txt.includes('15 treatments'), t30: txt.includes('30 treatments'),
      pricing: document.querySelector('.pg-pricing__list').textContent.replace(/\s+/g, ' ').trim(),
      breakdown: document.querySelector('.pg-price__more a').getAttribute('href'),
      ids: document.querySelectorAll('#what-is-included').length,
      titleW: Math.round(ttl.width), wide
    };
  });
  check(m.scroll === m.client, `${w} no sideways scroll (scrollWidth ${m.scroll}, clientWidth ${m.client}) ${m.wide.length ? 'wide: ' + m.wide.join(', ') : ''}`);
  check(m.table && m.t8 && m.t15 && m.t30, `${w} #what-is-included table with 8, 15 and 30 treatments`);
  check(m.breakdown === '#what-is-included' && m.ids === 1, `${w} breakdown link points at the one #what-is-included`);
  console.log(w, 'pricing band:', m.pricing, '| title width', m.titleW);
  check(errs.length === 0, `${w} no console errors ${errs.length ? JSON.stringify(errs) : ''}`);

  await p.screenshot({ path: `${outDir}/programmes-brochure-${w}.png`, fullPage: true });
  await p.close();
}
await b.close();
console.log(fails ? `${fails} FAILED` : 'ALL PASS');
process.exit(fails ? 1 : 0);
