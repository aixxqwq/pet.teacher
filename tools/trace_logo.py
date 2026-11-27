"""
Обводит логотип (две «B» + листики) с картинки и сохраняет вектор img/logo.svg.
Запуск:  python tools/trace_logo.py картинка.png
Коричневое → класс .b (в тёмной теме вкладки браузера становится кремовым), персиковое → .leaf.
"""
import os
import sys

import numpy as np
from PIL import Image
from skimage.filters import gaussian
from skimage.measure import approximate_polygon, find_contours

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UP = 4

im = Image.open(sys.argv[1]).convert("RGB")
im = im.resize((im.width * UP, im.height * UP), Image.LANCZOS)
a = np.asarray(im).astype(float)
R, G, B = a[..., 0], a[..., 1], a[..., 2]
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
brown = (L < 140).astype(float)
peach = ((R - B > 55) & (L >= 140)).astype(float)


def paths(mask):
    m = gaussian(mask, sigma=UP * 0.6)
    m = np.pad(m, 2)
    out = []
    for c in find_contours(m, 0.5):
        if len(c) < 40:
            continue                                     # мусор
        c = approximate_polygon(c, tolerance=0.9)
        pts = [(x - 2, y - 2) for y, x in c]
        out.append(pts)
    return out


bp, lp = paths(brown), paths(peach)
allpts = [p for s in bp + lp for p in s]
x0 = min(p[0] for p in allpts); x1 = max(p[0] for p in allpts)
y0 = min(p[1] for p in allpts); y1 = max(p[1] for p in allpts)
side = max(x1 - x0, y1 - y0)
pad = side * 0.04
S = 120 / (side + 2 * pad)
ox = x0 - pad - (side - (x1 - x0)) / 2
oy = y0 - pad - (side - (y1 - y0)) / 2


def d(polys):
    parts = []
    for pts in polys:
        q = [f"{(x - ox) * S:.1f} {(y - oy) * S:.1f}" for x, y in pts]
        parts.append("M" + "L".join(q) + "Z")
    return "".join(parts)


svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <!-- Bilim Buddy: две зеркальные «B» (Bilim + Buddy) складываются в раскрытую книгу, сверху — росток. Обведено tools/trace_logo.py -->
  <style>.b {{ fill: #674A38; }} .leaf {{ fill: #EBAB81; }} @media (prefers-color-scheme: dark) {{ .b {{ fill: #F1E4D6; }} }}</style>
  <path class="leaf" d="{d(lp)}"/>
  <path class="b" fill-rule="evenodd" d="{d(bp)}"/>
</svg>
'''
open(os.path.join(ROOT, "img", "logo.svg"), "w", encoding="utf-8").write(svg)
print("ok", len(bp), "brown contours,", len(lp), "leaf contours,", len(svg), "bytes")
