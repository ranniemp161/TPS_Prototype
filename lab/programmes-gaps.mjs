// Measures the three desktop gaps on Programmes (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'programmes.html')).href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => {
  const abs = e => { const r = e.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; };
  const h = t => [...document.querySelectorAll('h1,h2,h3')].find(e => e.textContent.trim().toLowerCase().startsWith(t));
  const kinds = h('four kinds'), incl = h('what each'), ready = h('ready to talk');
  const chain = e => { const out = []; for (let n = e; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); out.push(`${n.tagName.toLowerCase()}.${[...n.classList].join('.')} m=${s.marginTop}/${s.marginBottom} p=${s.paddingTop}/${s.paddingBottom}`); } return out; };
  const card = document.querySelector('[data-pg-card]');
  const kindLast = [...document.querySelectorAll('.pg-kind__list')].pop();
  const inclSec = incl.closest('section'); const inclCard = [...inclSec.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width > 800).pop();
  return JSON.stringify({
    gap1: Math.round(abs(kinds).top - abs(card).bottom), gap2: Math.round(abs(incl).top - abs(kindLast).bottom), gap3: Math.round(abs(ready).top - abs(inclSec).bottom),
    readyChain: chain(ready).slice(0, 5), kindsChain: chain(kinds).slice(0, 5), inclChain: chain(incl).slice(0, 4), cardChain: chain(card).slice(0, 6), kindLastChain: chain(kindLast).slice(0, 6),
    inclSecBottomPad: getComputedStyle(inclSec).paddingBottom,
  }, null, 1);
}));
await b.close();
