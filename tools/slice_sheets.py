"""
Режет листы стикеров (img/pets/src/<питомец>.jpg, 2 ряда × 5) на отдельные позы
с прозрачным фоном: img/pets/<питомец>-<поза>.webp
Все картинки одного размера (холст W×H), питомец стоит внизу по центру —
поэтому на сайте он не «прыгает» по размеру при смене позы.
Запуск:  python tools/slice_sheets.py
"""
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "img", "pets", "src")
OUT = os.path.join(ROOT, "img", "pets")
# порядок поз на листе (слева направо, сверху вниз)
POSES = ["idle", "happy", "sad", "eat", "read", "sleep", "play", "focus", "proud", "boba"]
PETS = ["hamster", "sheep", "capybara", "panda", "duck", "hedgehog"]
W, H = 320, 320     # холст готовой картинки, px


def stickers(im):
    """Находит 10 стикеров: связные области «не белого» на листе."""
    w, h = im.size
    ink = Image.eval(im.convert("L"), lambda v: 255 if v < 236 else 0)
    ink = ink.filter(ImageFilter.MaxFilter(9))
    mask = ink.copy()
    boxes, small = [], []
    px = mask.load()
    for y in range(0, h, 3):
        for x in range(0, w, 3):
            if px[x, y] == 255:
                ImageDraw.floodfill(mask, (x, y), 100)
                box = Image.eval(mask, lambda v: 255 if v == 100 else 0).getbbox()
                ImageDraw.floodfill(mask, (x, y), 50)
                px = mask.load()
                if box:
                    big = (box[2] - box[0]) * (box[3] - box[1]) > 15000
                    (boxes if big else small).append(list(box))
    # мелочь (сердечки, ноты, искры, zzz) приклеиваем к ближайшему стикеру
    def gap(a, b):
        dx = max(a[0] - b[2], b[0] - a[2], 0)
        dy = max(a[1] - b[3], b[1] - a[3], 0)
        return (dx * dx + dy * dy) ** 0.5
    for s in small:
        near = min(boxes, key=lambda b: gap(s, b))
        if gap(s, near) < 45:
            near[:] = [min(near[0], s[0]), min(near[1], s[1]), max(near[2], s[2]), max(near[3], s[3])]
    mid = h / 2
    top = sorted([b for b in boxes if (b[1] + b[3]) / 2 < mid], key=lambda b: b[0])
    bot = sorted([b for b in boxes if (b[1] + b[3]) / 2 >= mid], key=lambda b: b[0])
    return top + bot


def cutout(im):
    """Белый фон вокруг → прозрачный, своя ровная белая обводка."""
    w, h = im.size
    big = Image.new("RGB", (w + 20, h + 20), (255, 255, 255))
    big.paste(im, (10, 10))
    im = big
    light = Image.eval(im.convert("L"), lambda v: 255 if v >= 238 else 0)
    ImageDraw.floodfill(light, (0, 0), 128)
    obj = Image.eval(light, lambda v: 0 if v == 128 else 255)
    obj = obj.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    # убираем крошечные отдельные точки (мусор сжатия), искры и ноты — крупнее, они остаются
    px = obj.load()
    for y in range(0, obj.height, 2):
        for x in range(0, obj.width, 2):
            if px[x, y] == 255:
                ImageDraw.floodfill(obj, (x, y), 101)
                n = obj.histogram()[101]
                ImageDraw.floodfill(obj, (x, y), 254 if n >= 60 else 0)
                px = obj.load()
    obj = Image.eval(obj, lambda v: 255 if v == 254 else 0)
    pad = 6
    sticker = obj.filter(ImageFilter.MaxFilter(pad * 2 + 1)).filter(ImageFilter.GaussianBlur(1.1))
    white = Image.new("RGB", im.size, (255, 255, 255))
    rgb = Image.composite(im, white, obj.filter(ImageFilter.GaussianBlur(0.7)))
    rgba = rgb.convert("RGBA")
    rgba.putalpha(sticker)
    return rgba.crop(sticker.getbbox())


if __name__ == "__main__":
    for pet in PETS:
        sheet = Image.open(os.path.join(SRC, pet + ".jpg")).convert("RGB")
        boxes = stickers(sheet)
        if len(boxes) != 10:
            print("!!", pet, "нашлось стикеров:", len(boxes), boxes)
            continue
        sizes = []
        for pose, (x0, y0, x1, y1) in zip(POSES, boxes):
            part = cutout(sheet.crop((max(0, x0 - 4), max(0, y0 - 4), x1 + 4, y1 + 4)))
            k = min(1.0, W / part.width, H / part.height)
            if k < 1:
                part = part.resize((round(part.width * k), round(part.height * k)), Image.LANCZOS)
            canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            canvas.paste(part, ((W - part.width) // 2, H - part.height), part)
            canvas.save(os.path.join(OUT, f"{pet}-{pose}.webp"), quality=86, method=6)
            sizes.append(part.size)
        print("ok", pet, sizes)
