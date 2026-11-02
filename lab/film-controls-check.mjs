// Home film: controls always shown, sound button restarts with sound, mute
// returns to the silent loop, the end returns to the silent loop (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
  const y = await p.evaluate(() => { const r = document.querySelector('[data-film-stage]').getBoundingClientRect(); return r.top + scrollY + r.height / 2 - innerHeight / 2; });
  let at = 0; while (at + 300 < y) { await p.mouse.wheel(0, 300); at += 300; await p.waitForTimeout(60); }
  await p.waitForTimeout(3500);
  const st = () => p.evaluate(() => { const v = document.querySelector('[data-film-video]'); const bar = document.querySelector('[data-film-bar]'); const m = document.querySelector('[data-film-mute]'); return { t: +v.currentTime.toFixed(2), muted: v.muted, paused: v.paused, loop: v.loop, barVis: getComputedStyle(bar).visibility === 'visible' && +getComputedStyle(bar).opacity > .9, p: +getComputedStyle(bar).getPropertyValue('--film-p') || 0, pressed: m.getAttribute('aria-pressed'), oldBtn: !!document.querySelector('[data-film-sound]') }; });
  let s = await st(); console.log(w, 'silent', JSON.stringify(s));
  ok(s.barVis && s.muted && !s.paused && s.t > 0.5 && s.p > 0 && !s.oldBtn && s.pressed === 'false', `${w} silent loop playing, controls showing, timeline moving, no Play with sound`);
  await p.screenshot({ path: path.join(OUT, `film-silent-${w}.png`) });
  if (w === 390) { await p.close(); continue; } // phone goes full screen on sound, as before
  await p.click('[data-film-mute]'); await p.waitForTimeout(400);
  s = await st(); console.log(w, 'sound', JSON.stringify(s));
  ok(!s.muted && s.t < 1 && !s.loop && s.pressed === 'true', `${w} sound on restarts from the top`);
  await p.screenshot({ path: path.join(OUT, `film-sound-${w}.png`) });
  await p.click('[data-film-mute]'); await p.waitForTimeout(400);
  s = await st(); ok(s.muted && s.loop && !s.paused && s.pressed === 'false', `${w} mute returns to the silent loop`);
  await p.click('[data-film-mute]'); await p.waitForTimeout(300);
  // The test browser has no audio output and stalls playback with sound on, so the
  // film's end is signalled directly; a real browser fires the same event.
  await p.evaluate(() => document.querySelector('[data-film-video]').dispatchEvent(new Event('ended')));
  await p.waitForTimeout(800);
  s = await st(); console.log(w, 'after end', JSON.stringify(s));
  ok(s.muted && s.loop && !s.paused && s.pressed === 'false', `${w} the end returns to the silent loop`);
  ok(!errs.length, `${w} no page errors ${errs.join(' ')}`);
  await p.close();
}
await b.close();
console.log(fails ? fails + ' FAILED' : 'all ok');
