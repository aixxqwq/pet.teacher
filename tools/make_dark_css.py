"""
Собирает css/dark.css — тёмную тему сайта — из css/style.css.

Идея: проходим по всем правилам style.css и для каждого светлого цвета (белые карточки,
пастельные фоны, тёмный текст) пишем такое же правило для тёмной темы с подобранным цветом.
Правила работают, когда у <html> стоит data-theme="dark".
В конце добавляются ручные правки (MANUAL) для мест, которые лучше настроить руками.

Запуск после изменений в style.css:   python tools/make_dark_css.py
"""
import colorsys
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = ':root[data-theme="dark"]'

TOKENS = f"""{P} {{
  color-scheme: dark;
  --bg: #120E26;
  --ink: #ECE9FF;
  --muted: #A49EC8;
  --line: rgba(255, 255, 255, .09);
  --violet: #9C88FF;
  --good: #3DD68C;
  --bad: #FF6B70;
  --grad-soft: linear-gradient(135deg, rgba(123, 97, 255, .28), rgba(255, 126, 182, .22));
  --glass: rgba(34, 28, 68, .62);
  --glass-2: rgba(42, 35, 82, .8);
  --glass-border: rgba(255, 255, 255, .08);
  --shadow: 0 24px 60px -30px rgba(0, 0, 0, .7), 0 2px 6px -2px rgba(0, 0, 0, .4);
}}
"""

# Ручные правки: то, что автоматом не угадать.
MANUAL = f"""
/* ---------- ручные правки ---------- */
{P} .bg i {{ opacity: .22; }}
{P} .bg i:nth-child(4) {{ opacity: .12; }}
{P} .topbar .wrap {{ background: rgba(26, 21, 54, .72); box-shadow: 0 10px 30px -18px rgba(0, 0, 0, .8); }}
{P} .nav a.active {{ background: #ECE9FF; color: #1A1538; }}
{P} .pet-box svg {{ filter: drop-shadow(0 10px 18px rgba(0, 0, 0, .35)); }}
{P} input::placeholder, {P} textarea::placeholder {{ color: #8A84AE; }}
{P} select option {{ background: #221C44; color: #ECE9FF; }}
{P} .cal i.l0 {{ background: rgba(255, 255, 255, .07); }}
{P} img[src$="logo.svg"] {{ filter: drop-shadow(0 6px 10px rgba(0, 0, 0, .4)); }}
{P} .side-dim {{ background: rgba(0, 0, 0, .55); }}
{P} .side .nav a.active {{ background: #ECE9FF; color: #1A1538; }}
{P} .toast {{ border: 1px solid rgba(255, 255, 255, .12); }}
{P} .btn:not(.btn-white):not(.btn-ghost):not(.btn-line) {{ --bg: #5B45E0; }}
{P} .btn-white {{ --bg: #2A2352; }}
{P} .btn-ghost {{ --bg: rgba(42, 35, 82, .6); }}
{P} .btn-ghost:hover {{ --bg: rgba(56, 47, 108, .85); }}
{P} #recBtn.recording {{ --bg: #431417; }}
/* белые плашки внутри фиолетовых блоков: текст остаётся тёмным */
{P} .hero-actions .btn-sun, {P} .controls .btn-sun, {P} .modes:not(.light) button.sel, {P} .presets button.sel {{ color: #1E1A3C; }}
{P} .focus-pet .bubble {{ background: var(--glass-2); color: var(--ink); border-color: var(--glass-border); }}
{P} .hero, {P} .page-head {{ outline: 1px solid rgba(255, 255, 255, .06); outline-offset: -1px; }}
{P} .theme-btn .sun {{ display: block; }}
{P} .theme-btn .moon {{ display: none; }}
"""


def hex_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def to_hex(r, g, b):
    return "#" + "".join(f"{round(max(0, min(1, x)) * 255):02X}" for x in (r, g, b))


def lum(r, g, b):
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def dark_surface(r, g, b, light=0.17):
    """Светлый пастельный фон -> тёмный фон того же оттенка."""
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if s < 0.08:               # белый / серый -> фиолетово-серый
        h, s = 0.70, 0.35
    return to_hex(*colorsys.hls_to_rgb(h, light, min(s, 0.55)))


def light_text(r, g, b):
    """Тёмный цветной текст -> светлый того же оттенка."""
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return to_hex(*colorsys.hls_to_rgb(h, 0.80, min(s, 0.6)))


# Эти блоки и так тёмные (фиолетовое «северное сияние» или градиент) — белый цвет в них правильный.
ON_DARK = re.compile(r"\.hero|\.page-head|\.side-pet|\.focus-panel|\.flash \.back|\.talk-timer|\.night|\.timer-chip|\.rest-chip"
                     r"|\.btn-sun|\.chip\.grad|\.tico|\.acc-chip\.reg|\.pick:hover|\.pick\.sel|\.step-n|\.acc-ava|\.float-card|\.modes button\.sel|\.presets|\.focus-pet|\.controls")

COLOR = re.compile(r"#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b|rgba?\([^)]*\)|\bwhite\b")


def convert(prop, value):
    """Вернуть значение для тёмной темы или None, если менять не нужно."""
    is_bg = prop.startswith("background") or prop in ("fill",)
    is_text = prop in ("color", "-webkit-text-fill-color", "caret-color")
    is_line = prop.startswith("border") or prop.startswith("outline") or prop in ("stroke",)
    is_shadow = prop in ("box-shadow", "text-shadow")
    if not (is_bg or is_text or is_line or is_shadow):
        return None
    if is_bg and value.strip() == "var(--ink)":
        return "#5B45E0"                              # тёмные кнопки -> насыщенно-фиолетовые

    def rep(m):
        c = m.group(0)
        if c == "white":
            c = "#fff"
        if c.startswith("rgb"):
            nums = [float(x) for x in re.findall(r"[\d.]+", c)]
            r, g, b = (n / 255 for n in nums[:3])
            a = nums[3] if len(nums) > 3 else 1
            if is_shadow:
                return f"rgba(0, 0, 0, {min(.8, a * 1.6):.2f})" if lum(r, g, b) < .6 else c
            if lum(r, g, b) > .85:                      # белая полупрозрачная заливка
                if is_text or a < .4:
                    return c                            # белое на тёмном — уже правильно
                if is_line:
                    return f"rgba(255, 255, 255, {min(.12, a * .15):.2f})"
                return f"rgba(36, 30, 72, {a:.2f})"
            if lum(r, g, b) < .2 and a >= .5 and is_bg:
                return c                                # тёмная плашка (всплывашка) остаётся тёмной
            if lum(r, g, b) < .2:                       # тёмные (цвет текста) полупрозрачные линии и подложки
                return f"rgba(236, 233, 255, {a:.2f})" if not is_text else "rgba(236, 233, 255, .85)"
            return c
        r, g, b = hex_rgb(c)
        L = lum(r, g, b)
        if is_shadow:
            return c
        if is_text:
            if L < .45:
                return light_text(r, g, b) if colorsys.rgb_to_hls(r, g, b)[2] > .1 else "#ECE9FF"
            return c
        if L > .8:
            if is_line:
                return "rgba(255, 255, 255, .1)"
            return dark_surface(r, g, b)
        if L < .2 and (is_bg or is_line):
            return "#3A3170" if is_bg else "rgba(255, 255, 255, .2)"
        return c

    new = COLOR.sub(rep, value)
    return new if new != value else None


def prefix(selectors):
    out = []
    for s in selectors.split(","):
        s = s.strip()
        if not s:
            continue
        if s.startswith(":root"):
            out.append(P + s[5:])
        elif s.startswith("html"):
            out.append(P + s[4:])
        elif s.startswith("body"):
            out.append(f"{P} body{s[4:]}")
        else:
            out.append(f"{P} {s}")
    return ", ".join(out)


def strip_comments(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def walk(css):
    """Разбор CSS на (обёртка @media или None, селектор, тело)."""
    i, n, out = 0, len(css), []
    stack = []
    buf = ""
    while i < n:
        ch = css[i]
        if ch == "{":
            head = buf.strip()
            buf = ""
            if head.startswith("@media") or head.startswith("@supports"):
                stack.append(head)
            elif head.startswith("@keyframes") or head.startswith("@font-face"):
                depth, j = 1, i + 1
                while depth:
                    depth += {"{": 1, "}": -1}.get(css[j], 0)
                    j += 1
                i = j
                continue
            else:
                j = css.index("}", i)
                out.append((stack[-1] if stack else None, head, css[i + 1:j]))
                i = j + 1
                continue
        elif ch == "}":
            if stack:
                stack.pop()
            buf = ""
        else:
            buf += ch
        i += 1
    return out


def main():
    css = strip_comments(open(os.path.join(ROOT, "css", "style.css"), encoding="utf-8").read())
    blocks = {}
    for media, sel, body in walk(css):
        if ON_DARK.search(sel):
            continue
        if sel.startswith(":root") and "--" in body:
            continue                                 # переменные задаём в TOKENS
        decls = []
        for d in body.split(";"):
            if ":" not in d:
                continue
            prop, val = d.split(":", 1)
            prop, val = prop.strip(), val.strip()
            if prop.startswith("--"):
                continue
            new = convert(prop, val)
            if new:
                decls.append(f"{prop}: {new}")
        if decls:
            blocks.setdefault(media, []).append(f"{prefix(sel)} {{ {'; '.join(decls)}; }}")
    parts = ["/* Тёмная тема. Файл собран tools/make_dark_css.py из style.css — правь генератор, а не этот файл. */", TOKENS]
    for media, rules in blocks.items():
        if media:
            parts.append(media + " {\n  " + "\n  ".join(rules) + "\n}")
        else:
            parts.append("\n".join(rules))
    parts.append(MANUAL)
    out = "\n".join(parts)
    open(os.path.join(ROOT, "css", "dark.css"), "w", encoding="utf-8").write(out)
    print("css/dark.css:", sum(len(r) for r in blocks.values()), "правил")


main()
