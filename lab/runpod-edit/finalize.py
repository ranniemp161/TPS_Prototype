# Downloads a palette's Qwen outputs from the pod, fits each to its original's exact size,
# restores the bath scene's transparent edge, and saves webp into assets/img/<palette>/ (Opus, 27 Oct 2026).
import sys, os, json, urllib.request
from PIL import Image
pal = sys.argv[1]; pod = sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
tok = open(os.path.join(HERE, '.token')).read().strip()
names = [l.split('|')[0] for l in open(os.path.join(HERE, '..', 'image-retint', 'dustyteal', 'jobs.txt')).read().split()]
raw = os.path.join(HERE, 'out', pal); os.makedirs(raw, exist_ok=True)
dst = os.path.join(ROOT, 'assets', 'img', pal); os.makedirs(dst, exist_ok=True)
for n in names:
    p = os.path.join(raw, n + '.png')
    if '--redownload' in sys.argv or not os.path.exists(p):
        req = urllib.request.Request(f'https://{pod}-8000.proxy.runpod.net/out/{pal}/{n}.png', headers={'Authorization': 'Bearer ' + tok, 'User-Agent': 'curl/8.0'})
        open(p, 'wb').write(urllib.request.urlopen(req, timeout=120).read())
    o = Image.open(os.path.join(ROOT, 'assets', 'img', n + '.webp')); r = Image.open(p).convert('RGB')
    tw, th = o.size; ta = tw / th; w, h = r.size
    if w / h > ta: nw = round(h * ta); r = r.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = round(w / ta); r = r.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    r = r.resize((tw, th), Image.LANCZOS)
    if o.mode in ('RGBA', 'LA') or (o.mode == 'P' and 'transparency' in o.info):
        r = r.convert('RGBA'); r.putalpha(o.convert('RGBA').split()[3])
    r.save(os.path.join(dst, n + '.webp'), quality=88, method=6)
print(pal, 'done', len(names))
