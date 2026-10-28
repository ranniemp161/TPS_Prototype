// Screens the Up to changes: home counters, Programmes card and table, Bespoke massage line (Opus, 28 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || os.tmpdir();
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const b = await chromium.launch({ executablePath: exe });
const open = async (page, w) => { const p = await b.newPage({ viewport: { width: w, height: w > 800 ? 900 : 844 } });
  await p.goto(pathToFileURL(path.join(ROOT, 'index', page)).href, { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800); return p; };
for (const w of [1440, 390]) {
  // Home: the counters are pinned in the bath scene; force the finished figures visible and shoot the block.
  let p = await open('index.html', w);
  await p.evaluate(() => { const f = document.querySelector('[data-bath-figures]'); f.style.cssText += ';opacity:1!important;visibility:visible!important;transform:none!important;position:relative!important;inset:auto!important;'; document.querySelectorAll('[data-bath-count]').forEach(n => n.textContent = n.dataset.bathCount); document.body.prepend(f); window.scrollTo(0,0); });
  await p.waitForTimeout(500); await p.locator('[data-bath-figures]').screenshot({ path: path.join(OUT, `home-figs-${w}.png`) }); await p.close();
  p = await open('programmes.html', w);
  const card = p.locator('.pg-care'); await card.scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await card.screenshot({ path: path.join(OUT, `pg-card-${w}.png`) });
  const tb = p.locator('.pg-table__treat'); await tb.scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await tb.screenshot({ path: path.join(OUT, `pg-table-${w}.png`) });
  await p.close();
}
await b.close();
