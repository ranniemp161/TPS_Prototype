// Palette contrast check for the TPS site.
// For each palette x reach mode, resolves the role tokens in index/css/site.css
// to exact sRGB by painting them, then checks key pairs against WCAG 4.5:1.
// Writes lab/shots/palette/contrast.json and exits 1 if any palette fails.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const pageFile = path.join(root, 'index', 'programmes.html');
const palettesFile = path.join(here, 'palettes.js');
const outDir = path.join(here, 'shots', 'palette');
const outFile = path.join(outDir, 'contrast.json');
const REACHES = ['full', 'button'];
const FALLBACK_PALETTES = ['coral', 'cognac'];
const THRESHOLD = 4.5;

// [foreground token, background token]
const PAIRS = [
  ['--t-on-accent', '--acc'],
  ['--acc', '--g-canvas'],
  ['--reach-script', '--g-soft'],
  // Large Quentin script lines (2rem and up): WCAG large text bar, 3:1 (Opus, 26 Oct 2026)
  ['--reach-script-soft', '--g-canvas', 3],
  ['--t-mute', '--g-soft'],
  ['--t-on-dark', '--g-dark'],
  ['--reach-link', '--g-canvas'],
  ['--err', '--g-paper'],
  ['--t-mute', '--g-canvas'],
];

const INFO_TOKENS = ['--acc', '--acc-deep', '--g-canvas', '--g-soft', '--g-tint', '--g-dark'];

const ALL_TOKENS = [...new Set([...PAIRS.flatMap(p => p.slice(0, 2)), ...INFO_TOKENS])];

// Runs inside the page. Paints each token into a 1x1 div, reads the computed
// background, then draws that colour onto a 1x1 canvas to get exact sRGB.
function resolveTokens(names) {
  const cs = getComputedStyle(document.documentElement);
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const out = {};
  for (const name of names) {
    const raw = cs.getPropertyValue(name).trim();
    if (!raw) {
      out[name] = { missing: true };
      continue;
    }
    const div = document.createElement('div');
    div.style.width = '1px';
    div.style.height = '1px';
    div.style.background = `var(${name})`;
    document.body.appendChild(div);
    const computed = getComputedStyle(div).backgroundColor;
    div.remove();
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000000';
    ctx.fillStyle = computed;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    out[name] = { raw, computed, rgb: [d[0], d[1], d[2]], alpha: d[3] };
  }
  return out;
}

function luminance([r, g, b]) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

function toHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function loadPalettes(page) {
  if (!fs.existsSync(palettesFile)) {
    return { ids: FALLBACK_PALETTES, source: 'fallback' };
  }
  const src = fs.readFileSync(palettesFile, 'utf8');
  await page.addScriptTag({ content: src });
  const list = await page.evaluate(() => window.TPS_PALETTES || null);
  if (!Array.isArray(list) || list.length === 0) {
    return { ids: FALLBACK_PALETTES, source: 'fallback (palettes.js had no TPS_PALETTES)' };
  }
  return { ids: list.map((p) => p.id), source: 'lab/palettes.js', flagged: list.filter((p) => p.failed).map((p) => p.id) };
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const failedPalettes = new Set();
  const results = [];
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const { ids: palettes, source: paletteSource, flagged = [] } = await loadPalettes(page);

    for (const palette of palettes) {
      for (const reach of REACHES) {
        await page.evaluate(
          ({ p, r }) => {
            const html = document.documentElement;
            html.setAttribute('data-palette', p);
            html.setAttribute('data-reach', r);
            if (!document.getElementById('contrast-no-transition')) {
              const s = document.createElement('style');
              s.id = 'contrast-no-transition';
              s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
              document.head.appendChild(s);
            }
          },
          { p: palette, r: reach }
        );

        const tokens = await page.evaluate(resolveTokens, ALL_TOKENS);

        const pairResults = PAIRS.map(([fg, bg], i) => {
          const f = tokens[fg];
          const b = tokens[bg];
          if (!f || !b || f.missing || b.missing) {
            const missing = [!f || f.missing ? fg : null, !b || b.missing ? bg : null].filter(Boolean);
            return { n: i + 1, fg, bg, ratio: null, pass: false, note: `missing token: ${missing.join(', ')}` };
          }
          const notes = [];
          if (f.alpha !== 255) notes.push(`${fg} translucent`);
          if (b.alpha !== 255) notes.push(`${bg} translucent`);
          const ratio = contrast(f.rgb, b.rgb);
          return {
            n: i + 1,
            fg,
            bg,
            fgHex: toHex(f.rgb),
            bgHex: toHex(b.rgb),
            ratio: Math.round(ratio * 100) / 100,
            pass: ratio >= (PAIRS[i][2] || THRESHOLD),
            ...(notes.length ? { note: notes.join('; ') } : {}),
          };
        });

        const info = {};
        for (const t of INFO_TOKENS) {
          const tk = tokens[t];
          info[t] = tk && !tk.missing ? toHex(tk.rgb) : 'missing';
        }

        const pass = pairResults.every((p) => p.pass);
        if (!pass) failedPalettes.add(palette);
        results.push({ palette, reach, pass, pairs: pairResults, info });

        console.log(`\n== palette: ${palette}   reach: ${reach} ==`);
        console.log(
          ' #  ' + 'foreground'.padEnd(22) + 'background'.padEnd(16) + 'ratio'.padEnd(9) + 'result'
        );
        for (const p of pairResults) {
          const ratioText = p.ratio === null ? '-' : p.ratio.toFixed(2);
          const result = p.pass ? 'PASS' : 'FAIL';
          const extra = p.note ? `   (${p.note})` : '';
          console.log(
            String(p.n).padEnd(4) + p.fg.padEnd(22) + p.bg.padEnd(16) + ratioText.padEnd(9) + result + extra
          );
        }
        console.log(
          'info: ' + INFO_TOKENS.map((t) => `${t} ${info[t]}`).join('  ')
        );
      }
    }

    const failedList = [...failedPalettes];
    console.log(`\nPalette source: ${paletteSource}${flagged.length ? ` (flagged: ${flagged.join(', ')})` : ''}`);
    console.log(
      `Failed palettes: ${failedList.length ? failedList.join(', ') : 'none'}`
    );

    const json = {
      generatedAt: new Date().toISOString(),
      page: 'index/programmes.html',
      threshold: THRESHOLD,
      paletteSource,
      palettes,
      reaches: REACHES,
      failedPalettes: failedList,
      results,
    };
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log(`JSON written: ${outFile}`);

    return failedList.length === 0 ? 0 : 1;
  } finally {
    await browser.close();
  }
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (err) => {
    console.error(err);
    process.exitCode = 1;
  }
);
