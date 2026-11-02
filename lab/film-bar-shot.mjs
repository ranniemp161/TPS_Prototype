// The film's control bar, silent and with sound (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
const y = await p.evaluate(() => { const r = document.querySelector('[data-film-stage]').getBoundingClientRect(); return r.bottom + scrollY - innerHeight + 40; });
let at = 0; while (at + 300 < y) { await p.mouse.wheel(0, 300); at += 300; await p.waitForTimeout(60); }
await p.waitForTimeout(4000);
await p.screenshot({ path: path.join(OUT, 'film-bar-silent-1440.png') });
await p.click('[data-film-mute]'); await p.waitForTimeout(1500);
await p.screenshot({ path: path.join(OUT, 'film-bar-sound-1440.png') });
await b.close();
