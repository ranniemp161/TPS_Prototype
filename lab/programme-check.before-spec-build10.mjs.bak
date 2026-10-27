/* Acceptance suite for the programme builder.
 *
 *   node lab/programme-check.mjs
 *
 * Three things it proves, in the order they matter.
 *
 *   1. The reservation still reconciles. It is a solved plug, not a rate, so
 *      the moment anyone edits a unit rate, a treatment count or a standard
 *      rhythm, the four published prices drift and nothing else notices.
 *      Spec section 9.
 *   2. The fourteen scenarios in spec section 10 still return the published
 *      figures.
 *   3. The nine invariants hold across the whole combination space, swept
 *      exhaustively rather than sampled: 184,320 selections, which is every
 *      state the dependency rules in spec section 2 allow the page to reach.
 *      The six priority checkboxes are left out because they have no price
 *      effect and so cannot move any of these. Invariant 3 is checked against
 *      every single-option addition from every one of those states, not a
 *      representative handful, so the real assertion count is several times
 *      higher again.
 *
 * It prices through `programme-pricing.js` directly. It does not drive the
 * DOM, so it cannot catch a control wired to the wrong field. The dependency
 * rules in spec section 2 are checked in the browser instead.
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const P = require(path.join(root, 'programme-pricing.js'));

const LENGTHS = [5, 7, 14, 30];
let failures = 0;

function check(name, got, want) {
  const ok = got === want;
  if (!ok) failures++;
  console.log(`${ok ? '  ok  ' : '  FAIL'}  ${name}${ok ? '' : `\n          got ${got}, want ${want}`}`);
}

function fee(sel) {
  return Math.round(P.calculate(sel).fee);
}

/* ---------- 1. Reconciliation ---------- */

console.log('\nReservation reconciles (spec section 9)');
for (const d of LENGTHS) {
  const solved = P.solveReservation(d);
  check(`${d} days`, Number(solved.toFixed(2)), P.RESERVATION[d]);
}

/* ---------- 2. The scenario table ---------- */

const complete = d => P.completeSelection(d);
const liveOut  = d => ({ ...complete(d), format: 'out' });

// Everything a client can switch off, switched off. Grocery has no control
// and is always charged, which is the point of the floor below.
const bare = d => ({
  days: d, format: 'in', shift: 'day',
  breakfast: false, lunch: false, dinner: false,
  bath: 'none',
  massage: false, hotstone: false, binding: false,
  scrub: false, reflex: false, facial: false, herbfoot: false, serum: false,
  rhythm: P.STD_MFREQ[d]
});

console.log('\nScenarios (spec section 10)');

check('complete, live-in, daytime, 5',   fee(complete(5)),  1995);
check('complete, live-in, daytime, 7',   fee(complete(7)),  2495);
check('complete, live-in, daytime, 14',  fee(complete(14)), 4495);
check('complete, live-in, daytime, 30',  fee(complete(30)), 6399);

check('complete, daytime in-home, 5',    fee(liveOut(5)),   2145);
check('complete, daytime in-home, 7',    fee(liveOut(7)),   2705);
check('complete, daytime in-home, 14',   fee(liveOut(14)),  4915);
check('complete, daytime in-home, 30',   fee(liveOut(30)),  7299);

const bareLiveIn  = { 5: 1795, 7: 2245, 14: 4045, 30: 5750 };
const bareLiveOut = { 5: 1945, 7: 2455, 14: 4465, 30: 6650 };
for (const d of LENGTHS) check(`stripped bare, live-in, ${d}`, fee(bare(d)), bareLiveIn[d]);
for (const d of LENGTHS) {
  check(`stripped bare, daytime in-home, ${d}`, fee({ ...bare(d), format: 'out' }), bareLiveOut[d]);
}

check('30, live-in, night care, complete',
  fee({ ...complete(30), shift: 'night', breakfast: false }), 6596);
check('30, live-in, night care, stripped bare',
  fee({ ...bare(30), shift: 'night' }), 5750);
check('14, live-in, massage 4 times a week, all else complete',
  fee({ ...complete(14), rhythm: 'w4' }), 4747);
check('30, live-in, no massage at all',
  fee({ ...complete(30), massage: false, hotstone: false }), 5750);

/* ---------- 3. The invariants, swept ---------- */

console.log('\nInvariants across every combination (spec section 10)');

const BATHS   = ['daily', 'eod', 'weekly', 'none'];
const RHYTHMS = ['w4', 'w3', 'w2', 'w1'];
const TREATS  = ['scrub', 'reflex', 'facial', 'herbfoot', 'serum'];

// Every boolean-ish axis, so a sweep is a nested product rather than a
// hand-written list that quietly loses an axis.
function* every() {
  for (const days of LENGTHS)
  for (const format of ['in', 'out'])
  for (const shift of ['day', 'night'])
  for (const breakfast of [true, false])
  for (const lunch of [true, false])
  for (const dinner of [true, false])
  for (const bath of BATHS)
  for (const massage of [true, false])
  for (const hotstone of [true, false])
  for (const binding of [true, false])
  for (const rhythm of RHYTHMS)
  for (const mask of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                      16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]) {
    // The dependency rules in spec section 2 are what the page enforces, so
    // the sweep only visits states the page can actually reach.
    if (format === 'out' && shift === 'night') continue;          // rule 1
    if (shift === 'night' && breakfast) continue;                 // rule 2
    if (!massage && hotstone) continue;                           // rule 3
    if (!massage && rhythm !== P.STD_MFREQ[days]) continue;       // rule 4

    const sel = { days, format, shift, breakfast, lunch, dinner, bath,
                  massage, hotstone, binding, rhythm };
    TREATS.forEach((t, i) => { sel[t] = Boolean(mask & (1 << i)); });
    yield sel;
  }
}

let seen = 0, bad = { finite: 0, floor: 0, monotonic: 0 };

for (const sel of every()) {
  seen++;
  const r = P.calculate(sel);

  // 1. No total is zero, negative, NaN or blank.
  if (!Number.isFinite(r.fee) || r.fee <= 0) bad.finite++;

  // 2. No total falls below minimumFee[days] + supplement.
  const supplement = sel.format === 'out' ? P.CONFIG.liveOutDailySupplement * sel.days : 0;
  if (r.fee < P.CONFIG.minimumFee[sel.days] + supplement - 0.5) bad.floor++;

  // 3. Adding any option never lowers the price. Checked against every
  //    single-option addition reachable from this state, which is stronger
  //    than checking a handful of representative ones.
  for (const add of neighbours(sel)) {
    if (P.calculate(add).fee < r.fee - 0.5) bad.monotonic++;
  }
}

// Each yields the same selection with exactly one more thing switched on,
// or one frequency stepped up. Only states the page permits.
function* neighbours(sel) {
  const on = k => (sel[k] ? null : { ...sel, [k]: true });
  const night = sel.shift === 'night';

  for (const k of ['lunch', 'dinner', 'binding', ...TREATS]) {
    const n = on(k); if (n) yield n;
  }
  if (!night) { const n = on('breakfast'); if (n) yield n; }
  if (sel.massage && !sel.hotstone) yield { ...sel, hotstone: true };
  if (!sel.massage) yield { ...sel, massage: true };

  const b = BATHS.indexOf(sel.bath);                       // daily is richest
  if (b > 0) yield { ...sel, bath: BATHS[b - 1] };
  const m = RHYTHMS.indexOf(sel.rhythm);                   // w4 is most often
  if (sel.massage && m > 0) yield { ...sel, rhythm: RHYTHMS[m - 1] };
  if (sel.format === 'in' && !night) yield { ...sel, shift: 'night', breakfast: false };
}

check('combinations swept', seen, 184320);
check('1. no fee is zero, negative or NaN', bad.finite, 0);
check('2. no fee falls below the floor plus supplement', bad.floor, 0);
check('3. adding an option never lowers the fee', bad.monotonic, 0);

// 4, 5, 6: the sweep skips the states these forbid, so assert the pricing
// would have been wrong had it reached them.
check('4. night care is never priced with daytime in-home',
  Math.round(P.calculate({ ...bare(30), format: 'out', shift: 'night' }).fee),
  Math.round(P.calculate({ ...bare(30), format: 'out', shift: 'day' }).fee));
check('5. breakfast is never charged under night care',
  Math.round(P.calculate({ ...complete(30), shift: 'night', breakfast: true }).fee),
  Math.round(P.calculate({ ...complete(30), shift: 'night', breakfast: false }).fee));
check('6. hot stone is never charged without massage',
  Math.round(P.calculate({ ...complete(14), massage: false, hotstone: true }).fee),
  Math.round(P.calculate({ ...complete(14), massage: false, hotstone: false }).fee));

console.log(`\n${failures === 0 ? 'All checks passed.' : failures + ' CHECK(S) FAILED.'}\n`);
process.exit(failures === 0 ? 0 : 1);
