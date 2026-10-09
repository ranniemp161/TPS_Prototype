/* ============================================================
   THE POSTPARTUM SUITE, programme builder pricing

   Every constant and every line of the calculation comes from
   `tps-programme-builder-spec.md`, sections 3, 4 and 5. Nothing here
   is invented and nothing is tuned by eye.

   Two properties of this file matter more than its readability.

   RESERVATION is a solved plug, not a rate. It is whatever remains once
   every other line is priced, so that a complete programme lands exactly
   on the published price. Change any rate, treatment count or standard
   rhythm and it has to be re-solved or the four published prices drift.
   `lab/programme-check.mjs` re-solves it on every run and fails the build
   if the answer moved. Read spec section 9 before touching a number.

   It loads as a classic script in the browser and as a CommonJS module in
   node, so the page and the acceptance suite price from one source. A
   second copy of this arithmetic would be wrong within a week.
   ============================================================ */

var TPS_PRICING = (function () {
  'use strict';

  var CONFIG = {
    introPricing: true,
    introHeldFor: '2026',
    consultationUrl: 'https://calendly.com/thepostpartumsuite/30min',

    fullPrice:  { 5: 2495, 7: 2995, 14: 4995, 30: 6995 },
    introPrice: { 5: 1995, 7: 2495, 14: 4495, 30: 6399 },

    // Floor a built programme cannot go below, on the introductory basis.
    minimumFee: { 5: 1795, 7: 2245, 14: 4045, 30: 5750 },

    nightCareFor30: 500,        // across 30 nights, scaled by length
    liveOutDailySupplement: 30  // accommodation and travel, per day
  };

  var RESERVATION  = { 5: 1686.55, 7: 1964.30, 14: 3421.00, 30: 3212.10 };
  var DURATION_ADJ = { 5: 1.15, 7: 1.10, 14: 1.00, 30: 0.95 };

  var RATE = {
    breakfast: 10, lunch: 14, dinner: 16, bath: 14, grocery: 8,
    massage: 55, hotstone: 15, binding: 10,
    scrub: 35, reflex: 28, facial: 28, herbfoot: 22, serum: 20
  };

  // Fixed treatment counts per programme length.
  var STD = {
    5:  { scrub: 1, reflex: 1, facial: 1, herbfoot: 1, serum: 1 },
    7:  { scrub: 1, reflex: 1, facial: 1, herbfoot: 1, serum: 2 },
    14: { scrub: 2, reflex: 2, facial: 2, herbfoot: 2, serum: 3 },
    30: { scrub: 2, reflex: 4, facial: 4, herbfoot: 4, serum: 9 }
  };

  var STD_MFREQ = { 5: 'w4', 7: 'w4', 14: 'w2', 30: 'w4' };
  var PER_WEEK  = { w4: 4, w3: 3, w2: 2, w1: 1 };

  var COUNTED = ['scrub', 'reflex', 'facial', 'herbfoot', 'serum'];

  /* ---------- Derived quantities, spec section 4 ---------- */

  function baths(frequency, days) {
    if (frequency === 'daily')  return days;
    if (frequency === 'eod')    return Math.ceil(days / 2);
    if (frequency === 'weekly') return Math.ceil(days / 7);
    return 0;
  }

  function massageSessions(rhythm, days) {
    return Math.ceil(PER_WEEK[rhythm] * days / 7);
  }

  /* ---------- The calculation, spec section 5. Order matters ---------- */

  // Everything before the discount, the supplement and the floor. Split out
  // of calculate() because section 9 has to re-solve the reservation against
  // this raw figure, and reading it back through the discounted, floored fee
  // would hand the solver the floor instead of the sum.
  function rawSum(sel, reservation) {
    var d     = sel.days;
    var adj   = DURATION_ADJ[d];
    var night = (sel.shift === 'night' && sel.format === 'in');
    var mc    = sel.massage ? massageSessions(sel.rhythm, d) : 0;

    // 1. Reservation. NOT multiplied by the duration factor.
    var sum = reservation;

    // 2. Night care, scaled by length. NOT multiplied by the duration factor.
    if (night) sum += CONFIG.nightCareFor30 * d / 30;

    // 3. Everything else IS multiplied by the duration factor.
    if (sel.breakfast && !night) sum += RATE.breakfast * d * adj;
    if (sel.lunch)               sum += RATE.lunch     * d * adj;
    if (sel.dinner)              sum += RATE.dinner    * d * adj;

    sum += RATE.bath    * baths(sel.bath, d) * adj;
    sum += RATE.grocery * d * adj;                   // always included

    sum += RATE.massage * mc * adj;
    if (sel.massage && sel.hotstone) sum += RATE.hotstone * mc * adj;
    if (sel.binding)                 sum += RATE.binding  * d  * adj;

    for (var i = 0; i < COUNTED.length; i++) {
      var k = COUNTED[i];
      if (sel[k]) sum += RATE[k] * STD[d][k] * adj;
    }

    return sum;
  }

  function calculate(sel) {
    var d   = sel.days;
    var sum = rawSum(sel, RESERVATION[d]);

    // 4. Introductory discount.
    var introFactor = CONFIG.introPricing
      ? CONFIG.introPrice[d] / CONFIG.fullPrice[d]
      : 1;

    // 5. Live-out supplement, added AFTER the discount, never subject to it.
    //    It covers real accommodation and travel rather than margin.
    var supplement = sel.format === 'out'
      ? CONFIG.liveOutDailySupplement * d
      : 0;

    var priced = sum * introFactor + supplement;

    // 6. Floor.
    var floor = CONFIG.minimumFee[d];
    if (!CONFIG.introPricing) floor /= (CONFIG.introPrice[d] / CONFIG.fullPrice[d]);
    floor += supplement;

    return {
      fee: Math.max(priced, floor),
      floor: floor,
      supplement: supplement,
      floored: priced < floor - 0.5
    };
  }

  /* ---------- Helpers the page needs and the suite checks ---------- */

  // A complete programme at a given length: live-in, daytime, all three
  // meals, daily baths, every treatment, standard rhythm. This is the
  // configuration the published prices are quoted against, so both the
  // reconciliation and the "this is our complete programme" notice read
  // it from here rather than restating it.
  function completeSelection(days) {
    return {
      days: days, format: 'in', shift: 'day',
      breakfast: true, lunch: true, dinner: true,
      bath: 'daily',
      massage: true, hotstone: true, binding: true,
      scrub: true, reflex: true, facial: true, herbfoot: true, serum: true,
      rhythm: STD_MFREQ[days]
    };
  }

  function isComplete(sel) {
    var want = completeSelection(sel.days);
    for (var k in want) {
      if (Object.prototype.hasOwnProperty.call(want, k) && sel[k] !== want[k]) return false;
    }
    return true;
  }

  // Re-solves RESERVATION from the published price, per spec section 9.
  // The suite compares this against the constant above.
  function solveReservation(days) {
    var everythingElse = rawSum(completeSelection(days), 0);
    return CONFIG.fullPrice[days] - everythingElse;
  }

  function money(n) {
    return '£' + Math.round(n).toLocaleString('en-GB');
  }

  return {
    CONFIG: CONFIG,
    RESERVATION: RESERVATION,
    DURATION_ADJ: DURATION_ADJ,
    RATE: RATE,
    STD: STD,
    STD_MFREQ: STD_MFREQ,
    PER_WEEK: PER_WEEK,
    COUNTED: COUNTED,
    baths: baths,
    rawSum: rawSum,
    massageSessions: massageSessions,
    calculate: calculate,
    completeSelection: completeSelection,
    isComplete: isComplete,
    solveReservation: solveReservation,
    money: money
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TPS_PRICING;
