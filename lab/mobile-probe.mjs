/* Zoomed screenshots and measurements at phone width. node lab/mobile-probe.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
const spots = { z1: 8050, z2: 8500, ty1: 9400, ty2: 9900, ty3: 10250, dn1: 11300, dn2: 15000, vt1: 18600, sp: 3900 };
for (const [k, y] of Object.entries(spots)) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(1200); await p.screenshot({ path: `${out}/p-${k}.png` }); }
const m = await p.evaluate(() => {
  const q = (s) => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null);
  const fs = (s) => { const e = q(s)[0]; return e ? Math.round(parseFloat(getComputedStyle(e).fontSize) * 10) / 10 : null; };
  const hs = (s) => q(s).slice(0, 3).map(e => Math.round(e.getBoundingClientRect().height));
  const r = {};
  r.fonts = {
    ty_card_p: fs('.ty__card p'), ty_card_h: fs('.ty__card h2, .ty__card h3, .ty__card .wh2'), ty_fig_label: fs('.ty__fig small, .ty__fig span, .ty__figs small, [class*="ty__f"] small'), ty_unit: fs('.ty__unit'),
    dn_label: fs('.dn__lab, .dnf__lab, [class*="dn"] [class*="lab"]'), dn_glass_p: fs('.dnf__glass p, .dn__glass p, [class*="dn"] .wp'), dn_time: fs('[class*="dn"] time, [class*="dn"] .mono'),
    vt_p: fs('.vt__body p'), vt_time: fs('.vt__body time'), vt_h3: fs('.vt__body h3'),
    hd_p: fs('.hd__kind p'), hd_item: fs('.hd__item, .hd__row, .hd__q'), spec_checks: fs('.spec__checks li, .spec__check'), spec_p: fs('.spec p'),
    intro_p: fs('.op__more .wp'), zones_p: fs('.zones p'), zones_tab: fs('.zones__tab'),
  };
  r.taps = { hd_rows: hs('.hd__kind button, .hd__kind summary, .hd__item'), zones_tabs: hs('.zones__tab'), read_more: hs('.ty__more, [class*="more"] button, button.when-closed, .dnf__more, button[aria-expanded]') };
  const z = document.querySelector('[data-section="housekeeping-zones"], .zones, [data-section-name="Housekeeping Zones"]');
  if (z) { const kids = [...z.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim()).map(e => { const rc = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 30), top: Math.round(rc.top + scrollY), h: Math.round(rc.height), vis: getComputedStyle(e).visibility, op: getComputedStyle(e).opacity, col: getComputedStyle(e).color }; }); r.zonesText = kids.slice(0, 30); r.zonesRect = { top: Math.round(z.getBoundingClientRect().top + scrollY), h: Math.round(z.getBoundingClientRect().height) }; }
  return r;
});
console.log(JSON.stringify(m, null, 1));
await b.close();
