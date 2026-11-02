// Dropdown height fix (TJ, 1 Nov 2026; Opus). Switching straight from a long
// panel to a short one kept the long height: scrollHeight was read while the
// menu still held the old inline height, and scrollHeight never reports less
// than the box. Now the old height is noted, the menu is set to auto, the new
// list is measured on its own, and the switch animates old to new.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const FILES = [
  ['index/js/inner-nav.js', 'var', '      '],
  ['index/js/build-your-programme.js', 'var', '      '],
  ['index/js/home.js', 'const', '    '],
];
let bad = 0;
for (const [rel, kw, ind] of FILES) {
  const f = path.join(process.cwd(), rel);
  const raw = readFileSync(f, 'utf8'); const crlf = raw.includes('\r\n');
  let s = raw.replace(/\r\n/g, '\n');
  const m1 = `${ind}${kw} h = menu.scrollHeight;`;
  const r1 = `${ind}// Measure this list on its own: drop the last panel's height first, or a\n${ind}// short list inherits a long one's (TJ, 1 Nov 2026).\n${ind}${kw} prevH = menu.offsetHeight;\n${ind}menu.style.height = 'auto';\n${ind}${kw} h = menu.scrollHeight;`;
  const m2 = `${ind}  gsap.to(menu, { height: h, duration: 0.26, ease: EASE });`;
  const r2 = `${ind}  gsap.fromTo(menu, { height: prevH }, { height: h, duration: 0.26, ease: EASE });`;
  const c1 = s.split(m1).length - 1, c2 = s.split(m2).length - 1;
  if (c1 !== 1 || c2 !== 1) { console.log('SKIP', rel, c1, c2); bad++; continue; }
  s = s.replace(m1, r1).replace(m2, r2);
  writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
  console.log('ok', rel);
}
process.exit(bad ? 1 : 0);
