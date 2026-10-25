/* ============================================================
   THE POSTCODE CHECK, shared (TJ, 25 Oct 2026)

   The single treatments booking's own check (booking.js, POSTCODES),
   lifted unchanged so the bespoke builder and Request a place use the same
   verdict: postcodes.io (ONS and Ordnance Survey open data, free, no key)
   finds the postcode, and the point is ray cast against the M25 ring in
   booking-m25.js. Load booking-m25.js first.
   ============================================================ */
var TPS_POSTCODE = (function () {
  'use strict';
  var POSTCODES_IO = 'https://api.postcodes.io';
  var POSTCODE_PATTERN = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

  // "e48dl" and "E4  8DL" are the same postcode; the API wants the spaced form.
  function normalise(input) {
    var bare = String(input || '').replace(/\s+/g, '').toUpperCase();
    if (bare.length < 5) return bare;
    return bare.slice(0, -3) + ' ' + bare.slice(-3);
  }
  function looksLike(input) { return POSTCODE_PATTERN.test(String(input || '').replace(/\s+/g, '')); }

  // Whether the point sits inside the M25: a ray cast east from it, counted
  // against the ring's edges. Accurate to about 470m at the motorway itself.
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

  // The verdict on a postcode: { postcode, inServiceArea } or { error }.
  function lookup(raw) {
    var postcode = normalise(raw);
    if (!looksLike(postcode)) return Promise.resolve({ error: 'That does not look like a UK postcode.' });
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : 0;
    return fetch(POSTCODES_IO + '/postcodes/' + encodeURIComponent(postcode), ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) {
        clearTimeout(t);
        if (r.status === 404) return { error: 'We could not find that postcode. Please check it.' };
        if (!r.ok) return { error: 'We could not check that postcode. Please try again.' };
        return r.json().then(function (body) {
          var res = body && body.result;
          if (!res) return { error: 'We could not find that postcode. Please check it.' };
          return { postcode: res.postcode, inServiceArea: insideM25(res.latitude, res.longitude) };
        });
      })
      .catch(function () { clearTimeout(t); return { error: 'We could not check that postcode. Please try again.' }; });
  }

  // The client's own refusal (single-treatments.html, Service Area Notice).
  var OUTSIDE = 'We currently provide our services exclusively within London Zones 1 to 5. Based on your entered postcode, your location is outside our current service radius.';

  return { normalise: normalise, looksLike: looksLike, insideM25: insideM25, lookup: lookup, OUTSIDE: OUTSIDE };
})();
