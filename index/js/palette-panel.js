/* Palette panel (TJ, 26 Oct 2026, PALETTE-PLAN.md section 8).
   PROTOTYPE ONLY. This panel never ships. When Ami picks a palette, the seeds go into
   :root, this file, palettes.js and the inline head script in every page are all removed.

   It shows on every page, with or without ?dev, so the client sees it on a plain link.
   Its own styling uses no site tokens and lives in a shadow root, so it looks the same
   under every palette. It is skipped when navigator.webdriver is true (screenshot and
   diff runs) unless the URL carries ?panel=show, which the panel screenshots use. */
(function () {
  var list = (window.TPS_PALETTES || []).filter(function (p) { return !p.failed; });
  var root = document.documentElement;
  var forced = /(^|[?&])panel=show($|&)/.test(location.search);
  if (navigator.webdriver && !forced) return;
  if (!list.length || document.getElementById('tps-palette-panel')) return;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* Any CSS colour string to #rrggbb, through a canvas, so oklch values work everywhere. */
  var cv = document.createElement('canvas'); cv.width = cv.height = 1;
  var cx = cv.getContext('2d', { willReadFrequently: true });
  function hex(c) {
    try {
      cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1);
      var d = cx.getImageData(0, 0, 1, 1).data;
      return '#' + [d[0], d[1], d[2]].map(function (n) { return (n < 16 ? '0' : '') + n.toString(16); }).join('');
    } catch (e) { return c; }
  }

  /* Read the accent and the soft ground for a palette: set it, read, restore, in one
     synchronous block so nothing paints in between. */
  function probe(id) {
    var prev = root.getAttribute('data-palette');
    root.setAttribute('data-palette', id);
    var cs = getComputedStyle(root);
    var out = { acc: hex(cs.getPropertyValue('--acc').trim()), soft: hex(cs.getPropertyValue('--g-soft').trim()) };
    if (prev === null) root.removeAttribute('data-palette'); else root.setAttribute('data-palette', prev);
    return out;
  }

  var sw = {};
  list.forEach(function (p) { sw[p.id] = probe(p.id); });

  function current() { return root.getAttribute('data-palette') || 'coral'; }
  function reach() { return root.getAttribute('data-reach') === 'button' ? 'button' : 'full'; }

  function themeColor() {
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) return;
    var v = getComputedStyle(root).getPropertyValue('--g-canvas').trim();
    if (v) m.setAttribute('content', hex(v));
  }

  var host = document.createElement('div');
  host.id = 'tps-palette-panel';
  host.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;';
  var sh = host.attachShadow({ mode: 'open' });
  sh.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}' +
    'button{font:inherit;color:#222;cursor:pointer}' +
    '.pill{background:#fff;color:#222;border:1px solid #ddd;border-radius:12px;padding:7px 12px;font-size:12px;line-height:1}' +
    '.card{display:none;width:236px;max-width:calc(100vw - 24px);background:#fff;color:#222;border:1px solid #ddd;border-radius:12px;padding:10px;font-size:13px}' +
    '.open .card{display:block}.open .pill{display:none}' +
    '.head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;font-weight:600}' +
    '.x{background:none;border:0;font-size:16px;line-height:1;padding:2px 4px}' +
    '.row{display:flex;align-items:center;gap:8px;width:100%;background:#fff;border:0;border-radius:8px;padding:6px;text-align:left;font-size:13px}' +
    '.row:hover{background:#f4f4f4}' +
    '.tick{width:14px;color:#222;font-size:13px}' +
    '.nm{flex:1}' +
    '.s{display:inline-block;width:16px;height:16px;border-radius:50%;border:1px solid #ddd;margin-left:-4px}' +
    '.sec{margin-top:8px;padding-top:8px;border-top:1px solid #ddd}' +
    '.tg{display:flex;border:1px solid #ddd;border-radius:8px;overflow:hidden}' +
    '.tg button{flex:1;background:#fff;border:0;padding:6px 4px;font-size:12px}' +
    '.tg button+button{border-left:1px solid #ddd}' +
    '.tg button.on{background:#222;color:#fff}' +
    '.cp{width:100%;margin-top:8px;background:#fff;border:1px solid #ddd;border-radius:8px;padding:7px;font-size:12px}' +
    '</style>' +
    '<div class="wrap"><button class="pill" type="button" aria-expanded="false">Colours</button>' +
    '<div class="card" role="dialog" aria-label="Colours"><div class="head"><span>Colours</span>' +
    '<button class="x" type="button" aria-label="Close">&times;</button></div>' +
    '<div class="rows"></div>' +
    '<div class="sec"><div class="tg"><button type="button" data-r="full">Full</button>' +
    '<button type="button" data-r="button">Button only</button></div>' +
    '<button class="cp" type="button">Copy link</button></div></div></div>';

  var wrap = sh.querySelector('.wrap'), rows = sh.querySelector('.rows');
  list.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'row'; b.dataset.id = p.id;
    b.innerHTML = '<span class="tick"></span><span class="nm"></span><span><span class="s"></span><span class="s"></span></span>';
    b.querySelector('.nm').textContent = p.name;
    var s = b.querySelectorAll('.s');
    s[0].style.background = sw[p.id].acc; s[1].style.background = sw[p.id].soft;
    rows.appendChild(b);
  });

  function paint() {
    var c = current(), r = reach();
    [].forEach.call(rows.children, function (b) { b.firstChild.textContent = b.dataset.id === c ? '✓' : ''; });
    [].forEach.call(sh.querySelectorAll('.tg button'), function (b) { b.classList.toggle('on', b.dataset.r === r); });
  }
  function setOpen(o) {
    wrap.classList.toggle('open', o);
    sh.querySelector('.pill').setAttribute('aria-expanded', String(o));
  }

  sh.querySelector('.pill').addEventListener('click', function () { setOpen(true); });
  sh.querySelector('.x').addEventListener('click', function () { setOpen(false); });
  rows.addEventListener('click', function (e) {
    var b = e.target.closest('.row'); if (!b) return;
    root.setAttribute('data-palette', b.dataset.id); store('tps-palette', b.dataset.id);
    themeColor(); paint();
  });
  sh.querySelector('.tg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    root.setAttribute('data-reach', b.dataset.r); store('tps-reach', b.dataset.r);
    themeColor(); paint();
  });
  sh.querySelector('.cp').addEventListener('click', function (e) {
    var btn = e.currentTarget, u = new URL(location.href);
    u.searchParams.delete('panel'); u.searchParams.set('palette', current()); u.searchParams.set('reach', reach());
    var link = u.toString();
    function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy link'; }, 1500); }
    function fallback() {
      var t = document.createElement('textarea'); t.value = link; t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (er) {}
      t.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, fallback);
    else fallback();
  });

  paint(); themeColor();
  document.body.appendChild(host);
})();
