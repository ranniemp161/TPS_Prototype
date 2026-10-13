/* ============================================================
   THE FEE TICKER (TJ, 10 Oct 2026)

   The money is counted, not swapped. A figure like £6,399 is built as a
   static pound sign, one rolling column per digit (a strip of 0 to 9
   clipped to one glyph) and static commas. On a change, each column
   rolls to its new digit, right to left with a short stagger; a digit
   that does not change does not move. When the number of digits changes
   the columns are rebuilt and the new ones roll up from 0.

   One call: FeeTicker.create(el).set(pounds, animate). Nothing else on
   the page knows how the figure moves. Reduced motion swaps the text.
   Transform only; no layout work per frame.
   ============================================================ */

var FeeTicker = (function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = 520, STAGGER = 40;
  var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

  function format(n) { return '£' + Math.round(n).toLocaleString('en-GB'); }

  function create(el) {
    var shown = null;          // last whole number set
    var cols = [];             // digit strips, left to right

    function build(text) {
      el.textContent = '';
      el.classList.add('roll');
      cols = [];
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (/\d/.test(ch)) {
          var col = document.createElement('span');
          col.className = 'roll__col';
          var strip = document.createElement('span');
          strip.className = 'roll__strip';
          for (var d = 0; d <= 9; d++) {
            var g = document.createElement('span');
            g.className = 'roll__g';
            g.textContent = String(d);
            strip.appendChild(g);
          }
          col.appendChild(strip);
          el.appendChild(col);
          cols.push({ strip: strip, digit: 0 });
        } else {
          var s = document.createElement('span');
          s.className = 'roll__fixed';
          s.textContent = ch;
          el.appendChild(s);
        }
      }
    }

    function place(c, digit, animate, delay) {
      c.strip.style.transition = animate
        ? 'transform ' + DUR + 'ms ' + EASE + ' ' + delay + 'ms'
        : 'none';
      c.strip.style.transform = 'translateY(' + (-digit * 10) + '%)';
      c.digit = digit;
    }

    function set(n, animate) {
      var value = Math.round(n);
      var text = format(value);
      var digits = text.replace(/\D/g, '');
      var rebuild = !cols.length || digits.length !== cols.length;
      var move = animate && !REDUCED && shown !== null && value !== shown;

      if (rebuild) {
        build(text);
        cols.forEach(function (c) { place(c, 0, false, 0); });
        void el.offsetWidth;   // commit the zero position before rolling
        if (!move) {
          cols.forEach(function (c, i) { place(c, +digits.charAt(i), false, 0); });
        }
      }
      if (move) {
        // Right to left: the last column moves first, as an odometer does.
        var last = cols.length - 1;
        cols.forEach(function (c, i) {
          var target = +digits.charAt(i);
          if (target !== c.digit || rebuild) place(c, target, true, (last - i) * STAGGER);
        });
        el.classList.remove('is-rolling');
        void el.offsetWidth;
        el.classList.add('is-rolling');
        clearTimeout(el._t);
        el._t = setTimeout(function () { el.classList.remove('is-rolling'); }, DUR + last * STAGGER + 60);
      } else if (!rebuild) {
        cols.forEach(function (c, i) { place(c, +digits.charAt(i), false, 0); });
      }
      el.setAttribute('data-value', String(value));
      var prev = shown;
      shown = value;
      return prev;
    }

    return { set: set, value: function () { return shown; } };
  }

  return { create: create, format: format };
})();
