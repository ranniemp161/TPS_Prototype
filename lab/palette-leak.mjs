/* PALETTE LEAK CHECK (TJ, 26 Oct 2026, PALETTE-PLAN.md section 9)
   Finds hard coded colours outside the palette blocks, so a palette change reaches everything.

     node lab/palette-leak.mjs        exit 0 when clean, exit 1 and a file:line list when not

   Scans index/css/*.css, index/*.html (style attributes and style blocks only, never meta tags)
   and index/js/*.js (except build-your-programme-pricing.js). Comments are ignored.
   In site.css, everything from the :root block to the end of the reach block is skipped: that is
   the PALETTE LAYER, the PALETTE DERIVATION block, THE PALETTES block and the reach block.

   Allowed everywhere: transparent, black and white, rgba(0,0,0,x), rgba(255,255,255,x),
   rgba(10,10,10,x), rgb(10,10,10). Known intentional values are in the ALLOWED list below,
   as [file, pattern] pairs, so the check stays exact. */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IDX = path.join(ROOT, 'index');

/* Known intentional values. file is the base name; pattern is tested against the matched text. */
const ALLOWED = [
  ['what-we-do-day-night.css', /^#7C4A35$/i],
  ['what-we-do-day-night.css', /^rgb\(var\(--dnt-c\)\)$/],
  ['what-we-do-day-night.css', /^rgb\(var\(--dn-ink\)\)$/],
  ['what-we-do-day-night.css', /^rgba\(38,\s*30,\s*28,/],
  ['site.css', /^rgb\(238,\s*236,\s*233\)$/],
  ['site.css', /^#737373$/i],
  /* The --nd ramps in what-we-do.css, lines 234 to 244: the glass nav blends cream to taupe and ink to white with --nd. */
  ['what-we-do.css', /^rgba?\(\s*calc\(/],
  /* JS rgb arithmetic, exact lines as found on 26 Oct 2026 */
  ['home.js', /^rgb\(\$\{c\[0\]\}, \$\{c\[1\]\}, \$\{c\[2\]\}\)$/],  /* home.js 555 */
  ['what-we-do-promise.js', /^rgb\(' \+ c\.map\(\(v, i\) => Math\.round\(v \* \(1 - a\) \+ sink\[i\] \* a\)\)/],  /* what-we-do-promise.js 115 */
  ['what-we-do-promise.js', /^rgb\(\$\{c\[0\]\}, \$\{c\[1\]\}, \$\{c\[2\]\}\)$/],  /* what-we-do-promise.js 156 */
  ['what-we-do-tailored.js', /^rgb\(' \+ \(getComputedStyle\(dnWrap\)/],  /* what-we-do-tailored.js 290 */
];

const NEUTRAL = [
  /^#(000|000000|fff|ffffff)$/i,
  /^rgba?\(\s*0[\s,]+0[\s,]+0\b/,
  /^rgba?\(\s*255[\s,]+255[\s,]+255\b/,
  /^rgba?\(\s*10[\s,]+10[\s,]+10\b/,
];

/* Blank out comments but keep line numbers. */
function stripComments(src, kind) {
  const blank = m => m.replace(/[^\n]/g, ' ');
  let s = src;
  if (kind === 'css' || kind === 'js') s = s.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (kind === 'html') s = s.replace(/<!--[\s\S]*?-->/g, blank);
  if (kind === 'js') s = s.replace(/(^|[^:\'"`])\/\/[^\n]*/g, (m, a) => a + blank(m.slice(a.length)));
  return s;
}

/* Matched text including balanced parentheses for colour functions. */
const RE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lch|lab)\(/g;
function matches(line, ahead = '') {
  const out = [];
  let m; RE.lastIndex = 0;
  while ((m = RE.exec(line))) {
    if (m[0][0] === '#') {
      if (![4, 5, 7, 9].includes(m[0].length)) continue;
      out.push(m[0]);
    } else {
      let L = line, i = RE.lastIndex, d = 1;
      const bal = t => { let j = i, k = 1; while (j < t.length && k) { if (t[j] === '(') k++; else if (t[j] === ')') k--; j++; } return k === 0; };
      if (!bal(L)) L = line + ' ' + ahead.replace(/\s+/g, ' ');
      while (i < L.length && d) { if (L[i] === '(') d++; else if (L[i] === ')') d--; i++; }
      out.push(L.slice(m.index, i));
    }
  }
  return out;
}

function htmlRegions(src) {
  /* Keep only style blocks and style="" attributes, blank everything else, keep line numbers. */
  const keep = new Array(src.length).fill(false);
  const mark = re => { let m; while ((m = re.exec(src))) for (let i = m.index; i < m.index + m[0].length; i++) keep[i] = true; };
  mark(/<style[\s\S]*?<\/style>/gi);
  mark(/\sstyle\s*=\s*"[^"]*"/gi);
  mark(/\sstyle\s*=\s*'[^']*'/gi);
  return [...src].map((c, i) => (keep[i] || c === '\n') ? c : ' ').join('');
}

function skipRange(lines) {
  const a = lines.findIndex(l => /^:root\s*\{/.test(l));
  const r = lines.findIndex(l => l.includes('html[data-reach="button"][data-reach]'));
  if (a < 0 || r < 0) throw new Error('site.css palette blocks not found');
  let e = r; while (!/^\}/.test(lines[e])) e++;
  return [a, e];
}

const files = [];
for (const f of readdirSync(path.join(IDX, 'css')).filter(f => f.endsWith('.css'))) files.push(['css', path.join(IDX, 'css', f)]);
for (const f of readdirSync(IDX).filter(f => f.endsWith('.html'))) files.push(['html', path.join(IDX, f)]);
for (const f of readdirSync(path.join(IDX, 'js')).filter(f => f.endsWith('.js') && f !== 'build-your-programme-pricing.js')) files.push(['js', path.join(IDX, 'js', f)]);

const hits = [], allowedSeen = [];
for (const [kind, file] of files) {
  const base = path.basename(file);
  let src = readFileSync(file, 'utf8');
  src = stripComments(src, kind);
  if (kind === 'html') src = htmlRegions(src);
  const lines = src.split('\n');
  const skip = base === 'site.css' ? skipRange(lines) : null;
  lines.forEach((line, i) => {
    if (skip && i >= skip[0] && i <= skip[1]) return;
    for (const t of matches(line, lines.slice(i + 1, i + 6).join(' '))) {
      if (NEUTRAL.some(r => r.test(t))) continue;
      const al = ALLOWED.find(([f, r]) => f === base && r.test(t));
      if (al) { allowedSeen.push(`${base}:${i + 1}  ${t}`); continue; }
      hits.push(`${path.relative(ROOT, file).split(path.sep).join('/')}:${i + 1}  ${t}`);
    }
  });
}
if (process.argv.includes('--allowed')) allowedSeen.forEach(l => console.log('allowed  ' + l));
if (hits.length) { hits.forEach(h => console.log(h)); console.log(`\n${hits.length} leak(s)`); process.exit(1); }
console.log('palette leak check: clean');
