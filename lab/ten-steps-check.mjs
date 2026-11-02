// Ten accent steps (TJ, 2 Nov 2026; Opus): the panel lists ten, only the accent
// moves within a family, step 3 matches today, Cognac keeps its photographs.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const SHOTS = path.join(process.cwd(), 'lab', 'ten-steps-shots');
fs.mkdirSync(SHOTS, { recursive: true });
const url = q => pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href + q;
const b = await chromium.launch({ channel: 'chrome' });
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));

const NAMES = ['Coral 1 (darkest)', 'Coral 2', 'Coral 3 (today)', 'Coral 4', 'Coral 5 (lightest)',
  'Cognac 1 (darkest)', 'Cognac 2', 'Cognac 3 (today)', 'Cognac 4', 'Cognac 5 (lightest)'];
await p.goto(url('?panel=show')); await p.waitForTimeout(1200);
const rows = await p.evaluate(() => { const h = document.getElementById('tps-palette-panel'); return h && h.shadowRoot ? [...h.shadowRoot.querySelectorAll('.row')].map(r => r.querySelector('.nm').textContent.trim()) : null; });
ok(JSON.stringify(rows) === JSON.stringify(NAMES), 'panel lists the ten in order ' + JSON.stringify(rows));
await p.evaluate(() => document.getElementById('tps-palette-panel').shadowRoot.querySelector('.pill').click());
await p.waitForTimeout(300);
await p.screenshot({ path: path.join(SHOTS, 'panel-open.png') });

const TOK = ['--acc', '--acc-deep', '--g-canvas', '--g-soft', '--g-tint', '--t-mute', '--g-dark'];
async function read(q) {
  await p.goto(url(q)); await p.waitForTimeout(1500);
  return p.evaluate(TOK => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
    const hex = c => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return '#' + [d[0], d[1], d[2]].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase(); };
    const cs = getComputedStyle(document.documentElement); const t = {};
    for (const k of TOK) t[k] = hex(cs.getPropertyValue(k).trim());
    const btn = document.querySelector('.btn--primary'), sc = document.querySelector('.script');
    const imgs = [...document.images].filter(i => i.src.includes('assets/img'));
    return { t, btn: btn ? hex(getComputedStyle(btn).backgroundColor) : null, script: sc ? hex(getComputedStyle(sc).color) : null,
      cognacImgs: imgs.filter(i => i.src.includes('/cognac/')).length, badDir: imgs.filter(i => /\/cognac-\d\//.test(i.src)).length,
      broken: imgs.filter(i => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy').map(i => i.src.split('/').slice(-2).join('/')),
      attr: document.documentElement.getAttribute('data-palette') };
  }, TOK);
}
// oklch lightness of a hex, for the strictly increasing check
const lin = c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
const okL = h => { const [r, g, bb] = [1, 3, 5].map(i => lin(parseInt(h.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * bb), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * bb), s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * bb);
  return .2104542553 * l + .7936177850 * m - .0040720468 * s; };

const NON = ['--g-canvas', '--g-soft', '--g-tint', '--t-mute', '--g-dark'];
const base = { coral: await read('?panel=show'), cognac: await read('?panel=show&palette=cognac') };
for (const fam of ['coral', 'cognac']) {
  const res = [];
  for (let n = 1; n <= 5; n++) {
    const id = fam + '-' + n, r = await read('?panel=show&palette=' + id); res.push(r);
    console.log('     ' + id + ' ' + JSON.stringify({ acc: r.t['--acc'], deep: r.t['--acc-deep'], btn: r.btn, script: r.script }));
    ok(r.attr === id, id + ' attribute kept');
    ok(NON.every(k => r.t[k] === base[fam].t[k]), id + ' grounds, mute and dark equal the base ' + JSON.stringify(NON.map(k => r.t[k])));
    ok(r.btn === r.t['--acc'], id + ' button background equals --acc ' + r.btn);
    if (fam === 'cognac') ok(r.cognacImgs > 0 && !r.broken.length && !r.badDir, id + ' regraded photographs, none broken ' + JSON.stringify({ n: r.cognacImgs, broken: r.broken, badDir: r.badDir }));
    else ok(r.cognacImgs === 0 && !r.broken.length, id + ' original photographs, none broken');
    await p.screenshot({ path: path.join(SHOTS, id + '.png') });
  }
  const s3 = res[2], b0 = base[fam];
  ok(JSON.stringify(s3.t) === JSON.stringify(b0.t) && s3.btn === b0.btn && s3.script === b0.script, fam + '-3 identical to ' + (fam === 'coral' ? 'the default' : 'cognac') + ' ' + JSON.stringify(s3.t));
  const Ls = res.map(r => okL(r.t['--acc']));
  ok(Ls.every((L, i) => i === 0 || L > Ls[i - 1]), fam + ' accent lightness rises 1 to 5 ' + Ls.map(L => L.toFixed(3)).join(' '));
}
ok(!errs.length, 'no page errors ' + errs.join(' '));
await b.close();
console.log(fails ? fails + ' FAILED' : 'all ok');
