// Finds number words in visible text (Opus, 1 Nov 2026): HTML with comments,
// scripts and styles blanked (line numbers kept), then text between tags;
// plus quoted strings in index/js. node lab/number-words-scan.mjs
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.join(process.cwd(), 'index');
const WORDS = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|twenty|thirty|forty|fifty|sixty|ninety|hundred';
const RX = new RegExp(`\\b(${WORDS})\\b`, 'i');
const blank = s => s.replace(/[^\n]/g, ' ');
for (const f of readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  let src = readFileSync(path.join(ROOT, f), 'utf8');
  src = src.replace(/<!--[\s\S]*?-->/g, blank)
           .replace(/<script\b[\s\S]*?<\/script>/gi, blank)
           .replace(/<style\b[\s\S]*?<\/style>/gi, blank);
  const lines = src.split('\n');
  lines.forEach((ln, i) => {
    // text between tags only
    const text = ln.replace(/<[^>]*>/g, ' | ');
    if (RX.test(text)) console.log(`${f}:${i + 1}  ${text.replace(/\s+/g, ' ').trim().slice(0, 170)}`);
    // visible attribute text: alt, placeholder, value on buttons
    const m = ln.match(/\b(alt|placeholder|title)="([^"]*)"/g) || [];
    m.forEach(a => { if (RX.test(a)) console.log(`${f}:${i + 1}  [attr] ${a.slice(0, 160)}`); });
  });
}
const JS = path.join(ROOT, 'js');
for (const f of readdirSync(JS).filter(f => f.endsWith('.js'))) {
  const src = readFileSync(path.join(JS, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[^:])\/\/.*$/gm, (m, a) => a + blank(m.slice(a.length)));
  src.split('\n').forEach((ln, i) => {
    const strs = ln.match(/(['"`])(?:\\.|(?!\1).)*\1/g) || [];
    strs.forEach(s => { if (RX.test(s)) console.log(`js/${f}:${i + 1}  ${s.slice(0, 170)}`); });
  });
}
