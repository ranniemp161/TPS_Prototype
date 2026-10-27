// Home film: glass Watch With Sound, timeline and pause (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const errs = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(w + ' ' + m.text()); });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
  await p.mouse.move(w / 2, h / 2);
  for (let i = 0; i < 600; i++) {
    const d = await p.evaluate(() => { const r = document.querySelector('[data-film-section]').getBoundingClientRect(); return r.top + innerHeight * 1.5; });
    if (Math.abs(d) < 30) break;
    await p.mouse.wheel(0, Math.sign(d) * Math.min(200, Math.abs(d))); await p.waitForTimeout(40);
  }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out + `${w}-1-silent.png` });
  await p.click('[data-film-sound]'); await p.waitForTimeout(4000);
  const s = async () => p.evaluate(() => { const v = document.querySelector('[data-film-video]'); return { t: +v.currentTime.toFixed(2), paused: v.paused, muted: v.muted, fs: !!document.fullscreenElement, cls: document.querySelector('[data-film-section]').className, p: document.querySelector('[data-film-bar]').style.getPropertyValue('--film-p') }; });
  console.log(w, 'playing', JSON.stringify(await s()));
  await p.screenshot({ path: out + `${w}-2-sound.png` });
  await p.click('[data-film-pause]'); await p.waitForTimeout(600);
  console.log(w, 'paused', JSON.stringify(await s()));
  await p.screenshot({ path: out + `${w}-3-paused.png` });
  const r = await p.evaluate(() => { const r = document.querySelector('[data-film-track]').getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, w: r.width }; });
  await p.mouse.move(r.x + r.w * 0.2, r.y); await p.mouse.down(); await p.mouse.move(r.x + r.w * 0.6, r.y, { steps: 6 }); await p.mouse.up();
  await p.waitForTimeout(600);
  console.log(w, 'dragged to 0.6', JSON.stringify(await s()));
  await p.screenshot({ path: out + `${w}-4-scrubbed.png` });
  await ctx.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
