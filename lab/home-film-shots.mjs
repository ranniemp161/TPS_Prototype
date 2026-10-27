// Home film and What We Do flight check (21 Oct 2026). Real wheel input, fonts resolved.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const errs = [];
async function wheelTo(p, fn, tol = 30) {
  for (let i = 0; i < 600; i++) {
    const d = await p.evaluate(fn);
    if (Math.abs(d) < tol) break;
    await p.mouse.wheel(0, Math.sign(d) * Math.min(200, Math.abs(d)));
    await p.waitForTimeout(40);
  }
  await p.waitForTimeout(1200);
}
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(w + ' pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(w + ' console ' + m.text()); });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
  await p.mouse.move(w / 2, h / 2);
  // positions keyed to the film section's top, in windows: -0.5 smoke over the lifting bath, 0.6 bath almost gone, 1.5 held, 2.25 leaving, 3 past
  for (const [k, at] of [['a-smoke', 0.45], ['b-lift', 0.7], ['c-held', 1.5], ['d-leave', 2.2], ['e-past', 2.9]]) {
    await wheelTo(p, `(()=>{const r=document.querySelector('[data-film-section]').getBoundingClientRect();return r.top+innerHeight*${at}})()`);
    const st = await p.evaluate(() => { const v = document.querySelector('[data-film-video]'); return { paused: v.paused, muted: v.muted, t: +v.currentTime.toFixed(2), src: v.currentSrc.split('/').pop(), ready: v.readyState }; });
    console.log(w, k, JSON.stringify(st));
    await p.screenshot({ path: out + `home-${w}-${k}.png` });
  }
  await wheelTo(p, `(()=>{const r=document.querySelector('[data-film-section]').getBoundingClientRect();return r.top+innerHeight*1.5})()`);
  await p.click('[data-film-sound]'); await p.waitForTimeout(1500);
  const st = await p.evaluate(() => { const v = document.querySelector('[data-film-video]'); return { paused: v.paused, muted: v.muted, loop: v.loop, t: +v.currentTime.toFixed(2), cls: document.querySelector('[data-film-section]').className }; });
  console.log(w, 'after sound', JSON.stringify(st));
  await p.screenshot({ path: out + `home-${w}-f-sound.png` });
  await ctx.close();

  const ctx2 = await b.newContext({ viewport: { width: w, height: h } });
  const q = await ctx2.newPage();
  q.on('pageerror', e => errs.push(w + ' wwd pageerror ' + e.message));
  q.on('console', m => { if (m.type() === 'error') errs.push(w + ' wwd console ' + m.text()); });
  await q.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await q.evaluate(() => document.fonts.ready); await q.waitForTimeout(1000);
  await q.mouse.move(w / 2, h / 2);
  for (const [k, at] of [['a-enter', 0.5], ['b-door', 1.0], ['c-kitchen', 3.5], ['d-end', -1]]) {
    const fn = at < 0
      ? `(()=>{const r=document.querySelector('[data-flight]').getBoundingClientRect();return r.bottom-innerHeight*0.5})()`
      : `(()=>{const r=document.querySelector('[data-flight]').getBoundingClientRect();return r.top+innerHeight*${at}})()`;
    await wheelTo(q, fn);
    await q.screenshot({ path: out + `wwd-${w}-${k}.png` });
  }
  await ctx2.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
