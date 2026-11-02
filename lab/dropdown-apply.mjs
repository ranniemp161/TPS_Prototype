// Desktop dropdown under its own tab (TJ, 1 Nov 2026; Opus): adds placeMenu()
// to the three scripts that open the header menu. Each anchor must match once.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const HELPER = (indent) => `
${indent}// Desktop: the panel hangs under the tab that opened it, its text level with
${indent}// the tab's word (TJ, 1 Nov 2026). Sets --menu-x, which site.css reads only
${indent}// above 1100px, so phones keep their full width panel. It follows the tab
${indent}// while open, since the header fold slides the tabs on scroll.
${indent}function placeMenu(tab) {
${indent}  var host = menu.offsetParent || root;
${indent}  function set() {
${indent}    var pad = parseFloat(getComputedStyle(tab).paddingLeft) || 0;
${indent}    var x = tab.getBoundingClientRect().left + pad - host.getBoundingClientRect().left;
${indent}    menu.style.setProperty('--menu-x', x.toFixed(1) + 'px');
${indent}  }
${indent}  set();
${indent}  cancelAnimationFrame(menu._follow);
${indent}  (function follow() {
${indent}    if (menu.hidden || tab.getAttribute('aria-expanded') !== 'true') return;
${indent}    set();
${indent}    menu._follow = requestAnimationFrame(follow);
${indent}  })();
${indent}}
`;
const FILES = [
  ['index/js/inner-nav.js', '    var open = null;\n', '    ', '      menu.hidden = false;\n      veil.hidden = false;\n      var h = menu.scrollHeight;', '      menu.hidden = false;\n      placeMenu(tab);\n      veil.hidden = false;\n      var h = menu.scrollHeight;'],
  ['index/js/build-your-programme.js', '    var open = null;\n', '    ', '      menu.hidden = false;\n      veil.hidden = false;\n      var h = menu.scrollHeight;', '      menu.hidden = false;\n      placeMenu(tab);\n      veil.hidden = false;\n      var h = menu.scrollHeight;'],
  ['index/js/home.js', '  let open = null;\n', '  ', '    menu.hidden = false;\n    veil.hidden = false;\n    const h = menu.scrollHeight;', '    menu.hidden = false;\n    placeMenu(tab);\n    veil.hidden = false;\n    const h = menu.scrollHeight;'],
];
let bad = 0;
for (const [rel, anchor, indent, callFrom, callTo] of FILES) {
  const f = path.join(process.cwd(), rel);
  let s = readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  const crlf = readFileSync(f, 'utf8').includes('\r\n');
  const a = s.split(anchor).length - 1, c = s.split(callFrom).length - 1;
  if (a < 1 || c !== 1 || s.includes('function placeMenu')) { console.log('SKIP', rel, 'anchor', a, 'call', c); bad++; continue; }
  s = s.replace(anchor, anchor + HELPER(indent)).replace(callFrom, callTo);
  writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
  console.log('ok', rel);
}
process.exit(bad ? 1 : 0);
