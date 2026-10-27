// Restyle chat 7, rewritten 13 Oct 2026 (TJ: the end of the walk was merged into ONE screen, "Your programme", builder-decide).
// node lab/bespoke-summary-check.mjs <outdir>
// DROPPED on purpose: the old summary screens (built areas, Change links data-goto 2,4,5,6,9), the care budget recommender
// (Apply, #budget), the Book a call screen and its name="call" radios. None of them is a screen any more.
// KEPT in spirit: the fee matches the bar, the stay changes the fee, the summary text is kept for Calendly and the email, one ember button, no overflow.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
const out = process.argv[2] || 'lab/funnel';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
let fails = 0;
const ok = (n, c, d = '') => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + n + (d ? '  ' + d : '')); };
const sec = '[data-section="builder-decide"]';
for (const [w, h] of [[1440, 900], [390, 844]]) {
  console.log('--- ' + w);
  const ctx = await b.newContext({ viewport: { width: w, height: h }, permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/calendly.com/**', r => r.abort());
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const name = () => p.evaluate(() => document.querySelector('[data-step-name]').textContent);
  const next = async () => { await p.click('[data-next]'); await p.waitForTimeout(1000); };
  const walkTo = async (target) => { for (let k = 0; k < 30 && (await name()) !== target; k++) await next(); };
  const feeOf = () => p.evaluate((sec) => ({ sum: document.querySelector(sec + ' .dk-sumfee').textContent.trim(), bar: document.querySelector('.dk-fee__amount').textContent.trim() }), sec);
  await next(); await p.evaluate(v => { const f = document.getElementById('due'); f.value = v; f.dispatchEvent(new Event('input', { bubbles: true })); }, '2027-03-15'); await p.waitForTimeout(300);   // the due date screen blocks Next until a date is in
  await walkTo('Your programme');
  await p.waitForTimeout(800);
  const f5 = await feeOf();
  ok('Your programme: fee matches the bar', f5.sum === f5.bar && /^£[\d,]+$/.test(f5.sum), f5.sum + ' / ' + f5.bar);
  // back to How long, choose 14 days, forward again
  // Change is gone from the screen (TJ, 13 Oct 2026): Back does its job. Step back to How long.
  for (let k = 0; k < 12 && (await name()) !== 'How long'; k++) { await p.click('[data-back]'); await p.waitForTimeout(1000); }
  ok('Back returns to How long', (await name()) === 'How long', await name());
  await p.click('.tg:has(input[name="days"][value="14"])'); await p.waitForTimeout(700);
  await walkTo('Your programme'); await p.waitForTimeout(1500);
  const f14 = await feeOf();
  ok('fee changes when 14 days is chosen and still matches the bar', f14.sum === f14.bar && f14.sum !== f5.sum, f5.sum + ' -> ' + f14.sum);
  const m = await p.evaluate((sec) => {
    const s = document.querySelector(sec);
    const prim = [...document.querySelectorAll('.btn--primary')].filter(e => !e.matches('a.dk-decide__book') && !e.matches('.capture__btn') && !e.matches('[data-next]'));
    const nx = document.querySelector('[data-next]');
    return { title: s.querySelector('[data-built-title]').textContent.trim(), cols: s.querySelector('[data-shape-grid]').children.length,
      prim: prim.map(e => e.className), nextHidden: getComputedStyle(nx).visibility === 'hidden',
      ovx: document.documentElement.scrollWidth > innerWidth, secOvx: s.scrollWidth > s.clientWidth };
  }, sec);
  ok('built line reads like "14 days · live-in care, 7am to 7pm"', m.title === '14 days · live-in care, 7am to 7pm', m.title);
  ok('chart has one column per day (14)', m.cols === 14, String(m.cols));
  ok('no other ember btn--primary (Next is the bar button, hidden here)', m.prim.length === 0 && m.nextHidden, JSON.stringify(m.prim));
  ok('no sideways overflow', !m.ovx && !m.secOvx);
  await p.screenshot({ path: `${out}/decide-${w}.png` });
  // Copy my programme summary left the screen (TJ, 13 Oct 2026: it undercut the email). The summary text
  // stays in the page for Calendly and the email form.
  const cp = await p.evaluate(() => ({ onScreen: !!document.querySelector('[data-section="builder-decide"] [data-brief-copy]'), brief: document.querySelector('[data-brief-text]').textContent }));
  ok('no Copy my programme summary on the screen; the summary text carries DUE DATE', !cp.onScreen && cp.brief.includes('DUE DATE') && cp.brief.includes('held for three months'), 'brief ' + cp.brief.length);
  ok('no page errors', errs.length === 0, errs.join('|'));
  await ctx.close();
}
await b.close();
console.log(fails ? fails + ' FAILED' : 'ALL OK');
process.exit(fails ? 1 : 0);
