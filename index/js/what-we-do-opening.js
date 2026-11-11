/* WHAT WE DO, the opening.

   Two plain sections, no pin and no scroll animation (TJ, 11 Nov 2026, from
   Ami's notes, TPS-0047): the hero (the photograph under the header with the
   statement on it in cream), then "Who is it for?" as its own section below,
   the words on the left and the picture on the right (stacked on phones).

   The whole layout is in what-we-do-opening.css under .op--static; this script
   only switches it on. The pinned, scrubbed version it replaces (statement
   leaving, photograph pulling back, the introduction sliding across) is kept in
   archive/what-we-do-opening-animated-2026-11-11.js with its stylesheet and page. */
(function () {
  'use strict';
  var op = document.querySelector('[data-op]');
  if (op) op.classList.add('op--static');
})();
