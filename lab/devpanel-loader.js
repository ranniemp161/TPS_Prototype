/* Loads the shared section panel only when the URL contains ?dev. */
(() => {
  if (!/(^|[?&])dev($|[=&])/.test(location.search)) return;
  const own = document.currentScript;
  const script = document.createElement('script');
  script.src = new URL('devpanel.js', own.src).href;
  document.body.append(script);
})();
