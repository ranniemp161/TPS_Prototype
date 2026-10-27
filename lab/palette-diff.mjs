/* PALETTE DIFF (TJ, 26 Oct 2026)
     node lab/palette-diff.mjs <setA> <setB>
   Compares same named PNGs in lab/shots/palette/<setA>/ and <setB>/. pngjs and pixelmatch are not installed, so both
   images are decoded in a Chrome canvas through playwright-core and compared there. A pixel differs when any channel
   differs by more than 0.1 of 255 (25.5). Writes a diff PNG for any file with differing pixels to
   lab/shots/palette/diff-<setA>-<setB>/. Exit code 1 if any file differs by more than 0.05 percent, or is missing or resized. */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [A, B] = process.argv.slice(2);
if (!A || !B) { console.error('usage: node lab/palette-diff.mjs <setA> <setB>'); process.exit(1); }
const BASE = path.join(ROOT, 'lab', 'shots', 'palette');
const dA = path.join(BASE, A), dB = path.join(BASE, B), dOut = path.join(BASE, `diff-${A}-${B}`);
for (const d of [dA, dB]) if (!existsSync(d)) { console.error('missing folder ' + d); process.exit(1); }
const files = [...new Set([...readdirSync(dA), ...readdirSync(dB)])].filter(f => f.endsWith('.png')).sort();

const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const page = await browser.newPage();
await page.goto('about:blank');

const compare = async ({ a64, b64, tol }) => {
  const load = s => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = 'data:image/png;base64,' + s; });
  const [ia, ib] = await Promise.all([load(a64), load(b64)]);
  if (ia.width !== ib.width || ia.height !== ib.height) return { sizeMismatch: [ia.width, ia.height, ib.width, ib.height] };
  const px = i => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' }); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height); };
  const da = px(ia), db = px(ib), out = new ImageData(ia.width, ia.height);
  let n = 0;
  for (let k = 0; k < da.data.length; k += 4) {
    const d = Math.max(Math.abs(da.data[k] - db.data[k]), Math.abs(da.data[k + 1] - db.data[k + 1]), Math.abs(da.data[k + 2] - db.data[k + 2]));
    if (d > tol) { n++; out.data[k] = 255; out.data[k + 1] = 0; out.data[k + 2] = 80; out.data[k + 3] = 255; }
    else { const g = Math.round(da.data[k] * .3 + da.data[k + 1] * .59 + da.data[k + 2] * .11) * .25 + 191; out.data[k] = out.data[k + 1] = out.data[k + 2] = g; out.data[k + 3] = 255; }
  }
  const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height; c.getContext('2d').putImageData(out, 0, 0);
  return { n, total: ia.width * ia.height, w: ia.width, h: ia.height, png: n ? c.toDataURL('image/png').split(',')[1] : null };
};

let bad = 0;
for (const f of files) {
  const pa = path.join(dA, f), pb = path.join(dB, f);
  if (!existsSync(pa) || !existsSync(pb)) { console.log(`MISSING   ${f} (only in ${existsSync(pa) ? A : B})`); bad++; continue; }
  const r = await page.evaluate(compare, { a64: readFileSync(pa).toString('base64'), b64: readFileSync(pb).toString('base64'), tol: 25.5 });
  if (r.sizeMismatch) { console.log(`SIZE      ${f} ${r.sizeMismatch.slice(0, 2).join('x')} vs ${r.sizeMismatch.slice(2).join('x')}`); bad++; continue; }
  const pct = r.n / r.total * 100;
  if (r.n) { mkdirSync(dOut, { recursive: true }); writeFileSync(path.join(dOut, f), Buffer.from(r.png, 'base64')); }
  if (pct > 0.05) bad++;
  console.log(`${pct > 0.05 ? 'DIFF ' : r.n ? 'tiny ' : 'same '}  ${f.padEnd(40)} ${String(r.n).padStart(8)} px  ${pct.toFixed(4)}%  (${r.w}x${r.h})`);
}
await browser.close();
console.log(bad ? `${bad} file(s) over 0.05 percent or missing` : 'all files within 0.05 percent');
process.exit(bad ? 1 : 0);
