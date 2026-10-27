// Restyle chat 6: step 07 (What matters most) as Device D rows. node lab/bespoke-restyle-6-check.mjs <outdir>
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2] || 'lab/bespoke-restyle-6';
const b = await chromium.launch({ channel: 'chrome' });
const url = pathToFileURL(process.cwd() + '/index/build-your-programme.html').href;
let fails = 0;
const ok = (n, c, i = '') => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + n + (i ? '  ' + i : '')); };
const NAMES = ['p-sleep', 'p-recovery', 'p-baby', 'p-food', 'p-house', 'p-family'];
const PICK = ['p-sleep', 'p-baby', 'p-house'];
for (const [w, h, tag] of [[1440, 900, '1440'], [390, 844, '390']]) {
  console.log('--- ' + w);
  const p = await b.newPage({ viewport: { width: w, height: h } });
  try { await p.goto(url, { timeout: 45000 }); } catch { await p.goto(url, { timeout: 60000 }); }
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  await p.evaluate(i => { const d = document.querySelector('[data-deck]'); d.scrollTo({ left: i * d.clientWidth, behavior: 'instant' }); }, 7);
  await p.waitForTimeout(1600);
  for (const n of PICK) { await p.click(`.prio:has(input[name="${n}"])`); await p.waitForTimeout(400); }
  await p.waitForTimeout(600);
  const st = await p.evaluate(names => names.map(n => {
    const i = document.querySelector(`input[name="${n}"]`);
    const dot = document.querySelector(`input[name="${n}"] + .dk-dot`);
    return { n, checked: i.checked, dot: getComputedStyle(dot, '::before').backgroundColor };
  }), NAMES);
  for (const s of st) {
    const want = PICK.includes(s.n);
    ok(`${s.n} ${want ? 'ticked' : 'unticked'} ${w}`, s.checked === want && (want ? s.dot === 'rgb(179, 74, 42)' || s.dot !== 'rgba(0, 0, 0, 0)' : true), `dot ${s.dot}`);
  }
  const fill = await p.evaluate(names => names.map(n => getComputedStyle(document.querySelector(`input[name="${n}"] + .dk-dot`), '::before').backgroundColor), NAMES);
  const filled = fill.map((c, k) => PICK.includes(NAMES[k]) ? c : null).filter(Boolean);
  const empty = fill.map((c, k) => !PICK.includes(NAMES[k]) ? c : null).filter(Boolean);
  ok(`three dots filled, three empty ${w}`, filled.every(c => c === filled[0] && c !== 'rgba(0, 0, 0, 0)') && empty.every(c => c !== filled[0]), `filled ${filled[0]} empty ${empty[0]}`);
  const rows = await p.evaluate(() => [...document.querySelectorAll('.prio')].map(el => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, bl: cs.borderLeftWidth, br: cs.borderRightWidth, bb: cs.borderBottomWidth, bt: cs.borderTopWidth, top: el.getBoundingClientRect().top, left: el.getBoundingClientRect().left };
  }));
  ok(`every .prio transparent, no side or bottom border ${w}`, rows.length === 6 && rows.every(r => r.bg === 'rgba(0, 0, 0, 0)' && r.bl === '0px' && r.br === '0px' && r.bb === '0px'), JSON.stringify(rows.map(r => [r.bg, r.bt])));
  const tops = rows.map(r => r.bt);
  const expectTop = w === 1440 ? ['0px', '0px', '1px', '1px', '1px', '1px'] : ['0px', '1px', '1px', '1px', '1px', '1px'];
  ok(`hairline above all but first in each column ${w}`, JSON.stringify(tops) === JSON.stringify(expectTop), JSON.stringify(tops));
  const ov = await p.evaluate(() => ({ doc: document.documentElement.scrollWidth - document.documentElement.clientWidth, step: (() => { const s = document.getElementById('step-07'); return s.scrollWidth - s.clientWidth; })() }));
  ok(`no horizontal overflow ${w}`, ov.doc <= 0 && ov.step <= 0, JSON.stringify(ov));
  const cnt = await p.evaluate(() => { const c = document.querySelector('[data-prio-count]'); return { hidden: c.hidden, text: c.textContent.trim() }; });
  ok(`prio count shows ${w}`, !cnt.hidden && cnt.text.length > 0, JSON.stringify(cnt));
  const cols = await p.evaluate(() => getComputedStyle(document.querySelector('.priorities')).gridTemplateColumns);
  console.log('grid columns', cols);
  await p.locator('#step-07').screenshot({ path: `${out}/step07-${tag}.png` });
  await p.close();
}
await b.close();
console.log(fails ? `FAILED ${fails}` : 'ALL OK');
process.exit(fails ? 1 : 0);
