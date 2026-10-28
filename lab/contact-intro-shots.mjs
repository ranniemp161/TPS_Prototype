// Screens the Programmes intro, the footer contact and the About contact (Opus, 28 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || os.tmpdir();
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const b = await chromium.launch({ executablePath: exe });
const shot = async (page, sel, w, name) => {
  const p = await b.newPage({ viewport: { width: w, height: w > 800 ? 900 : 844 } });
  await p.goto(pathToFileURL(path.join(ROOT, 'index', page)).href, { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
  await el.screenshot({ path: path.join(OUT, name + '.png') }); await p.close();
};
await shot('programmes.html', '.pg-look', 1440, 'intro-1440');
await shot('programmes.html', '.pg-look', 1280, 'intro-1280');
await shot('programmes.html', '.sf__inner', 1440, 'footer-1440');
await shot('programmes.html', '.sf__inner', 390, 'footer-390');
await shot('about.html', '.os-contact', 1440, 'about-1440');
await shot('about.html', '.os-contact', 390, 'about-390');
await b.close();
