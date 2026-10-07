(function () {
  "use strict";

  var page = document.querySelector(".page--faqs");
  var faq = document.querySelector(".faq--morph");
  var nav = document.querySelector("[data-nav]");
  var groups = faq ? Array.prototype.slice.call(faq.querySelectorAll(".faq__group")) : [];
  if (!page || !faq || !nav || groups.length !== 8 || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  var states = [
    { ground: "#F3EFEC", night: 0 },
    { ground: "#E2CAC6", night: 0 },
    { ground: "#CD8E81", night: 0 },
    { ground: "#A64C45", night: 1 },
    { ground: "#5A524F", night: 1 },
    { ground: "#A64C45", night: 1 },
    { ground: "#CD8E81", night: 0 },
    { ground: "#E2CAC6", night: 0 },
    { ground: "#F3EFEC", night: 0 }
  ];
  var anchors = [];

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function smooth(value) {
    value = clamp(value, 0, 1);
    return value * value * (3 - 2 * value);
  }
  function rgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }
  function mix(from, to, amount) {
    var a = rgb(from), b = rgb(to);
    return "rgb(" + a.map(function (value, index) {
      return Math.round(value + (b[index] - value) * amount);
    }).join(", ") + ")";
  }
  function measure() {
    var offset = window.innerHeight * .45;
    anchors = [faq.offsetTop];
    for (var index = 1; index < groups.length; index += 1) {
      anchors.push(groups[index].getBoundingClientRect().top + window.scrollY - offset);
    }
    anchors.push(Math.max(anchors[anchors.length - 1] + 1, faq.offsetTop + faq.offsetHeight - window.innerHeight * .55));
  }
  function stateAt(y) {
    if (y <= anchors[0]) return states[0];
    for (var index = 0; index < anchors.length - 1; index += 1) {
      if (y <= anchors[index + 1]) {
        var amount = smooth((y - anchors[index]) / Math.max(1, anchors[index + 1] - anchors[index]));
        return {
          ground: mix(states[index].ground, states[index + 1].ground, amount),
          night: states[index].night + (states[index + 1].night - states[index].night) * amount
        };
      }
    }
    return states[states.length - 1];
  }
  function apply() {
    var state = stateAt(window.scrollY);
    var night = smooth(state.night);
    page.style.setProperty("--faq-ground", state.ground);
    page.style.setProperty("--faq-night", night.toFixed(3));
    page.classList.toggle("is-night-copy", night >= .55);

    if (night <= .001) {
      nav.removeAttribute("data-nd");
      nav.style.removeProperty("--nd");
      nav.classList.remove("is-dark");
    } else {
      nav.setAttribute("data-nd", "");
      nav.style.setProperty("--nd", night.toFixed(3));
      nav.classList.toggle("is-dark", night >= .55);
    }
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
