/* Reproduce the reported hero jump. Two variables TJ's session had that the
   audit walk does not: the page was loaded at #programmes, and the scrolling
   was a real wheel rather than window.scrollTo.
     node lab/repro.mjs <outdir> <mode>     mode = hash | wheel | hashwheel | plain */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = "G:/My Drive/Rannie and Tj's Projects/The Post Partum Suit/postpartum-prototype";
const OUT = process.argv[2], MODE = process.argv[3] || 'plain';
const W = +(process.argv[4] || 1920), H = +(process.argv[5] || 950);
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
const url = pathToFileURL(path.join(ROOT, 'v1.html')).href + (MODE.includes('hash') ? '#programmes' : '');
await p.goto(url, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.waitForTimeout(1200);

const probe = async tag => {
  const r = await p.evaluate(() => {
    const q = s => { const e = document.querySelector(s); if (!e) return null;
      const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      return { t: Math.round(b.top), h: Math.round(b.height), pos: cs.position, tr: cs.transform.slice(0, 30) }; };
    return { y: Math.round(window.scrollY), vh: window.innerHeight,
      stage: q('.act--hero .stage'), spacer: q('.pin-spacer'),
      bath: q('.act--bath'), bathBox: q('.bath'), img: q('.bath__img'), voices: q('.act--voices') };
  });
  console.log(tag.padEnd(16), 'scrollY', String(r.y).padStart(6),
    '| hero stage top', String(r.stage && r.stage.t).padStart(6), r.stage && r.stage.pos,
    '| bath top', String(r.bath && r.bath.t).padStart(6),
    '| .bath top', String(r.bathBox && r.bathBox.t).padStart(6),
    '| img top', String(r.img && r.img.t).padStart(6));
  return r;
};

if (MODE.includes('hash')) { await probe('at #programmes'); }

// Back to the top the way a person would, then down again.
if (MODE.includes('wheel')) {
  await p.mouse.move(W / 2, H / 2);
  for (let i = 0; i < 60; i++) { await p.mouse.wheel(0, -800); await p.waitForTimeout(40); }
  await p.waitForTimeout(1200);
  await probe('wheeled to top');
  for (let i = 0; i < 26; i++) {
    await p.mouse.wheel(0, 100);
    await p.waitForTimeout(120);
    if (i % 2 === 0) {
      await p.screenshot({ path: path.join(OUT, String(i).padStart(2, '0') + '.png') });
    }
  }
  await probe('wheeled down');
} else {
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1000);
  await probe('scrollTo top');
  for (let i = 0; i <= 12; i++) {
    await p.evaluate(v => window.scrollTo(0, window.innerHeight * v), i * 0.22);
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(OUT, String(i).padStart(2, '0') + '.png') });
  }
  await probe('scrolled down');
}
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await b.close();
