/* Lists elements wider than the viewport. node lab/overflow-find.mjs <file.html> [width] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [file, w = '390'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(pathToFileURL(file).href);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);
console.log(await p.evaluate(() => {
  const W = document.documentElement.clientWidth, out = [];
  for (const el of document.querySelectorAll('#confinement-heading, #confinement-heading *, .act--programmes h2, .act--programmes h2 *, .treatments-addon')) {
    const r = el.getBoundingClientRect();
    if (r.width) out.push(`${el.tagName}.${el.className} right=${Math.round(r.right)} "${el.textContent.trim().slice(0,40)}"`);
  }
  return out.slice(0, 15).join('\n');
}));
await b.close();
