/* Section map of What We Do at phone width. node lab/mobile-map.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
const m = await p.evaluate(() => {
  const H = document.documentElement.scrollHeight;
  const secs = [...document.querySelectorAll('[data-section]')].filter(s => !s.hidden && s.offsetParent !== null || getComputedStyle(s).position === 'fixed').map(s => {
    const r = s.getBoundingClientRect();
    return { name: s.dataset.sectionName || s.dataset.section, top: Math.round(r.top + scrollY), h: Math.round(r.height), screens: +(r.height / 844).toFixed(1), hidden: s.hidden };
  });
  const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  const eyebrows = [...document.querySelectorAll('.eyebrow, .kicker, [class*="eyebrow"], [class*="label"], [class*="kick"]')].filter(e => e.offsetParent !== null && e.textContent.trim()).map(e => ({ cls: e.className, text: e.textContent.trim().slice(0, 50), sec: e.closest('[data-section]')?.dataset.sectionName }));
  return { H, overflow, secs, eyebrows };
});
console.log('page height', m.H, 'screens', (m.H / 844).toFixed(1), 'horizontal overflow', m.overflow);
for (const s of m.secs) console.log(String(s.top).padStart(6), String(s.h).padStart(6), String(s.screens).padStart(5) + 'x', s.name);
console.log('--- eyebrow like elements'); for (const e of m.eyebrows) console.log(JSON.stringify(e));
await b.close();
