/* Build Your Programme, flowing page: frame times during the Next glide from step 02 to 03 at 1835x605. node lab/bespoke-frame-probe.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [W, H] of [[1835, 605], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href, { timeout: 60000 });
  await p.waitForLoadState('load'); await p.waitForTimeout(1500);
  if (process.env.NOBLUR) await p.addStyleTag({ content: process.env.NOBLUR });
  for (let i = 0; i < 2; i++) { await p.click('[data-next]'); await p.waitForTimeout(1500); }
  await p.evaluate(() => { window.__f = []; let last = performance.now(); (function f(t) { window.__f.push(Math.round(t - last)); last = t; if (window.__f.length < 400) requestAnimationFrame(f); })(last); });
  const t0 = Date.now();
  await p.click('[data-next]');
  const clickMs = Date.now() - t0;
  await p.waitForTimeout(2600);
  const f = await p.evaluate(() => window.__f);
  const long = f.map((v, i) => [i, v]).filter(x => x[1] > 50);
  console.log(W + 'x' + H, 'click took', clickMs, 'ms; frames', f.length, 'long frames (index, ms):', JSON.stringify(long.slice(0, 12)));
  await p.close();
}
await b.close();
