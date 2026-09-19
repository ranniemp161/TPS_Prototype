import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const run = async file => {
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(900);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const out = [];
  for (const v of [0, 1.4, 1.55, 1.8, 2.9, 3.6, 4.0, 4.3, 4.6, 5.2]) {
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    await p.waitForTimeout(700);
    out.push([v, await p.evaluate(() => Math.round(+getComputedStyle(document.querySelector('[data-drift]')).opacity * 1000) / 1000)]);
  }
  await p.close();
  return out;
};
const aft = await run('v1.html');
const bef = await run('v1-ruined.html');
console.log('  vh    field opacity  RUINED    V1');
aft.forEach(([v, o], i) => console.log(`  ${String(v).padStart(4)}         ${String(bef[i][1]).padEnd(10)}  ${o}`));
await b.close();
