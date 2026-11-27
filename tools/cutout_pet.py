"""
Вырезает питомца с белого фона и делает аккуратную белую обводку-наклейку.
Запуск:  python tools/cutout_pet.py картинка.jpg img/pets/hamster-happy.png
"""
import sys

from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
w, h = im.size

# 1. фон — всё почти белое, что связано с краями картинки (заливка от углов)
light = Image.eval(im.convert("L"), lambda v: 255 if v >= 245 else 0)
fill = light.copy()
for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
    if fill.getpixel(xy) == 255:
        ImageDraw.floodfill(fill, xy, 128)
bg = Image.eval(fill, lambda v: 255 if v == 128 else 0)          # 255 = фон
obj = Image.eval(bg, lambda v: 0 if v else 255)                 # 255 = питомец (без белой обводки)
obj = obj.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # убираем мелкий мусор

# 2. своя белая обводка вокруг питомца
pad = max(6, round(min(w, h) * 0.014))
sticker = obj.filter(ImageFilter.MaxFilter(pad * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2))

# 3. собираем: питомец как есть, вокруг — белая обводка, дальше прозрачно
white = Image.new("RGB", im.size, (255, 255, 255))
body_alpha = obj.filter(ImageFilter.GaussianBlur(0.8))
rgb = Image.composite(im, white, body_alpha)
rgba = rgb.convert("RGBA")
rgba.putalpha(sticker)
box = sticker.getbbox()
rgba = rgba.crop((max(0, box[0] - 4), max(0, box[1] - 4), min(w, box[2] + 4), min(h, box[3] + 4)))
rgba.save(out)
print("ok", out, rgba.size)
