import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const READ = () => {
  const g = s => { const e = document.querySelector(s); if (!e) return 'missing';
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return `top ${Math.round(r.top)} h ${Math.round(r.height)} op ${(+cs.opacity).toFixed(2)} ${cs.position}`; };
  return {
    y: Math.round(window.scrollY),
    heroStage: g('.act--hero .stage'),
    heroImg: g('.act--hero .stage img'),
    veil: g('[data-fog-veil]'),
    bath: g('.bath'),
    bathImg: g('.bath__img'),
    ground: g('[data-bath-ground]'),
    triggers: ScrollTrigger.getAll().length
  };
};
for (const [tag, hash] of [['clean', ''], ['hash ', '#programmes']]) {
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto(pathToFileURL(path.join(ROOT, 'v1.html')).href + hash, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(1200);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
  await p.waitForTimeout(3000);                       // far longer than any scrub
  await p.screenshot({ path: 'C:/Users/LenoVo/AppData/Local/Temp/wb_' + tag.trim() + '.png' });
  const r = await p.evaluate(READ);
  console.log('\n== ' + tag + ' ==');
  for (const k of Object.keys(r)) console.log('  ' + k.padEnd(10), r[k]);
  await p.close();
}
await b.close();
