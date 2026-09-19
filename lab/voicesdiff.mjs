/* Is the testimonial section in v1 the same as the one in v1-ruined? Parks
   each at the top of its own section, freezes the shader so the ground is
   deterministic, and diffs the pixels.
     node lab/voicesdiff.mjs <outdir> <w> <h> */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2], W = +(process.argv[3]||1600), H = +(process.argv[4]||900);
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [tag, file] of [['v1','v1.html'],['rn','v1-ruined.html']]) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs=[]; p.on('pageerror', e=>errs.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto';
    const a=document.querySelector('.act--voices');
    window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY); });
  await p.waitForTimeout(1400);
  await p.evaluate(() => { if (window.__drift) window.__drift.freeze(12); });
  await p.waitForTimeout(400);
  const box = await p.locator('.act--voices').boundingBox();
  await p.screenshot({ path: path.join(OUT, tag + '.png'),
    clip: { x: 0, y: Math.max(0, box.y), width: W, height: Math.min(box.height, H - Math.max(0, box.y)) } });
  console.log(`  ${tag}: section ${Math.round(box.height)}px   errors ${errs.length?errs.join('|'):'none'}`);
  await p.close();
}
await b.close();
