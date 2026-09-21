/* Checks the stage one nav: every page carries the same seven link menu,
   every href resolves to a file that exists, and the placeholder pages
   render. Added 2026-09-21 with the stage one rollout. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const PAGES = ['v1.html', 'programme.html', 'care.html', 'programmes.html',
               'single-treatments.html', 'about.html', 'specialist.html'];

const EXPECTED = [
  'care.html', 'programmes.html', 'programme.html',
  'single-treatments.html', 'about.html', 'specialist.html',
];

const b = await chromium.launch({ channel: 'chrome' });
let bad = 0;

for (const file of PAGES) {
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await p.waitForTimeout(500);

  // Open every panel so the links are in the DOM and reachable.
  const links = await p.evaluate(() =>
    [...document.querySelectorAll('.menu__panel a')].map(a => a.getAttribute('href')));

  const internal = links.filter(h => h && !h.startsWith('http') && !h.startsWith('#'));
  const missing = internal.filter(h => !EXPECTED.includes(h.split('#')[0]));
  const onDisk = internal.filter(h => !existsSync(h.split('#')[0]));
  const pending = await p.evaluate(() => document.querySelectorAll('.menu__pending').length);

  const ok = missing.length === 0 && onDisk.length === 0 && pending === 0 && errs.length === 0;
  if (!ok) bad++;
  console.log(
    file.padEnd(24),
    'links ' + String(internal.length).padStart(2),
    'unexpected ' + missing.length,
    'missing-on-disk ' + onDisk.length,
    'pending ' + pending,
    ok ? 'ok' : '<<< ' + JSON.stringify({ missing, onDisk, errs })
  );
  await p.close();
}

console.log(bad ? `\n${bad} page(s) wrong.` : '\nAll pages: same seven link menu, every target exists, no dead entries.');
await b.close();
