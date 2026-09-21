/* ============================================================
   THE POSTPARTUM SUITE, shared nav for the inner pages

   The same nav behaviour v1.js and programme.js each carry, lifted out
   so the stage one placeholder pages do not each grow their own copy.
   Extracted verbatim from programme.js on 2026-09-21, which is the
   version written for a page that opens on paper rather than on a
   photographic hero: the bar starts in its resolved state (the markup
   carries `is-scrolled`) and there is no logo morph to drive.

   v1.js and programme.js are deliberately left alone. Both work, both
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
      veil.hidden = false;
      var h = menu.scrollHeight;
      if (REDUCED) { gsap.set(menu, { height: 'auto' }); gsap.set(veil, { opacity: 1 }); return; }
      if (first) {
        gsap.fromTo(menu, { height: 0 }, { height: h, duration: 0.34, ease: EASE });
        gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.26, ease: EASE });
      } else {
        gsap.to(menu, { height: h, duration: 0.26, ease: EASE });
      }
      gsap.fromTo(menu.querySelectorAll('.menu__group'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: EASE, delay: first ? 0.08 : 0 });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        if (open === tab.dataset.tab) close(true);
        else openPanel(tab.dataset.tab);
      });
    });

    veil.addEventListener('click', function () { close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) close(true); });
    root.addEventListener('focusout', function (e) { if (open && !root.contains(e.relatedTarget)) close(); });

    if (burger) {
      burger.addEventListener('click', function () {
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
