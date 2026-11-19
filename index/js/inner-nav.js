/* ============================================================
   THE POSTPARTUM SUITE, shared nav for the inner pages

   The same nav behaviour home.js and build-your-programme.js each carry, lifted out
   so the stage one placeholder pages do not each grow their own copy.
   Extracted verbatim from build-your-programme.js on 2026-09-21, which is the
   version written for a page that opens on paper rather than on a
   photographic hero: the bar starts in its resolved state (the markup
   carries `is-scrolled`) and there is no logo morph to drive.

   home.js and build-your-programme.js are deliberately left alone. Both work, both
   are load bearing, and rewiring either to import this would be a
   change to a page nobody asked me to touch. When an inner page grows
   real content and its own script, it can keep loading this or fold it
   in, whichever suits.

   Requires GSAP, loaded before this file.
   ============================================================ */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'power3.out';

  function nav() {
    var root = document.querySelector('[data-nav]');
    if (!root) return;

    var tabs = [].slice.call(root.querySelectorAll('.tab[data-tab]'));
    var menu = root.querySelector('[data-menu]');
    var panels = [].slice.call(root.querySelectorAll('.menu__panel'));
    var veil = document.querySelector('[data-veil]');
    var burger = root.querySelector('[data-burger]');
    var open = null;

    // Desktop: the panel hangs under the tab that opened it, its text level with
    // the tab's word (TJ, 1 Nov 2026). Sets --menu-x, which site.css reads only
    // above 1100px, so phones keep their full width panel. It follows the tab
    // while open, since the header fold slides the tabs on scroll.
    function placeMenu(tab) {
      var host = menu.offsetParent || root;
      function set() {
        var pad = parseFloat(getComputedStyle(tab).paddingLeft) || 0;
        var x = tab.getBoundingClientRect().left + pad - host.getBoundingClientRect().left;
        menu.style.setProperty('--menu-x', x.toFixed(1) + 'px');
        // The dropdown starts right under the tab's word; its glass only begins
        // where the header's own glass ends, so the two read as one (TJ, 7 Nov 2026).
        var word = document.createRange(); word.selectNodeContents(tab);
        var hostBox = host.getBoundingClientRect();
        var y = word.getBoundingClientRect().bottom - hostBox.top;
        menu.style.setProperty('--menu-y', y.toFixed(1) + 'px');
        menu.style.setProperty('--menu-band', Math.max(0, hostBox.height - y).toFixed(1) + 'px');
        // On pages marked data-band-plain, the band at the very top sits on the plain page,
        // not on the content below, so the dropdown takes that flat colour to match it.
        menu.classList.toggle('menu--on-page', window.scrollY < 2 && document.documentElement.hasAttribute('data-band-plain'));
      }
      set();
      cancelAnimationFrame(menu._follow);
      (function follow() {
        if (menu.hidden || tab.getAttribute('aria-expanded') !== 'true') return;
        set();
        menu._follow = requestAnimationFrame(follow);
      })();
    }

    function close(focusTab) {
      if (!open) return;
      var was = tabs.filter(function (t) { return t.dataset.tab === open; })[0];
      tabs.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
      open = null;
      function done() {
        menu.hidden = true;
        veil.hidden = true;
        if (burger) burger.setAttribute('aria-expanded', 'false');
        root.classList.remove('is-open');
      }
      if (REDUCED) { gsap.set(menu, { height: 0 }); gsap.set(veil, { opacity: 0 }); done(); }
      else {
        gsap.to(veil, { opacity: 0, duration: 0.2, ease: EASE });
        gsap.to(menu, { height: 0, duration: 0.28, ease: EASE, onComplete: done });
      }
      if (focusTab && was) was.focus();
    }

    function openPanel(name) {
      var tab = tabs.filter(function (t) { return t.dataset.tab === name; })[0];
      if (!tab) return;
      panels.forEach(function (p) { p.hidden = p.dataset.panel !== name; });
      tabs.forEach(function (t) { t.setAttribute('aria-expanded', String(t.dataset.tab === name)); });
      var first = open === null;
      open = name;

      menu.hidden = false;
      placeMenu(tab);
      veil.hidden = false;
      // Measure this list on its own: drop the last panel's height first, or a
      // short list inherits a long one's (TJ, 1 Nov 2026).
      var prevH = menu.offsetHeight;
      menu.style.height = 'auto';
      var h = menu.scrollHeight;
      if (REDUCED) { gsap.set(menu, { height: 'auto' }); gsap.set(veil, { opacity: 1 }); return; }
      if (first) {
        gsap.fromTo(menu, { height: 0 }, { height: h, duration: 0.34, ease: EASE });
        gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.26, ease: EASE });
      } else {
        gsap.fromTo(menu, { height: prevH }, { height: h, duration: 0.26, ease: EASE });
      }
      gsap.fromTo(menu.querySelectorAll('.menu__group'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: EASE, delay: first ? 0.08 : 0 });
    }

    // The stacked menu below 1100px (TJ, 19 Nov 2026): Menu opens the items as a
    // list with nothing expanded; tapping a section opens its links right under it
    // (.nav__sub in the header) and closes any other, tapping it again folds it.
    // The drop panels are desktop only. Same block in home.js and build-your-programme.js.
    var STACK = window.matchMedia('(max-width: 1100px)');
    function stackToggle(tab) {
      var on = tab.getAttribute('aria-expanded') === 'true';
      tabs.forEach(function (t) { t.setAttribute('aria-expanded', String(!on && t === tab)); });
    }
    function stackShow(show) {
      if (burger) burger.setAttribute('aria-expanded', String(show));
      root.classList.toggle('is-open', show);
      tabs.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
      open = null;
      menu.hidden = true;
      veil.hidden = !show;
      if (show) { if (REDUCED) gsap.set(veil, { opacity: 1 }); else gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.26, ease: EASE }); }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        if (STACK.matches) { stackToggle(tab); return; }
        if (open === tab.dataset.tab) close(true);
        else openPanel(tab.dataset.tab);
      });
    });

    veil.addEventListener('click', function () { if (STACK.matches) stackShow(false); else close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (STACK.matches) { if (root.classList.contains('is-open')) { stackShow(false); if (burger) burger.focus(); } }
      else if (open) close(true);
    });
    root.addEventListener('focusout', function (e) {
      if (STACK.matches) { if (root.classList.contains('is-open') && e.relatedTarget && !root.contains(e.relatedTarget)) stackShow(false); return; }
      if (open && !root.contains(e.relatedTarget)) close();
    });

    if (burger) {
      burger.addEventListener('click', function () {
        if (STACK.matches) {
          var was = root.classList.contains('is-open');
          stackShow(!was);
          if (!was) { var first = root.querySelector('.nav__tabs .tab'); if (first) first.focus(); }
          return;
        }
        var isOpen = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', String(!isOpen));
        root.classList.toggle('is-open', !isOpen);
        if (isOpen) close();
        else { openPanel(tabs[0].dataset.tab); tabs[0].focus(); }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', nav, { once: true });
  } else {
    nav();
  }
})();
