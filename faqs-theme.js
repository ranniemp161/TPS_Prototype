(function () {
  "use strict";

  var page = document.querySelector(".page--faqs");
  var faq = document.querySelector(".faq--morph");
  if (!page || !faq || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  /* One constant palette and scroll driven motion (TJ, 7 Oct 2026).
     The colours never change: the light top of the page (Canvas with coral
     and blush streaks, the defaults in what-we-do.css) holds the whole way
     down, and the copy stays Ink. What scroll changes is the drift's motion,
     on top of its own slow 62 second travel:
       turn   the two streak layers rotate, in opposite senses at different
              rates, so they slide across each other
       travel the field wanders across the window on a slow curve
       breathe it swells a little toward the middle of the page and settles
       glow   the bright centre of the drift moves from right to left and
              rises and falls
     Every value is a smooth function of how far down the page you are, so
     it moves only while you scroll, at your speed, and reverses on the way
     up. Reduced motion keeps the drift still. */
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var max = 1;

  function clamp(value, min, top) { return Math.min(top, Math.max(min, value)); }
  function smooth(value) {
    value = clamp(value, 0, 1);
    return value * value * (3 - 2 * value);
  }
  function measure() {
    max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }
  function apply() {
    if (reduced) return;
    var p = clamp(window.scrollY / max, 0, 1), e = smooth(p);
    var w = window.innerWidth, h = window.innerHeight;
    page.style.setProperty("--fw-rot", (e * 38).toFixed(2) + "deg");
    page.style.setProperty("--fw-x", (Math.sin(p * Math.PI * 1.5) * w * .09).toFixed(1) + "px");
    page.style.setProperty("--fw-y", (Math.sin(p * Math.PI * 2) * h * -.06).toFixed(1) + "px");
    page.style.setProperty("--fw-scale", (1 + Math.sin(p * Math.PI) * .16).toFixed(3));
    page.style.setProperty("--fw-mx", (70 - e * 40).toFixed(2) + "%");
    page.style.setProperty("--fw-my", (40 + Math.sin(p * Math.PI) * 18).toFixed(2) + "%");
  }
  function refresh() {
    measure();
    apply();
  }

  ScrollTrigger.create({
    trigger: faq,
    start: "top bottom",
    end: "bottom top",
    onUpdate: apply,
    onRefresh: refresh
  });
  faq.addEventListener("toggle", function (event) {
    if (!event.target.matches("details.q")) return;
    requestAnimationFrame(function () { ScrollTrigger.refresh(); });
  }, true);
  window.addEventListener("resize", refresh, { passive: true });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
    ScrollTrigger.refresh();
    refresh();
  }); else refresh();
}());
