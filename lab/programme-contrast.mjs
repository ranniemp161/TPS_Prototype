/* Contrast across the builder, in every state it can be in.
 *
 *   node lab/programme-contrast.mjs        (needs the page served on 4321)
 *
 * It reads pseudo element content as well as text nodes. That is not
 * fussiness: the Standard badge beside the massage rhythm is an ::after,
 * it sits on Blush whenever the standard rhythm is the chosen one, and
 * it measured 3.61 to 1 for several commits while ad hoc sweeps that
 * only walked text nodes reported the page clean.
 *
 * WCAG AA, so 4.5 to 1 for body text and 3 to 1 for large.
 */
import { chromium } from 'playwright-core';

const b = await chromium.launch({ channel: 'chrome' });
const fails = [];

const STATES = {
  plain:    () => {},
  stripped: () => { ['scrub','facial','dinner','massage'].forEach(n => {
                      const i = document.querySelector(`input[name="${n}"]`); if (i.checked) i.click(); }); },
  night:    () => { document.querySelector('input[name="shift"][value="night"]').click(); },
  liveout:  () => { document.querySelector('input[name="format"][value="out"]').click(); },
  thirty:   () => { document.querySelector('input[name="days"][value="30"]').click(); },
  budget:   () => { const t = document.querySelector('[data-view="budget"]'); if (t) t.click();
                    const i = document.querySelector('#budget');
                    i.value = '4200'; i.dispatchEvent(new Event('input', { bubbles: true })); },
  brief:    () => { document.querySelector('[data-brief-toggle]').click(); },
  // The count line sits on the Haze ground of the matters block and the
  // summary button takes a Blush fill once something is waiting in it.
  // Both are Ember tier on a tinted ground, which is where this page has
  // failed AA twice before.
  priorities: () => { [...document.querySelectorAll('.prio input')].slice(0,3).forEach(i => i.click()); }
};

for (const [w, h, label] of [[1440,900,'desktop'],[390,844,'phone']]) {
  for (const [name, fn] of Object.entries(STATES)) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://localhost:4321/programme.html', { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(350);
    await p.evaluate(`(${fn.toString()})()`);
    await p.waitForTimeout(300);

    const bad = await p.evaluate(() => {
      const lum = c => { const [r,g,bl] = c.match(/\d+(\.\d+)?/g).slice(0,3).map(Number)
        .map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
        return 0.2126*r + 0.7152*g + 0.0722*bl; };
      const bg = el => { let n = el;
        while (n && n !== document.documentElement) {
          const c = getComputedStyle(n).backgroundColor;
          if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c;
          n = n.parentElement; }
        return 'rgb(243,239,236)'; };
      const out = [];
      const check = (el, text, ps) => {
        const px = parseFloat(ps.fontSize), wt = parseInt(ps.fontWeight) || 400;
        const a = lum(ps.color), c = lum(bg(el));
        const hi = Math.max(a,c), lo = Math.min(a,c), r = (hi+0.05)/(lo+0.05);
        const need = (px >= 24 || (px >= 18.66 && wt >= 700)) ? 3 : 4.5;
        if (r < need) out.push(`${el.className || el.tagName} ${r.toFixed(2)} @${px}px "${String(text).slice(0,26)}"`);
      };
      document.querySelectorAll('main *, footer *, header *, .feebar *').forEach(el => {
        if (el.closest('[hidden]') || el.hidden) return;
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return;
        if ([...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
          check(el, el.textContent.trim(), s);
        ['::before', '::after'].forEach(pe => {
          const ps = getComputedStyle(el, pe), c = ps.content;
          if (c && c !== 'none' && c !== 'normal' && /^"/.test(c) && c.length > 3) check(el, c, ps);
        });
      });
      return out;
    });
    if (bad.length) fails.push(`${label}/${name}: ${bad.join(' | ')}`);
    await p.close();
  }
}

await b.close();
console.log(fails.length
  ? 'CONTRAST FAIL\n' + fails.join('\n')
  : `Contrast passes at two widths across ${Object.keys(STATES).length} states, text and pseudo elements.`);
process.exit(fails.length ? 1 : 0);
