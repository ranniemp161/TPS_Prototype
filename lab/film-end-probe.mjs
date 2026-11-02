// Does the film fire 'ended' after sound on and a seek to the end? (TJ, 2 Nov 2026; Opus)
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.env.URL || pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
await p.evaluate(() => { const v = document.querySelector('[data-film-video]'); window.__ev = []; ['ended', 'pause', 'seeked', 'waiting', 'stalled'].forEach(n => v.addEventListener(n, () => __ev.push(n + '@' + v.currentTime.toFixed(2)))); document.querySelector('[data-film-stage]').scrollIntoView({ block: 'center' }); });
await p.waitForTimeout(3000);
await p.click('[data-film-mute]'); await p.waitForTimeout(800);
// play right through to the end rather than seeking (a seek stalls the file in the test browser)
await p.waitForTimeout(27000);
console.log(await p.evaluate(() => { const v = document.querySelector('[data-film-video]'); return JSON.stringify({ pressed: document.querySelector('[data-film-mute]').getAttribute('aria-pressed'), loop: v.loop, paused: v.paused, ev: __ev, ended: v.ended, t: v.currentTime, muted: v.muted, rs: v.readyState }); }));
await b.close();
