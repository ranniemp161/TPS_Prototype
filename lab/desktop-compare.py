"""Compare two desktop-diff.mjs runs. python lab/desktop-compare.py <dirA> <dirB>"""
import sys, glob, os
import numpy as np
from PIL import Image
a, b = sys.argv[1:3]
fa = sorted(glob.glob(os.path.join(a, 'd*.png'))); worst = []
for f in fa:
    g = os.path.join(b, os.path.basename(f))
    if not os.path.exists(g): print('missing', os.path.basename(f)); continue
    A = np.asarray(Image.open(f).convert('L'), dtype=np.int16); B = np.asarray(Image.open(g).convert('L'), dtype=np.int16)
    if A.shape != B.shape: print('size differs', os.path.basename(f)); continue
    d = np.abs(A - B); frac = (d > 24).mean()
    worst.append((frac, os.path.basename(f)))
worst.sort(reverse=True)
print('shots', len(fa), 'in B', len(glob.glob(os.path.join(b, 'd*.png'))))
for frac, n in worst[:8]: print(f'{n} changed pixels {frac*100:.2f}%')
