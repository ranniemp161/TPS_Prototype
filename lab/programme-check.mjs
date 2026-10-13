/* Acceptance suite for the programme builder, Build 10 (10 Oct 2026).
 *
 *   node lab/programme-check.mjs
 *
 * Checks index/js/build-your-programme-pricing.js against the spec
 * "new md for build your own.md" (project root):
 *   1. The reservation reconciles: each complete programme equals its
 *      published price (spec 4.5 and section 7).
 *   2. Every figure in the spec's section 5 tables.
 *   3. The section 5 rules across every combination the page can reach:
 *      removing anything never raises the fee, fewer massages never raise it,
 *      daytime in-home is never cheaper than live-in, nothing is below the floor.
 * It prices through the engine directly; the page's wiring is checked in the
 * browser (lab/bespoke-check.mjs).
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const P = require(path.join(root, 'index', 'js', 'build-your-programme-pricing.js'));

const LENGTHS = [5, 7, 14, 30];
const EXTRAS = P.COUNTED;
let failures = 0;
function check(name, got, want) {
  const ok = got === want;
  if (!ok) failures++;
  console.log(`${ok ? '  ok  ' : '  FAIL'}  ${name}${ok ? '' : `\n          got ${got}, want ${want}`}`);
}
const fee = sel => Math.round(P.calculate(sel).fee);
const complete = d => P.completeSelection(d);
const noExtras = s => { const o = { ...s }; EXTRAS.forEach(k => { o[k] = false; }); return o; };

console.log('\nReservation reconciles');
for (const d of LENGTHS) {
  check(`${d} days, solved reservation`, Number(P.solveReservation(d).toFixed(2)), P.RESERVATION[d]);
  check(`${d} days, complete equals introductory price`, fee(complete(d)), P.CONFIG.introPrice[d]);
}

console.log('\nSpec section 5, one change from complete');
const T = {
  5:  { night: 2016, out: 2145, nomeals: 1811, nomassage: 1802, noextras: 1868 },
  7:  { night: 2528, out: 2705, nomeals: 2245, nomassage: 2245, noextras: 2369 },
  14: { night: 4579, out: 4915, nomeals: 4045, nomassage: 4045, noextras: 4247 },
  30: { night: 6596, out: 7299, nomeals: 5750, nomassage: 5750, noextras: 5980 }
};
for (const d of LENGTHS) {
  check(`${d} + night care`, fee({ ...complete(d), shift: 'night' }), T[d].night);
  check(`${d} daytime in-home`, fee({ ...complete(d), format: 'out' }), T[d].out);
  check(`${d} no meals`, fee({ ...complete(d), meals: false }), T[d].nomeals);
  check(`${d} no massage`, fee({ ...complete(d), massage: false }), T[d].nomassage);
  check(`${d} extras all off`, fee(noExtras(complete(d))), T[d].noextras);
}

console.log('\nSpec section 5, fewer massages');
[[5, 's2', 1931], [7, 's3', 2431], [7, 's2', 2367], [14, 'w3', 4369], [14, 'w2', 4243], [30, 'w3', 6095], [30, 'w2', 5851]]
  .forEach(([d, r, want]) => check(`${d} days ${P.rhythmTitle(r)}`, fee({ ...complete(d), rhythm: r }), want));

console.log('\nSpec section 5, everything stripped out');
const stripped = d => noExtras({ ...complete(d), meals: false, massage: false });
const S = { 5: [1795, 1945], 7: [2245, 2455], 14: [4045, 4465], 30: [5750, 6650] };
for (const d of LENGTHS) {
  check(`${d} stripped, live-in`, fee(stripped(d)), S[d][0]);
  check(`${d} stripped, daytime in-home`, fee({ ...stripped(d), format: 'out' }), S[d][1]);
}

console.log('\nRules across every reachable combination');
function* every() {
  for (const days of LENGTHS)
  for (const format of ['in', 'out'])
  for (const shift of ['day', 'night'])
  for (const meals of [true, false])
  for (const massage of [true, false])
  for (const rhythm of P.RHYTHMS[days])
  for (let mask = 0; mask < 32; mask++) {
    if (format === 'out' && shift === 'night') continue;            // night care is live-in only
    if (!massage && rhythm !== P.standardRhythm(days)) continue;    // no rhythm without massage
    const sel = { days, format, shift, meals, massage, rhythm };
    EXTRAS.forEach((k, i) => { sel[k] = Boolean(mask & (1 << i)); });
    yield sel;
  }
}
let seen = 0; const bad = { finite: 0, floor: 0, removal: 0, fewer: 0, outCheaper: 0 };
for (const sel of every()) {
  seen++;
  const r = P.calculate(sel).fee;
  if (!Number.isFinite(r) || r <= 0) bad.finite++;
  const sup = sel.format === 'out' ? 30 * sel.days : 0;
  if (r < P.CONFIG.minimumFee[sel.days] + sup - 0.5) bad.floor++;
  // removing one thing never raises the fee
  const removals = [];
  if (sel.meals) removals.push({ ...sel, meals: false });
  if (sel.massage) removals.push({ ...sel, massage: false, rhythm: P.standardRhythm(sel.days) });
  EXTRAS.forEach(k => { if (sel[k]) removals.push({ ...sel, [k]: false }); });
  if (sel.shift === 'night') removals.push({ ...sel, shift: 'day' });
  removals.forEach(x => { if (P.calculate(x).fee > r + 0.5) bad.removal++; });
  // fewer massages never raise it
  if (sel.massage) {
    const opts = P.RHYTHMS[sel.days], i = opts.indexOf(sel.rhythm);
    for (let j = i + 1; j < opts.length; j++) if (P.calculate({ ...sel, rhythm: opts[j] }).fee > r + 0.5) bad.fewer++;
  }
  // daytime in-home never cheaper than live-in
  if (sel.format === 'out' && P.calculate({ ...sel, format: 'in' }).fee > r + 0.5) bad.outCheaper++;
}
check('combinations swept (the spec tested 2,880)', seen, 2880);
check('no fee is zero, negative or NaN', bad.finite, 0);
check('no fee below the floor plus supplement', bad.floor, 0);
check('removing anything never raises the fee', bad.removal, 0);
check('fewer massages never raise the fee', bad.fewer, 0);
check('daytime in-home is never cheaper than live-in', bad.outCheaper, 0);

console.log(`\n${failures === 0 ? 'All checks passed.' : failures + ' CHECK(S) FAILED.'}\n`);
process.exit(failures === 0 ? 0 : 1);
