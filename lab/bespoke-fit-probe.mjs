/* Bespoke Programmes fit probe (12 Oct 2026): a screenshot of chosen pages in
   the held frame, even where the fit check would release it, so an overflow
   can be seen. node lab/bespoke-fit-probe.mjs <outdir> <WxH> <state> <pages>
   state: default | full | bare; pages like 8,10,11 */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
const [out, size, state = 'default', list = ''] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: w, height: h } });
const url = pathToFileURL(process.cwd() + '/index/build-your-programme.html').href;
try { await p.goto(url, { timeout: 30000 }); } catch (e) { await p.goto(url, { timeout: 60000 }); }
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
await p.evaluate((state) => {
  const form = document.querySelector('[data-builder-scope]');
  const fire = (i) => i.dispatchEvent(new Event('change', { bubbles: true }));
  const radio = (n, v) => { const i = form.querySelector(`input[name="${n}"][value="${v}"]`); i.checked = true; fire(i); };
  const box = (n, on) => { const i = form.querySelector(`input[name="${n}"]`); i.checked = on; fire(i); };
  if (state === 'full') {
    radio('days', '30'); radio('shift', 'night');
    ['massage', 'scrub', 'reflex', 'facial', 'herbfoot', 'thermal'].forEach(n => box(n, true));
    [...form.querySelectorAll('.prio input')].forEach(i => { i.checked = true; fire(i); });
    const bud = document.getElementById('budget'); bud.value = 3000; bud.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (state === 'bare') {
    radio('meals', 'no');
    ['massage', 'scrub', 'reflex', 'facial', 'herbfoot', 'thermal'].forEach(n => box(n, false));
  }
}, state);
await p.waitForTimeout(500);
for (const i of list.split(',').filter(Boolean).map(Number)) {
  await p.evaluate((i) => {
    document.documentElement.setAttribute('data-fit-hold', ''); const app = document.querySelector('.dk'); app.classList.remove('is-free'); document.body.classList.remove('dk-is-free');
    window.scrollTo({ top: 0, behavior: 'instant' });
    const d = document.querySelector('[data-deck]'); d.scrollTo({ left: i * d.clientWidth, behavior: 'instant' });
    document.querySelectorAll('.dk-page').forEach((pg, k) => { pg.inert = k !== i; });
  }, i);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/probe-${state}-p${i}-${w}x${h}.png` });
}
await b.close();
