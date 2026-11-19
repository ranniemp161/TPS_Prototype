/* New changes panel. Development only, loaded on any page when the URL carries
   ?dev (through devpanel-loader.js), so it can never reach a visitor.

   A corner dot opens a short panel: a Highlight switch and a numbered list of
   the places the new wording went in, with Back and Next. Choosing one scrolls
   to it, changing page first if needed. The old sections list is kept as
   devpanel.before-changes-list.js.bak.

   It lives in a shadow root so no style crosses in either direction, and it
   never enters layout: fixed, appended after load, no ScrollTrigger, and it
   never calls ScrollTrigger.refresh(). The highlight is the one thing that
   touches the page: a class on <html> plus a <style> in the main head. */

(() => {
  if (!/(^|[?&])dev($|[=&])/.test(location.search)) return;

  const HL = 'tps-dev-hl';
  const KEY = 'tps-dev-highlight';
  const FILE = decodeURIComponent(location.pathname.split('/').pop() || '') || 'index.html';

  const SPOTS = [
    ['Home hero, strong line', 'index.html', 'dev-hero'],
    ['Home hero, trust tags', 'index.html', 'dev-trust'],
    ['Home, booking card', 'index.html', 'dev-england'],
    ['What We Do, opening', 'what-we-do.html', 'dev-wwd'],
    ['Who Comes, experience', 'who-comes-into-your-home.html', 'dev-who-1'],
    ['Who Comes, non-medical', 'who-comes-into-your-home.html', 'dev-who-2'],
    ['About, our story', 'about.html', 'dev-about'],
    ['FAQs, who are your specialists', 'faqs.html', 'dev-faq-1'],
    ['FAQs, is your care medical', 'faqs.html', 'dev-faq-2'],
    ['Treatments, opening', 'single-treatments.html', 'dev-treat'],
    ['Footer, where we work', null, 'dev-footer'],
  ].map(([label, page, id]) => ({ label, page: page || FILE, id }));

  const here = s => s.page === FILE;
  const byHash = () => {
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch {}
    return SPOTS.find(s => s.id === id && here(s)) || null;
  };

  /* Highlight: class on <html> and ID selectors in the main document head. */
  const sel = SPOTS.map(s => '#' + s.id);
  const targets = sel.map(x => `html.${HL} ${x}, html.${HL} ${x} *`).join(',\n');
  const style = document.createElement('style');
  style.id = 'tps-dev-highlight-style';
  style.textContent =
    targets + ' { color: #00e676 !important; }\n' +
    targets + ' { outline: 2px dashed #00e676 !important; outline-offset: 4px !important; }\n';
  document.head.append(style);

  let hlOn = true;
  try { if (sessionStorage.getItem(KEY) === 'off') hlOn = false; } catch {}
  const applyHl = () => document.documentElement.classList.toggle(HL, hlOn);
  applyHl();

  /* Scroll to a spot on this page. Repeated because pages may still be laying out. */
  const reveal = el => {
    for (let p = el; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
    /* display: contents (the footer list item on wide screens) has no box to scroll to. */
    let t = el;
    if (getComputedStyle(el).display === 'contents') t = el.firstElementChild || el.parentElement;
    /* The hero spots only show at the very top of the page (the hero fades as you scroll).
       Everything else lands low on the screen, clear of the open panel at the top left. */
    if (el.id === 'dev-hero' || el.id === 'dev-trust') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    /* Park the spot's lower edge at 88% of the screen height. An absolute target,
       so repeating the call settles in the same place instead of drifting. */
    const r = t.getBoundingClientRect();
    const y = window.scrollY + r.bottom - innerHeight * .88;
    if (Math.abs(y - window.scrollY) > 4) window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };
  /* While the panel is open, keep it off the spot being shown: if it sits on top of the spot,
     drop it to the bottom of the screen; otherwise it stays under the header. Checked on a
     timer because some pages keep moving for a few seconds after they load. */
  const dodge = () => {
    const w = host.shadowRoot && host.shadowRoot.querySelector('.wrap'); let el = dodge.id && document.getElementById(dodge.id);
    if (!w || !el || w.dataset.open !== 'true') return;
    if (getComputedStyle(el).display === 'contents') el = el.firstElementChild || el;
    const a = el.getBoundingClientRect(), low = w.hasAttribute('data-low');
    const pr = w.querySelector('.panel').getBoundingClientRect(), top = 108, h = pr.height, wd = pr.width;
    const hitsTop = !(a.right <= 16 || a.left >= 16 + wd || a.bottom <= top || a.top >= top + h);
    if (hitsTop !== low) w.toggleAttribute('data-low', hitsTop);
  };
  setInterval(dodge, 600);
  const scrollTo = id => {
    const run = () => { const el = document.getElementById(id); if (el) reveal(el); };
    [50, 800, 1600].forEach(t => setTimeout(run, t));
    dodge.id = id;
  };

  const host = document.createElement('div');
  host.id = 'tps-devpanel';
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
<style>
  :host { all: initial; }
  .wrap {
    position: fixed; left: 16px; bottom: 16px; z-index: 2147483647;
    font: 400 12px/1.4 ui-monospace, "IBM Plex Mono", Menlo, monospace;
    color: #EDE8E4;
  }
  .dot {
    width: 14px; height: 14px; border-radius: 50%;
    background: #8C7F79; border: 2px solid rgba(255,255,255,.55);
    cursor: pointer; display: block; padding: 0;
    transition: transform .18s ease, opacity .18s ease;
  }
  .dot:hover { transform: scale(1.25); }
  .panel {
    position: absolute; left: 0; bottom: 0; width: min(250px, calc(100vw - 32px));
    box-sizing: border-box;
    background: rgba(28,24,22,.93);
    backdrop-filter: blur(10px);
    border-radius: 10px; padding: 10px;
    transform-origin: left bottom;
    transition: opacity .18s ease, transform .18s ease;
  }
  .wrap[data-open="false"] .panel {
    opacity: 0; transform: scale(.9) translateY(6px); pointer-events: none;
  }
  /* Open, the panel moves up under the header so it never covers the spot being shown. */
  .wrap[data-open="true"] { bottom: auto; top: 108px; }
  /* Under the header the panel hangs down from its anchor; at the bottom it grows up, as before. */
  .wrap[data-open="true"]:not([data-low]) .panel { bottom: auto; top: 0; transform-origin: left top; }
  .wrap[data-open="true"][data-low] { top: auto; bottom: 16px; }
  .wrap[data-open="true"] .dot { opacity: 0; pointer-events: none; }
  .head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 2px 6px; letter-spacing: .08em; text-transform: uppercase;
    font-size: 10px; color: #C9BFB9;
  }
  .close {
    background: none; border: 0; color: #9A8F88; cursor: pointer;
    font: inherit; font-size: 15px; line-height: 1; padding: 0 2px;
  }
  .close:hover { color: #EDE8E4; }
  .sw {
    display: flex; align-items: center; gap: 8px; width: 100%;
    background: none; border: 0; cursor: pointer; padding: 4px 2px 8px;
    font: inherit; color: #EDE8E4; text-align: left;
  }
  .track {
    width: 28px; height: 16px; border-radius: 8px; background: #5b524d;
    position: relative; flex: none; transition: background .15s ease;
  }
  .track::after {
    content: ""; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px;
    border-radius: 50%; background: #fff; transition: transform .15s ease;
  }
  .sw[aria-checked="true"] .track { background: #00e676; }
  .sw[aria-checked="true"] .track::after { transform: translateX(12px); }
  ol { list-style: none; margin: 0; padding: 0; max-height: min(26vh, 220px); overflow-y: auto; }
  li button {
    width: 100%; display: flex; gap: 8px; align-items: baseline;
    background: none; border: 0; border-radius: 5px; cursor: pointer;
    padding: 4px 6px; font: inherit; color: #C9BFB9; text-align: left;
  }
  li button:hover { background: rgba(255,255,255,.07); color: #EDE8E4; }
  li[data-on="true"] button { background: rgba(0,230,118,.18); color: #FFF; box-shadow: inset 2px 0 0 #00e676; }
  .n { color: #7E736D; min-width: 16px; }
  li[data-on="true"] .n { color: #00e676; }
  .nav { display: flex; gap: 8px; padding-top: 8px; }
  .nav button {
    flex: 1; background: rgba(255,255,255,.1); border: 0; border-radius: 5px;
    color: #EDE8E4; cursor: pointer; font: inherit; padding: 5px 0;
  }
  .nav button:hover { background: rgba(255,255,255,.2); }
</style>
<div class="wrap" data-open="false">
  <button class="dot" title="New changes" aria-label="New changes"></button>
  <div class="panel">
    <div class="head"><span>New changes</span><button class="close" title="Close" aria-label="Close">&times;</button></div>
    <button class="sw" role="switch" aria-checked="true"><span class="track"></span><span>Highlight</span></button>
    <ol></ol>
    <div class="nav"><button class="back">Back</button><button class="next">Next</button></div>
  </div>
</div>`;

  const wrap = root.querySelector('.wrap');
  const list = root.querySelector('ol');
  const sw = root.querySelector('.sw');

  const mark = () => {
    const cur = byHash();
    [...list.children].forEach((li, i) => { li.dataset.on = String(SPOTS[i] === cur); });
    const on = list.querySelector('li[data-on="true"]');
    if (on) list.scrollTop = on.offsetTop - list.clientHeight / 2 + on.offsetHeight / 2;
  };

  const go = i => {
    const s = SPOTS[i];
    if (here(s)) {
      try { history.replaceState(null, '', '?dev#' + s.id); } catch {}
      mark();
      scrollTo(s.id);
    } else {
      location.href = s.page + '?dev#' + s.id;
    }
  };

  SPOTS.forEach((s, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    const n = document.createElement('span');
    const nm = document.createElement('span');
    n.className = 'n';
    n.textContent = i + 1;
    nm.textContent = s.label;
    b.append(n, nm);
    b.onclick = () => go(i);
    li.append(b);
    list.append(li);
  });

  const step = d => {
    const cur = byHash();
    const i = cur ? SPOTS.indexOf(cur) : (d > 0 ? -1 : 0);
    go((i + d + SPOTS.length) % SPOTS.length);
  };

  const open = state => { wrap.dataset.open = String(state); };
  const paintSwitch = () => sw.setAttribute('aria-checked', String(hlOn));

  root.querySelector('.dot').onclick = () => { mark(); open(true); };
  root.querySelector('.close').onclick = () => open(false);
  root.querySelector('.next').onclick = () => step(1);
  root.querySelector('.back').onclick = () => step(-1);
  sw.onclick = () => {
    hlOn = !hlOn;
    try { sessionStorage.setItem(KEY, hlOn ? 'on' : 'off'); } catch {}
    applyHl();
    paintSwitch();
  };
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && wrap.dataset.open === 'true') open(false);
  });

  const attach = () => {
    document.body.append(host);
    paintSwitch();
    const cur = byHash();
    mark();
    if (cur) { scrollTo(cur.id); open(true); }
  };
  if (document.readyState === 'complete') attach();
  else addEventListener('load', attach);
})();
