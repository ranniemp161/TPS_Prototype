// Loads each page and reports any script errors (Opus, 1 Nov 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const pages = ['index.html', 'what-we-do.html', 'programmes.html', 'build-your-programme.html', 'faqs.html', 'about.html', 'who-comes-into-your-home.html', 'single-treatments.html', 'gifts.html', 'request-a-place.html'];
let n = 0;
for (const f of pages) {
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', f)).href);
  await p.waitForTimeout(1500);
  console.log(f.padEnd(32), errs.length ? errs.join(' / ') : 'no errors');
  n += errs.length;
  await p.close();
}
await b.close();
process.exit(n ? 1 : 0);
