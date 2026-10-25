/* The home film in its new place: silent loop in view, Play restarts it with
   sound and shows the timeline, pause works, leaving view returns to the loop.
   node lab/film-play-check.mjs [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
const st = () => p.evaluate(() => { const v = document.querySelector('[data-film-video]'); const s = document.querySelector('.film'); return `paused ${v.paused} muted ${v.muted} time ${v.currentTime.toFixed(1)} sound-mode ${s.classList.contains('is-sound')} button "${document.querySelector('[data-film-sound]').textContent.trim()}"`; });
await p.evaluate(() => document.querySelector('.film__stage').scrollIntoView({ block: 'center' })); await p.waitForTimeout(2500);
console.log('in view          ', await st());
await p.click('[data-film-sound]'); await p.waitForTimeout(1500);
console.log('after Play       ', await st(), '| timeline visible', await p.evaluate(() => getComputedStyle(document.querySelector('.film__bar')).visibility));
await p.click('[data-film-pause]'); await p.waitForTimeout(600);
console.log('after pause      ', await st());
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1500);
console.log('scrolled away    ', await st());
const box = await p.evaluate(() => { const r = document.querySelector('.film__stage').getBoundingClientRect(); return `frame ${Math.round(r.width)} x ${Math.round(r.height)} of a ${innerWidth} wide window, corner radius ${getComputedStyle(document.querySelector('.film__stage')).borderRadius}`; });
console.log(box, '| errors', JSON.stringify(errs));
await b.close();
