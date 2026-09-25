/* Section identifier panel. Development only, loaded on any V1 page when the URL
   carries ?dev, so it can never reach a visitor.

   Three constraints shaped this file:

   1. It reads the sections out of the page every time it opens. Nothing here
      knows how many sections exist or what they are called. Add one, rename
      one, reorder them, and the panel reports the new truth with no edit.
   2. It lives in a shadow root, so no style crosses in either direction.
   3. It never enters layout. It is appended after load, fixed, and registers
      no ScrollTrigger, because this page has previously had its hero pin
      measurement disturbed by a block that merely existed. It also never
      calls ScrollTrigger.refresh(), which at a non zero scroll position is a
      documented way to break the pins. */

(() => {
  if (!/(^|[?&])dev($|[=&])/.test(location.search)) return;

  const STORE = 'tps-devpanel-open';

  /* Identity comes from data-section. The fallback reads it off the act--x
     class so the panel still works on a section that has not been given one,
     and marks it so the gap is visible rather than silent. */
  const readSections = () =>
    [...document.querySelectorAll('section.act, [data-section]')].map((el, i) => {
      const key = el.dataset.section;
      const fromClass = [...el.classList]
        .find(c => c.startsWith('act--'))?.slice(5);
      return {
        el,
        n: i + 1,
        key: key || fromClass || 'unnamed',
        name: el.dataset.sectionName || key || fromClass || 'unnamed',
        loose: !key,
        timeline: el.dataset.devScrollT == null ? null : Number(el.dataset.devScrollT),
      };
    });

  /* Sections on this page overlap on purpose: the bath sits over the hero for
     nearly two viewport heights. So "where am I" cannot be the first section
     whose top has passed. It is whichever one is showing the most. */
  const current = list => {
    const h = innerHeight;
    const timeline = list.filter(s => s.timeline !== null);
    const flight = document.querySelector('[data-flight]');
    if (timeline.length && flight && window.__flight) {
      const r = flight.getBoundingClientRect();
      if (r.top <= h * 0.5 && r.bottom >= h * 0.5) {
        const t = window.__flight.state().t;
        let active = timeline[0];
        for (const s of timeline) if (s.timeline <= t + 0.001) active = s;
        return active;
      }
    }
    let best = null, most = 0;
    for (const s of list) {
      if (s.timeline !== null) continue;
      const r = s.el.getBoundingClientRect();
      const seen = Math.min(r.bottom, h) - Math.max(r.top, 0);
      if (seen > most) { most = seen; best = s; }
    }
    return best;
  };

  const copy = text => {
    navigator.clipboard?.writeText(text).catch(() => {
      // file:// is not always a secure context, so the clipboard API can
      // reject. This path is the one that usually runs here.
      const t = document.createElement('textarea');
      t.value = text;
      document.body.append(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    });
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
    position: absolute; left: 0; bottom: 0; width: 238px;
    background: rgba(28,24,22,.93);
    backdrop-filter: blur(10px);
    border-radius: 10px; padding: 10px;
    transform-origin: left bottom;
    transition: opacity .18s ease, transform .18s ease;
  }
  .wrap[data-open="false"] .panel {
    opacity: 0; transform: scale(.9) translateY(6px); pointer-events: none;
  }
  .wrap[data-open="true"] .dot { opacity: 0; pointer-events: none; }
  .head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 2px 8px; letter-spacing: .08em; text-transform: uppercase;
    font-size: 9px; color: #9A8F88;
  }
  .close {
    background: none; border: 0; color: #9A8F88; cursor: pointer;
    font: inherit; font-size: 13px; line-height: 1; padding: 0 2px;
  }
  .close:hover { color: #EDE8E4; }
  ul { list-style: none; margin: 0; padding: 0; }
  li button {
    width: 100%; display: flex; gap: 8px; align-items: baseline;
    background: none; border: 0; border-radius: 5px; cursor: pointer;
    padding: 4px 6px; font: inherit; color: #C9BFB9; text-align: left;
  }
  li button:hover { background: rgba(255,255,255,.07); color: #EDE8E4; }
  li[data-on="true"] button { background: rgba(226,202,198,.17); color: #FFF; }
  .n { color: #7E736D; min-width: 13px; }
  li[data-on="true"] .n { color: #E2CAC6; }
  .loose::after { content: " ?"; color: #C98F84; }
  .foot {
    padding: 7px 4px 1px; color: #7E736D; font-size: 9px;
    letter-spacing: .05em; display: flex; justify-content: space-between;
  }
</style>
<div class="wrap" data-open="false">
  <button class="dot" title="Sections"></button>
  <div class="panel">
    <div class="head"><span class="page">Sections</span><button class="close">&times;</button></div>
    <ul></ul>
    <div class="foot"><span class="pos"></span><span>click to copy</span></div>
  </div>
</div>`;

  const wrap = root.querySelector('.wrap');
  const list = root.querySelector('ul');
  const pos = root.querySelector('.pos');
  const page = root.querySelector('.page');
  let sections = [];

  const build = () => {
    sections = readSections();
    list.innerHTML = '';
    if (!sections.length) {
      list.innerHTML = '<li style="padding:4px 6px;color:#7E736D">none found</li>';
      return;
    }
    for (const s of sections) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.innerHTML = `<span class="n">${s.n}</span><span class="${s.loose ? 'loose' : ''}">${s.name}</span>`;
      b.title = s.loose ? 'no data-section, name read from the class' : 'copy section identity';
      b.onclick = () => {
        if (s.timeline !== null && window.__flight) window.__flight.scrollToT(s.timeline);
        else s.el.scrollIntoView({ block: 'start' });
        copy(`Section ${s.n}: ${s.name} [${s.key}]`);
      };
      li.append(b);
      list.append(li);
    }
    mark();
  };

  const mark = () => {
    const now = current(sections);
    for (const [i, li] of [...list.children].entries())
      li.dataset.on = sections[i] && sections[i] === now;
    pos.textContent = now
      ? `${now.n} of ${sections.length} · ${(scrollY / innerHeight).toFixed(1)}vh`
      : '';
  };

  const open = state => {
    wrap.dataset.open = state;
    try { localStorage.setItem(STORE, state); } catch {}
    if (state) build();
  };

  root.querySelector('.dot').onclick = () => open(true);
  root.querySelector('.close').onclick = () => open(false);
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && wrap.dataset.open === 'true') open(false);
  });

  let tick = false;
  addEventListener('scroll', () => {
    if (tick || wrap.dataset.open !== 'true') return;
    tick = true;
    requestAnimationFrame(() => { mark(); tick = false; });
  }, { passive: true });
  addEventListener('resize', () => wrap.dataset.open === 'true' && mark());

  /* Appended on load rather than at parse, so nothing is added to the document
     while GSAP is measuring. Fixed and out of flow, so no refresh is needed. */
  const attach = () => {
    document.body.append(host);
    const title = document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim();
    page.textContent = title ? `${title} sections` : 'Sections';
    let was = 'false';
    try { was = localStorage.getItem(STORE) || 'false'; } catch {}
    open(was === 'true');
  };
  if (document.readyState === 'complete') attach();
  else addEventListener('load', attach);
})();
