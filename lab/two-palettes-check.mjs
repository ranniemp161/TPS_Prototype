// Coral and Cognac only (TJ, 2 Nov 2026; Opus): the panel lists two, Cognac
// still swaps colour and photographs, a stale saved palette is cleared.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT] = process.argv.slice(2);
const url = q => pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href + q;
const b = await chromium.launch({ channel: 'chrome' });
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(url('?panel=show&palette=coral')); await p.waitForTimeout(1200);
const rows = await p.evaluate(() => { const h = document.getElementById('tps-palette-panel'); return h && h.shadowRoot ? [...h.shadowRoot.querySelectorAll('.row')].map(r => r.textContent.trim()) : null; });
ok(rows && rows.length === 2, 'panel lists ' + JSON.stringify(rows));
await p.goto(url('?panel=show&palette=cognac')); await p.waitForTimeout(1500);
const cg = await p.evaluate(() => ({ acc: getComputedStyle(document.documentElement).getPropertyValue('--acc').trim(), img: [...document.images].filter(i => /\/cognac\//.test(i.src)).length, broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src.includes('assets/img')).map(i => i.src.split('/').slice(-2).join('/')) }));
ok(cg.acc.toUpperCase() === '#AC7137' && cg.img > 0, 'cognac accent and regraded photos ' + JSON.stringify(cg));
await p.screenshot({ path: path.join(OUT, 'cognac-1440.png') });
await p.goto(url('?panel=show')); await p.evaluate(() => localStorage.setItem('tps-palette', 'plum'));
await p.goto(url('?panel=show')); await p.waitForTimeout(1000);
const st = await p.evaluate(() => ({ attr: document.documentElement.getAttribute('data-palette'), saved: localStorage.getItem('tps-palette'), acc: getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() }));
ok(st.attr === null && st.saved === null, 'stale plum cleared, back to coral ' + JSON.stringify(st));
await p.goto(url('?palette=navy')); await p.waitForTimeout(500);
ok(await p.evaluate(() => document.documentElement.getAttribute('data-palette') === null), 'a removed palette in the URL is ignored');
ok(!errs.length, 'no page errors ' + errs.join(' '));
await b.close();
console.log(fails ? fails + ' FAILED' : 'all ok');
