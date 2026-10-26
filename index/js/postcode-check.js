/* ============================================================
   THE AREA CHECK, shared (TJ, 25 Oct 2026)

   Only the first part of the postcode is asked for, everywhere (the
   bespoke builder and Check your dates): "SW7", not "SW7 2AZ" (TJ, 25 Oct
   2026). postcodes.io (ONS and Ordnance Survey open data, free, no key)
   gives the centre of that area, and the point is ray cast against the M25
   ring in booking-m25.js, as the single treatments booking does for a full
   postcode. An area that straddles the motorway is judged by its centre, so
   a little slippage at the edge is accepted (TJ). A full postcode typed by
   mistake is cut to its first part. Load booking-m25.js first.
   ============================================================ */
var TPS_POSTCODE = (function () {
  'use strict';
  var POSTCODES_IO = 'https://api.postcodes.io';
  var OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/;
  var FULL = /^([A-Z]{1,2}\d[A-Z\d]?)\s*\d[A-Z]{2}$/;

  // "sw7", " SW7 " and "SW7 2AZ" all give "SW7".
  function normalise(input) {
    var s = String(input || '').trim().toUpperCase().replace(/\s+/g, ' ');
    var m = FULL.exec(s.replace(/\s+/g, ''));
    return m ? m[1] : s.replace(/\s+/g, '');
  }
  function looksLike(input) { return OUTCODE.test(normalise(input)); }

  // Whether the point sits inside the M25: a ray cast east from it, counted
  // against the ring's edges.
  function insideM25(lat, lng) {
    var inside = false;
    for (var i = 0, j = M25_RING.length - 1; i < M25_RING.length; j = i++) {
      var latI = M25_RING[i][0], lngI = M25_RING[i][1];
      var latJ = M25_RING[j][0], lngJ = M25_RING[j][1];
      if ((latI > lat) === (latJ > lat)) continue;
      var crossingLng = lngI + ((lat - latI) / (latJ - latI)) * (lngJ - lngI);
      if (lng < crossingLng) inside = !inside;
    }
    return inside;
  }

  // The verdict on an area: { postcode: "SW7", inServiceArea } or { error }.
  function lookup(raw) {
    var area = normalise(raw);
    if (!OUTCODE.test(area)) return Promise.resolve({ error: 'Please enter the first part of your postcode, for example SW7.' });
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : 0;
    return fetch(POSTCODES_IO + '/outcodes/' + encodeURIComponent(area), ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) {
        clearTimeout(t);
        if (r.status === 404) return { error: 'We could not find that area. Please check the first part of your postcode.' };
        if (!r.ok) return { error: 'We could not check that area. Please try again.' };
        return r.json().then(function (body) {
          var res = body && body.result;
          if (!res || res.latitude == null) return { error: 'We could not find that area. Please check the first part of your postcode.' };
          return { postcode: res.outcode, inServiceArea: insideM25(res.latitude, res.longitude) };
        });
      })
      .catch(function () { clearTimeout(t); return { error: 'We could not check that area. Please try again.' }; });
  }

  // The client's own refusal (single-treatments.html, Service Area Notice).
  var OUTSIDE = 'We currently provide our services exclusively within London Zones 1 to 5. Based on your entered postcode, your location is outside our current service radius.';

  return { normalise: normalise, looksLike: looksLike, insideM25: insideM25, lookup: lookup, OUTSIDE: OUTSIDE };
})();
