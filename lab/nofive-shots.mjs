import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.mouse.move(w / 2, h / 2);
  const info = () => p.evaluate(() => { const s = document.querySelector('#tailored'); const r = s.getBoundingClientRect(); return { top: r.top + scrollY, h: s.offsetHeight, y: scrollY, vh: innerHeight, p: -r.top / (s.offsetHeight - innerHeight) }; });
  const txt = () => p.evaluate(() => [...document.querySelectorAll('[data-out]')].map(e => e.textContent).join('/') + ' sel=' + getComputedStyle(document.querySelector('.ty__track')).getPropertyValue('--sel'));
  async function goto(targetY) {
    for (let i = 0; i < 400; i++) {
      const y = await p.evaluate(() => scrollY); const d = targetY - y;
      if (Math.abs(d) < 8) break;
      await p.mouse.wheel(0, Math.max(-300, Math.min(300, d))); await p.waitForTimeout(30);
    }
    await p.waitForTimeout(1500);
  }
  const I = await info(); const span = I.h - I.vh;
  const shots = h > 500 && w > 900 ? [['p0.28-lineappears', .28], ['p0.34-at7', .34], ['p0.48', .48], ['p0.62-at14', .62], ['p0.76', .76], ['p0.88-at30', .88]] : [['top', .0], ['mid', .5], ['end', 1]];
  for (const [n, f] of shots) {
    await goto(I.top + f * span + (w <= 900 ? 0 : 0));
    await p.screenshot({ path: `${out}/${w}-${n}.png` });
    console.log(w, n, JSON.stringify(await info()), await txt());
  }
  for (const d of [14, 30, 7]) {
    const btn = p.locator(`.ty__day[data-days="${d}"]`);
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click(); await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${w}-click${d}.png` });
    console.log(w, 'click', d, await txt());
  }
  const geo = await p.evaluate(() => { const q = s => [...document.querySelectorAll(s)].map(e => { const r = e.getBoundingClientRect(); return [e.dataset.days || e.className, Math.round(r.left), Math.round(r.right), Math.round(r.top), Math.round(r.bottom)]; }); return { unit: q('.ty__unit'), days: q('.ty__day'), rail: q('.ty__rail'), stops: q('.ty__stop'), tip: q('.ty__tip'), overflow: document.documentElement.scrollWidth - innerWidth }; });
  console.log(w, JSON.stringify(geo));
  console.log(w, 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
