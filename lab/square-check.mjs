// Square check (TJ, 2 Nov 2026; Opus). Coral 3 square: eleven palettes, no
// reach toggle, every corner square on six pages at two sizes, circles kept,
// colours equal to the default Coral, a saved Button only cleared, no errors.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const SHOTS = path.join(process.cwd(), 'lab', 'square-shots');
fs.mkdirSync(SHOTS, { recursive: true });
const url = (pg, q) => pathToFileURL(path.join(process.cwd(), 'index', pg + '.html')).href + q;
const SQ = '?panel=show&palette=coral-square';
const PAGES = ['index', 'programmes', 'build-your-programme', 'request-a-place', 'about', 'what-we-do'];
const SIZES = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const ONLY_SHOTS = process.argv.includes('--shots');
const b = await chromium.launch({ channel: 'chrome' });
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const errs = [];
async function page(vp) { const p = await b.newPage({ viewport: vp }); p.on('pageerror', e => errs.push(p.url().split('/').pop() + ': ' + e.message)); return p; }
async function load(p, pg, q) { await p.goto(url(pg, q)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500); }
async function openMenu(p) {
  const tab = p.locator('button.tab[data-tab="offerings"]').first();
  if (!(await tab.isVisible())) return false;
  await tab.hover(); await p.waitForTimeout(200);
  if ((await tab.getAttribute('aria-expanded')) !== 'true') await tab.click();
  await p.waitForTimeout(700);
  return (await tab.getAttribute('aria-expanded')) === 'true';
}

if (!ONLY_SHOTS) {
  // 1. the panel: eleven names in order, no Full or Button only toggle
  const NAMES = ['Coral 1 (darkest)', 'Coral 2', 'Coral 3 (today)', 'Coral 4', 'Coral 5 (lightest)',
    'Cognac 1 (darkest)', 'Cognac 2', 'Cognac 3 (today)', 'Cognac 4', 'Cognac 5 (lightest)', 'Coral 3 square'];
  {
    const p = await page(SIZES[0]); await load(p, 'index', SQ);
    const r = await p.evaluate(() => { const h = document.getElementById('tps-palette-panel'); const s = h && h.shadowRoot; if (!s) return null;
      return { rows: [...s.querySelectorAll('.row')].map(x => x.querySelector('.nm').textContent.trim()), tick: (s.querySelector('.row[data-id="coral-square"] .tick') || {}).textContent,
        toggle: !!s.querySelector('.tg, [data-r]') || /Full|Button only/.test(s.textContent) }; });
    ok(r && JSON.stringify(r.rows) === JSON.stringify(NAMES), 'panel lists eleven in order ' + JSON.stringify(r && r.rows));
    ok(r && !r.toggle, 'panel has no Full / Button only toggle');
    ok(r && r.tick === '✓', 'Coral 3 square row is ticked on coral-square');
    await p.close();
  }

  // 2. every corner square; circles stay circles
  const WALK = () => {
    const bad = [], circles = [];
    const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].join('.') : '');
    for (const el of document.querySelectorAll('*')) {
      if (el.closest('#tps-palette-panel') || el.closest('svg')) continue;
      if (el.matches('input[type=radio], input[type=checkbox]')) continue;
      for (const ps of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, ps);
        if (ps && (cs.content === 'none' || cs.content === 'normal')) continue;
        const rads = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius];
        if (rads.every(x => parseFloat(x) === 0)) continue;
        let w, h;
        if (ps) { w = parseFloat(cs.width); h = parseFloat(cs.height); } else { const bb = el.getBoundingClientRect(); w = bb.width; h = bb.height; }
        const rv = parseFloat(rads[0]);
        const circle = Math.abs(w - h) < 1.5 && rads.every(x => x === rads[0]) && (rads[0].includes('%') ? rv >= 50 : rv >= w / 2 - 0.5);
        if (circle) { if (w > 0) circles.push(name(el) + (ps || '')); continue; }
        bad.push(name(el) + (ps || '') + ' ' + rads.join(' ') + ' ' + Math.round(w) + 'x' + Math.round(h));
      }
    }
    return { bad: [...new Set(bad)], circles: [...new Set(circles)] };
  };
  async function prep(p, pg, vp) {
    await p.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
    let menu = null;
    if (pg === 'index' && vp.width >= 1100) {
      await openMenu(p);
      menu = await p.evaluate(() => { const m = document.querySelector('#panel-offerings'); return m && !m.hidden ? m.getBoundingClientRect().height : 0; });
    }
    await p.waitForTimeout(200);
    return menu;
  }
  for (const vp of SIZES) {
    const p = await page(vp);
    for (const pg of PAGES) {
      await load(p, pg, '?panel=show'); await prep(p, pg, vp);
      const base = await p.evaluate(WALK);
      await load(p, pg, SQ); const menu = await prep(p, pg, vp);
      const sq = await p.evaluate(WALK);
      if (menu !== null) ok(menu > 0, pg + ' ' + vp.width + ' desktop dropdown open during the walk (' + Math.round(menu) + 'px)');
      ok(!sq.bad.length, pg + ' ' + vp.width + ' no rounded corner on coral-square' + (sq.bad.length ? ' ' + JSON.stringify(sq.bad) : ''));
      const lost = base.circles.filter(c => !sq.circles.includes(c) && !/tg__sw::after/.test(c));
      ok(!lost.length, pg + ' ' + vp.width + ' circles kept (' + sq.circles.length + ' of ' + base.circles.length + ')' + (lost.length ? ' lost ' + JSON.stringify(lost) : ''));
    }
    await p.close();
  }

  // 3. colours equal the default Coral
  {
    const TOK = ['--acc', '--g-canvas', '--g-soft', '--g-tint', '--t-mute'];
    const p = await page(SIZES[0]);
    const read = async q => { await load(p, 'index', q); return p.evaluate(TOK => { const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
      const hex = c => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return '#' + [d[0], d[1], d[2]].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase(); };
      const cs = getComputedStyle(document.documentElement); const t = {}; for (const k of TOK) t[k] = hex(cs.getPropertyValue(k).trim()); return t; }, TOK); };
    const a = await read('?panel=show'), s = await read(SQ);
    ok(JSON.stringify(a) === JSON.stringify(s), 'coral-square colours equal the default Coral ' + JSON.stringify(s));
    ok(await p.evaluate(() => document.documentElement.getAttribute('data-palette')) === 'coral-square', 'coral-square attribute kept');

    // 4. a saved Button only is cleared
    await p.evaluate(() => localStorage.setItem('tps-reach', 'button'));
    await load(p, 'index', '?panel=show');
    const r = await p.evaluate(() => ({ attr: document.documentElement.getAttribute('data-reach'), key: localStorage.getItem('tps-reach') }));
    ok(r.attr === null && r.key === null, 'saved tps-reach=button cleared, no data-reach ' + JSON.stringify(r));
    await load(p, 'index', '?panel=show&reach=button');
    const r2 = await p.evaluate(() => ({ attr: document.documentElement.getAttribute('data-reach'), key: localStorage.getItem('tps-reach') }));
    ok(r2.attr === null && r2.key === null, '?reach=button ignored ' + JSON.stringify(r2));
    // Copy link carries no reach
    const link = await p.evaluate(async () => { const s = document.getElementById('tps-palette-panel').shadowRoot; s.querySelector('.pill').click();
      let got = null;
      try { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { got = t; return Promise.resolve(); } } }); } catch (e) {}
      s.querySelector('.cp').click(); await new Promise(r => setTimeout(r, 200)); return got; });
    ok(link && !/reach=/.test(link) && /palette=coral-square/.test(link), 'Copy link has no reach parameter ' + link);
    await p.close();
  }
}

// 5. screenshots on coral-square
async function shotAt(p, sel, file, block = 'start') {
  const el = p.locator(sel).first();
  if (!(await el.count())) { console.log('     no ' + sel); return; }
  await el.evaluate((e, block) => { const y = e.getBoundingClientRect().top + scrollY; window.scrollTo(0, block === 'center' ? y - (innerHeight - e.offsetHeight) / 2 : y - 80); }, block);
  await p.waitForTimeout(1800);
  await p.screenshot({ path: path.join(SHOTS, file) });
}
{
  const p = await page(SIZES[0]);
  await load(p, 'index', SQ);
  await p.screenshot({ path: path.join(SHOTS, 'home-hero-1440.png') });
  await openMenu(p); await p.screenshot({ path: path.join(SHOTS, 'home-dropdown-1440.png') });
  await load(p, 'index', SQ);
  await shotAt(p, '.film__stage', 'home-film-1440.png', 'center');
  await shotAt(p, '#care', 'home-care-cards-1440.png');
  await shotAt(p, '.gal', 'home-programmes-gallery-1440.png', 'center');
  await load(p, 'programmes', SQ); await p.screenshot({ path: path.join(SHOTS, 'programmes-hero-card-1440.png') });
  await load(p, 'build-your-programme', SQ); await p.screenshot({ path: path.join(SHOTS, 'bespoke-first-1440.png') });
  await load(p, 'request-a-place', SQ); await p.screenshot({ path: path.join(SHOTS, 'check-your-dates-1440.png') });
  await p.close();
  const m = await page(SIZES[1]);
  await load(m, 'index', SQ); await m.screenshot({ path: path.join(SHOTS, 'home-hero-390.png') });
  await load(m, 'programmes', SQ); await shotAt(m, '.pg-card', 'programmes-card-390.png');
  await m.close();
}
ok(!errs.length, 'no page errors ' + JSON.stringify(errs));
await b.close();
console.log(fails ? fails + ' FAILED' : 'all ok');
