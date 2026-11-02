// Reads the colour of the gallery's selected length title (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
await p.evaluate(() => document.fonts.ready);
console.log(await p.evaluate(() => { const h = document.querySelector('.act--programmes .gal__heading'); return h.className + ' ' + getComputedStyle(h).color; }));
await b.close();
