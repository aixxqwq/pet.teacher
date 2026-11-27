"""
Режет листы стикеров (img/pets/src/<питомец>.jpg, 2 ряда × 5) на отдельные позы
с прозрачным фоном и без белой обводки-наклейки: img/pets/<питомец>-<поза>.webp

Что делаем с каждой позой:
  1. вырезаем всё белое/серое снаружи тёмного контура;
  2. увеличиваем в SCALE раз и «перерисовываем» края линий — контур становится чётким, а не мыльным;
  3. кладём на общий квадратный холст S×S: питомец по центру, ноги на одной линии
     (холст общий для всех поз — при смене позы питомец не «прыгает»).
В конце печатает S и низ BOTTOM — их нужно вписать в js/pets.js (IMG_CANVAS).
Запуск:  python tools/slice_sheets.py
"""
import os

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "img", "pets", "src")
OUT = os.path.join(ROOT, "img", "pets")
POSES = ["idle", "happy", "sad", "eat", "read", "sleep", "play", "focus", "proud", "boba"]
PETS = ["hamster", "sheep", "capybara", "panda", "duck", "hedgehog"]
SCALE = 3           # увеличение исходника
PAD = 6             # поля холста (в пикселях исходника)
TILT = {"focus": -4}  # поворот позы в градусах: у ноутбука стол на листе наклонён — выравниваем


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

    def gap(a, b):
        dx = max(a[0] - b[2], b[0] - a[2], 0)
        dy = max(a[1] - b[3], b[1] - a[3], 0)
        return (dx * dx + dy * dy) ** 0.5
    for s in small:   # мелочь (сердечки, ноты, искры, zzz) приклеиваем к ближайшему стикеру
        near = min(boxes, key=lambda b: gap(s, b))
        if gap(s, near) < 45:
            near[:] = [min(near[0], s[0]), min(near[1], s[1]), max(near[2], s[2]), max(near[3], s[3])]
    mid = h / 2
    top = sorted([b for b in boxes if (b[1] + b[3]) / 2 < mid], key=lambda b: b[0])
    bot = sorted([b for b in boxes if (b[1] + b[3]) / 2 >= mid], key=lambda b: b[0])
    return top + bot


def cutout(im):
    """Маска персонажа: всё светлое и бесцветное СНАРУЖИ тёмного контура — фон.
    Возвращает (картинка, маска) в размере исходника, обрезанные по персонажу."""
    w, h = im.size
    big = Image.new("RGB", (w + 20, h + 20), (255, 255, 255))
    big.paste(im, (10, 10))
    im = big
    r, g, b = im.split()
    mx = ImageChops.lighter(ImageChops.lighter(r, g), b)
    mn = ImageChops.darker(ImageChops.darker(r, g), b)
    light = Image.eval(im.convert("L"), lambda v: 255 if v >= 190 else 0)
    grey = Image.eval(ImageChops.subtract(mx, mn), lambda v: 255 if v <= 48 else 0)
    passable = ImageChops.multiply(light, grey)
    ImageDraw.floodfill(passable, (0, 0), 128)
    obj = Image.eval(passable, lambda v: 0 if v == 128 else 255)
    obj = obj.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    px = obj.load()            # убираем крошечные точки — мусор сжатия
    for y in range(0, obj.height, 2):
        for x in range(0, obj.width, 2):
            if px[x, y] == 255:
                ImageDraw.floodfill(obj, (x, y), 101)
                n = obj.histogram()[101]
                ImageDraw.floodfill(obj, (x, y), 254 if n >= 60 else 0)
                px = obj.load()
    obj = Image.eval(obj, lambda v: 255 if v == 254 else 0)
    box = obj.getbbox()
    return im.crop(box), obj.crop(box)


def curve(lo, hi):
    """Резкий переход: всё ниже lo → 0, выше hi → 255."""
    return lambda v: 0 if v <= lo else 255 if v >= hi else int((v - lo) * 255 / (hi - lo))


def enhance(rgb, obj):
    """Увеличение в SCALE раз с чёткими линиями."""
    size = (rgb.width * SCALE, rgb.height * SCALE)
    rgb_src = rgb
    # под прозрачными местами — цвет контура, чтобы края не светлели
    rgb = Image.composite(rgb, Image.new("RGB", rgb.size, (74, 55, 44)), obj)
    up = rgb.resize(size, Image.LANCZOS)
    # «перерисовываем» тёмные линии: маска тёмного → размытие → резкая кривая
    # только настоящие тёмные линии (не тени меха), край линии делаем резким, но толщину не меняем.
    # Линию ищем по картинке на БЕЛОМ фоне — иначе фон вокруг тоже считался бы «линией» (ступеньки по краю).
    white = Image.composite(rgb_src, Image.new("RGB", rgb_src.size, (255, 255, 255)), obj)
    L = white.resize(size, Image.LANCZOS).convert("L")
    dark = Image.eval(L, lambda v: 255 - curve(55, 135)(v))          # 255 = линия
    dark = dark.filter(ImageFilter.GaussianBlur(SCALE * 0.4))
    dark = Image.eval(dark, curve(115, 175))                         # чёткий край, линия чуть тоньше середины
    inkc = up.filter(ImageFilter.MinFilter(3))                       # цвет самой линии
    up = Image.composite(inkc, up, dark)
    up = up.filter(ImageFilter.UnsharpMask(radius=SCALE * 0.5, percent=45, threshold=2))
    # край силуэта: внутренность (чуть поджатая) + сама тёмная линия контура — гладко, без «лесенки»
    a = obj.filter(ImageFilter.MinFilter(5)).resize(size, Image.LANCZOS)
    a = a.filter(ImageFilter.GaussianBlur(SCALE * 0.8))
    a = Image.eval(a, curve(100, 180))
    line = Image.composite(dark, Image.new("L", size, 0), obj.filter(ImageFilter.MaxFilter(3)).resize(size, Image.BILINEAR))
    a0 = ImageChops.lighter(a, line)
    a = a0.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))   # закрываем светлые точки внутри линии
    holes = ImageChops.subtract(a, a0)                                         # эти точки красим цветом линии
    up = Image.composite(inkc, up, holes)
    out = up.convert("RGBA")
    out.putalpha(a)
    return out


if __name__ == "__main__":
    parts = {}
    for pet in PETS:
        sheet = Image.open(os.path.join(SRC, pet + ".jpg")).convert("RGB")
        boxes = stickers(sheet)
        if len(boxes) != 10:
            print("!!", pet, "нашлось стикеров:", len(boxes), boxes)
            continue
        for pose, (x0, y0, x1, y1) in zip(POSES, boxes):
            rgb, obj = cutout(sheet.crop((max(0, x0 - 4), max(0, y0 - 4), x1 + 4, y1 + 4)))
            if pose in TILT:   # выравниваем наклонённый стол (по часовой стрелке)
                rgb = rgb.rotate(TILT[pose], Image.BICUBIC, expand=True, fillcolor=(255, 255, 255))
                obj = obj.rotate(TILT[pose], Image.BILINEAR, expand=True).point(lambda v: 255 if v >= 128 else 0)
                box = obj.getbbox()
                rgb, obj = rgb.crop(box), obj.crop(box)
            parts[(pet, pose)] = (rgb, obj)
        print("ok", pet)
    # общий квадратный холст по самому большому стикеру
    side = max(max(r.width, r.height) for r, _ in parts.values()) + PAD * 2
    maxh = max(r.height for r, _ in parts.values())
    bottom = (side + maxh) // 2                 # линия «пола» (ноги) — одна для всех поз
    S = side * SCALE
    for (pet, pose), (rgb, obj) in parts.items():
        img = enhance(rgb, obj)
        canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        canvas.paste(img, ((S - img.width) // 2, bottom * SCALE - img.height), img)
        canvas.save(os.path.join(OUT, f"{pet}-{pose}.webp"), quality=90, method=6)
    print("IMG_CANVAS = { side:", side, ", bottom:", bottom, "}  (в пикселях исходника)")
