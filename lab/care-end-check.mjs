// Four Kinds of Care after the closing note came out: desktop line reaches the Home dot by the
// end of the rail; phone vertical line fills all four. Screenshots the desktop rail's end and the
// phone hand on into the next section.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
// desktop
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.mouse.move(720, 450);
  let last = null, shot = false;
  for (let i = 0; i < 2600; i++) {
    await p.mouse.wheel(0, 120); await p.waitForTimeout(20);
    const s = await p.evaluate(() => {
      const st = [...document.querySelectorAll('.care-line__stop')];
      const prog = document.querySelector('#programmes').getBoundingClientRect().top;
      return { past: st.map(e => e.classList.contains('is-past') ? 1 : 0).join(''), cur: (document.querySelector('.care-line__stop.is-current button') || {}).textContent || '', progTop: Math.round(prog) };
    });
    if (s.past.length && s.past !== (last && last.past)) console.log('desktop', JSON.stringify(s));
    last = s;
    if (!shot && s.progTop < 900 && s.progTop > 300) { shot = true; await p.waitForTimeout(800); await p.screenshot({ path: path.join(OUT, 'care-end-1440.png') }); }
    if (s.progTop < 0) break;
  }
  console.log('desktop errors', errors.length ? errors : 'none');
  await p.close();
}
await b.close();
