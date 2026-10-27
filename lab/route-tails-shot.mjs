// Screenshot of the house route after the film has carried the fill to the last stop.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
const top = await p.evaluate(() => document.querySelector('[data-route]').getBoundingClientRect().top + scrollY);
await p.evaluate(() => scrollTo(0, 13000));
await p.waitForTimeout(1200);
await p.screenshot({ path: path.join(OUT, 'route-tails.png') });
await b.close();
