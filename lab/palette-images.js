/* Palette images (TJ, 26 Oct 2026). Prototype only, removed when Ami picks.
   Some palettes carry their own regraded photographs in assets/img/<palette>/,
   same file names as the originals. When that palette is on, every <img>
   whose file is in the list points at the regraded copy; any other palette
   puts the original back. The video is untouched (TJ: deal with it later). */
(function () {
  var HOME = ['bath-steam', 'bind', 'care', 'hero_household-wide_v2_ironing', 'hero_night-shift_v1',
    'massage', 'meal', 's8-confinement-arrival', 'tb-bellybinding', 'tb-hotstone', 'tb-postpartum',
    'tb-traditional', 'tungku-held', 'tungku-stones'];
  /* dustyteal: Nano Banana Pro. The other six: Qwen Image Edit 2511 on RunPod (27 Oct 2026). */
  var SETS = { cognac: HOME, plum: HOME, sage: HOME, bronze: HOME, oxblood: HOME, navy: HOME, dustyteal: HOME };
  var root = document.documentElement;
  var RX = /(^|\/)assets\/img\/([^\/?#]+)\.webp(\?.*)?$/;
  function apply() {
    var pal = root.getAttribute('data-palette') || 'coral';
    var set = SETS[pal] || [];
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var orig = img.getAttribute('data-orig-src');
      if (!orig) {
        var src = img.getAttribute('src') || '';
        if (!RX.test(src)) continue;
        orig = src; img.setAttribute('data-orig-src', orig);
      }
      var name = orig.match(RX)[2];
      var want = set.indexOf(name) > -1 ? orig.replace(RX, '$1assets/img/' + pal + '/' + name + '.webp') : orig;
      if (img.getAttribute('src') !== want) img.setAttribute('src', want);
    }
  }
  new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['data-palette'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
