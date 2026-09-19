import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const file of ['lab/ruined-before/v1.html', 'v1-ruined.html']) {
  console.log('\n' + (file.includes('before') ? 'BEFORE' : 'AFTER '));
  for (const [w, h] of [[1600,900],[1904,945],[1280,670],[820,900],[390,844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
    await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const a = document.querySelector('.act--voices'), inner = document.querySelector('.tv2');
      return { act: Math.round(a.getBoundingClientRect().height),
               content: Math.round(inner.getBoundingClientRect().height),
               doc: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(2),
               vh: window.innerHeight };
    });
    console.log(`  ${(w+'x'+h).padEnd(10)} section ${String(r.act).padStart(4)}px (${(r.act/r.vh*100).toFixed(0)}% of screen)  content ${String(r.content).padStart(4)}px  page ${r.doc}vh`);
    await p.close();
  }
}
await b.close();
