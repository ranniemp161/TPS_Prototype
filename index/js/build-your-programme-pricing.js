/* ============================================================
   THE POSTPARTUM SUITE, programme builder pricing

   Build 10 (spec "new md for build your own.md", 9 October 2026,
   sections 4 and 5). Rebuilt 10 October 2026 from the earlier engine:
   massage and hot stone are now one treatment at 70, hair serum is gone,
   the thermal blanket treatment is in, meals are one yes or no, herbal
   baths, belly binding and grocery collection are always included, and
   the massage rhythm options depend on the length.

   RESERVATION is a solved plug, not a rate. It is whatever remains once
   every other line is priced, so that a complete programme lands exactly
   on the published price. Change any rate, treatment count or standard
   rhythm and it has to be re-solved or the four published prices drift.
   `lab/programme-check.mjs` re-solves it on every run and checks every
   figure in the spec's section 5.

   It loads as a classic script in the browser and as a CommonJS module in
   node, so the page and the acceptance suite price from one source.
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
    liveOutDailySupplement: 30  // travel and accommodation, per day
  };

  // Solved so that each complete programme equals its published price.
  var RESERVATION  = { 5: 1680.80, 7: 1980.80, 14: 3151.00, 30: 3288.10 };
  var DURATION_ADJ = { 5: 1.15, 7: 1.10, 14: 1.00, 30: 0.95 };

  var RATE = {
    breakfast: 10, lunch: 14, dinner: 16, bath: 14, grocery: 8,
    massage: 70,          // postpartum massage with hot stone, one treatment
    binding: 10, scrub: 35, reflex: 28, facial: 28, herbfoot: 22, thermal: 25
  };

  // The treatments the client can tick off, with their fixed counts per length.
  var COUNTED = ['scrub', 'reflex', 'facial', 'herbfoot', 'thermal'];
  var STD = {
    5:  { scrub: 1, reflex: 1, facial: 1, herbfoot: 1, thermal: 1 },
    7:  { scrub: 1, reflex: 1, facial: 1, herbfoot: 1, thermal: 1 },
    14: { scrub: 2, reflex: 2, facial: 2, herbfoot: 2, thermal: 2 },
    30: { scrub: 2, reflex: 4, facial: 4, herbfoot: 4, thermal: 4 }
  };

  // Massage options per length. sN is N sessions in total; wN is N a week,
  // rounded up across the length. The first option is the standard.
  var RHYTHMS = {
    5:  ['s3', 's2'],
    7:  ['s4', 's3', 's2'],
    14: ['w4', 'w3', 'w2'],
    30: ['w4', 'w3', 'w2']
  };
  var WEEK_WORDS = { 4: 'Four times a week', 3: 'Three times a week', 2: 'Twice a week' };

  function massageSessions(rhythm, days) {
    var n = parseInt(rhythm.slice(1), 10);
    return rhythm.charAt(0) === 's' ? n : Math.ceil(n * days / 7);
  }
  function standardRhythm(days) { return RHYTHMS[days][0]; }
  function rhythmTitle(rhythm) {
    var n = parseInt(rhythm.slice(1), 10);
    return rhythm.charAt(0) === 's' ? n + ' massages' : WEEK_WORDS[n];
  }

  /* ---------- The calculation, spec section 4.4. Order matters ---------- */

  function rawSum(sel, reservation) {
    var d     = sel.days;
    var adj   = DURATION_ADJ[d];
    var night = (sel.shift === 'night' && sel.format === 'in');
    var m     = sel.massage ? massageSessions(sel.rhythm, d) : 0;

    var sum = reservation;                                  // not adjusted
    if (night) sum += CONFIG.nightCareFor30 * d / 30;      // not adjusted
    if (sel.meals) {
      if (!night) sum += RATE.breakfast * d * adj;          // breakfast sits outside night care
      sum += RATE.lunch * d * adj + RATE.dinner * d * adj;
    }
    sum += RATE.bath    * d * adj;                          // herbal bath, daily, always
    sum += RATE.grocery * d * adj;                          // grocery collection, always
    sum += RATE.massage * m * adj;                          // massage with hot stone
    sum += RATE.binding * d * adj;                          // belly binding, daily, always
    for (var i = 0; i < COUNTED.length; i++) {
      var k = COUNTED[i];
      if (sel[k]) sum += RATE[k] * STD[d][k] * adj;
    }
    return sum;
  }

  function calculate(sel) {
    var d   = sel.days;
    var sum = rawSum(sel, RESERVATION[d]);
    var introFactor = CONFIG.introPricing ? CONFIG.introPrice[d] / CONFIG.fullPrice[d] : 1;
    // The daytime supplement is added after the discount and raises the floor.
    var supplement = sel.format === 'out' ? CONFIG.liveOutDailySupplement * d : 0;
    var priced = sum * introFactor + supplement;
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

  // A complete programme (spec 4.5): live-in, daytime, meals, massage on at
  // the standard rhythm, all five extras ticked.
  function completeSelection(days) {
    return {
      days: days, format: 'in', shift: 'day', meals: true,
      massage: true, rhythm: standardRhythm(days),
      scrub: true, reflex: true, facial: true, herbfoot: true, thermal: true
    };
  }

  function isComplete(sel) {
    var want = completeSelection(sel.days);
    for (var k in want) {
      if (Object.prototype.hasOwnProperty.call(want, k) && sel[k] !== want[k]) return false;
    }
    return true;
  }

  function solveReservation(days) {
    return CONFIG.fullPrice[days] - rawSum(completeSelection(days), 0);
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
    COUNTED: COUNTED,
    RHYTHMS: RHYTHMS,
    massageSessions: massageSessions,
    standardRhythm: standardRhythm,
    rhythmTitle: rhythmTitle,
    rawSum: rawSum,
    calculate: calculate,
    completeSelection: completeSelection,
    isComplete: isComplete,
    solveReservation: solveReservation,
    money: money
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TPS_PRICING;
