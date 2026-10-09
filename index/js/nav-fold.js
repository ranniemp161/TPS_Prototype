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
(function () {
  'use strict';
  var root = document.querySelector('[data-nav]');
  if (!root) return;
  var FOLD = parseFloat(root.getAttribute('data-nav-fold')) || 56;
  function update() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    root.classList.toggle('is-scrolled', y > FOLD);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
