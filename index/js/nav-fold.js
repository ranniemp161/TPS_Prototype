/* ============================================================
   THE POSTPARTUM SUITE, header fold for every page except the homepage

   The header is tall at the top of a page (the three line wordmark, the
   circle in the corner) and folds to the short bar with the circle once the
   page has been scrolled a little. The animation itself is pure CSS in
   site.css (.nav--glass and .is-scrolled), so it moves exactly as it does on
   the homepage. This only decides when.

   The homepage decides for itself (home.js nav(), after the hero handoff).
   Every other page folds after FOLD pixels, or after data-nav-fold pixels if
   the header carries that attribute.
   ============================================================ */
/* The desktop master number (TJ, 15 Nov 2026): the root size over 16, so a
   fixed distance in pixels here scales with the rest of the page. tpsPx turns
   a length read from the styles (now in rem) into pixels. */
function tpsU() { return (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16; }
function tpsPx(v) { var n = parseFloat(v); if (isNaN(n)) return n; return /rem\s*$/.test(String(v).trim()) ? n * 16 * tpsU() : n; }
(function () {
  'use strict';
  var root = document.querySelector('[data-nav]');
  if (!root) return;
  var FOLD = parseFloat(root.getAttribute('data-nav-fold')) || 56 * tpsU();
  function update() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    root.classList.toggle('is-scrolled', y > FOLD);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
