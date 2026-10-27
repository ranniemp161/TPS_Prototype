/* Palette panel acceptance check (TJ, 26 Oct 2026). Prototype only. */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = process.env.CHROME_PATH;
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const d = document.documentElement;
    window.__dcl = { p: d.getAttribute('data-palette'), r: d.getAttribute('data-reach') };
  });
  /* attribute at the earliest moment a head script could have set it */
  const mo = new MutationObserver(() => {
    const d = document.documentElement;
    if (d && d.hasAttribute('data-palette') && !window.__first) window.__first = d.getAttribute('data-palette');
  });
  const t = setInterval(() => { if (document.documentElement) { mo.observe(document.documentElement, { attributes: true }); clearInterval(t); } }, 0);
});
await ctx.grantPermissions(['clipboard-read','clipboard-write']);
const page = await ctx.newPage();
const u = pathToFileURL(path.join(ROOT, 'index', 'programmes.html')).href;
await page.goto(u + '?palette=olive&reach=button&panel=show', { waitUntil: 'load' });
console.log('dcl', await page.evaluate(() => window.__dcl), 'first', await page.evaluate(() => window.__first));
console.log('acc', await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim()));
console.log('theme', await page.evaluate(() => document.querySelector('meta[name=theme-color]').content));
await page.goto(pathToFileURL(path.join(ROOT, 'index', 'index.html')).href + '?panel=show', { waitUntil: 'load' });
console.log('persist', await page.evaluate(() => [document.documentElement.dataset.palette, document.documentElement.dataset.reach, localStorage.getItem('tps-palette')]));
/* panel shots */
const out = path.join(ROOT, 'lab', 'shots', 'palette', 'panel'); mkdirSync(out, { recursive: true });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(500);
  await page.evaluate(() => document.getElementById('tps-palette-panel').shadowRoot.querySelector('.pill').click());
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, `panel-open-${w}.png`) });
  if (w === 1440) {
    await page.evaluate(() => [...document.getElementById('tps-palette-panel').shadowRoot.querySelectorAll('.row')].find(b => b.dataset.id === 'teal').click());
    console.log('after click', await page.evaluate(() => [document.documentElement.dataset.palette, localStorage.getItem('tps-palette'), document.querySelector('meta[name=theme-color]').content]));
    await page.evaluate(() => document.getElementById('tps-palette-panel').shadowRoot.querySelector('.cp').click());
    console.log('clip', await page.evaluate(() => navigator.clipboard.readText().catch(e => 'err ' + e.message)));
  }
}
await browser.close();
