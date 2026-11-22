"""
Рисунки для задач (графики и геометрические фигуры) — генерируются в SVG.
Используется скриптом tools/build_questions.py: каждый рисунок попадает в поле "figure" вопроса.
"""

GRID = "#ECE8FB"
AXIS = "#3B3566"
LINE = "#7B61FF"
LINE2 = "#FF7EB6"
TEXT = "#6D6790"
FONT = 'font-family="Onest, sans-serif"'


def _num(v):
    return str(int(v)) if float(v).is_integer() else str(round(v, 2))


def graph(xr, yr, plots, points=(), xlabel="x", ylabel="y", step=1, label_every=1, w=300, h=260):
    """Координатная плоскость. plots — список (функция или список точек, цвет)."""
    x0, x1 = xr
    y0, y1 = yr
    L, R, T, B = 34, 14, 14, 30
    X = lambda x: L + (x - x0) / (x1 - x0) * (w - L - R)
    Y = lambda y: h - B - (y - y0) / (y1 - y0) * (h - T - B)
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">']
    # сетка и подписи
    v = x0
    while v <= x1 + 1e-9:
        out.append(f'<line x1="{X(v):.1f}" y1="{T}" x2="{X(v):.1f}" y2="{h - B}" stroke="{GRID}"/>')
        if round(v / step) % label_every == 0 and v != 0:
            out.append(f'<text x="{X(v):.1f}" y="{min(max(Y(0) + 14, T + 10), h - B + 14):.1f}" font-size="10" fill="{TEXT}" text-anchor="middle" {FONT}>{_num(v)}</text>')
        v += step
    v = y0
    ystep = step if (y1 - y0) / step <= 24 else step * 5
    while v <= y1 + 1e-9:
        out.append(f'<line x1="{L}" y1="{Y(v):.1f}" x2="{w - R}" y2="{Y(v):.1f}" stroke="{GRID}"/>')
        if round(v / ystep) % label_every == 0 and v != 0:
            out.append(f'<text x="{max(X(0) - 5, L - 4):.1f}" y="{Y(v) + 3.5:.1f}" font-size="10" fill="{TEXT}" text-anchor="end" {FONT}>{_num(v)}</text>')
        v += ystep
    # оси
    ax = X(0) if x0 <= 0 <= x1 else L
    ay = Y(0) if y0 <= 0 <= y1 else h - B
    out.append(f'<line x1="{L}" y1="{ay:.1f}" x2="{w - R + 6}" y2="{ay:.1f}" stroke="{AXIS}" stroke-width="1.6"/>')
    out.append(f'<line x1="{ax:.1f}" y1="{h - B}" x2="{ax:.1f}" y2="{T - 6}" stroke="{AXIS}" stroke-width="1.6"/>')
    out.append(f'<path d="M{w - R + 6} {ay:.1f}l-6 -3.5v7z" fill="{AXIS}"/><path d="M{ax:.1f} {T - 6}l-3.5 6h7z" fill="{AXIS}"/>')
    out.append(f'<text x="{w - R + 2}" y="{ay - 6:.1f}" font-size="11" fill="{AXIS}" text-anchor="end" font-weight="600" {FONT}>{xlabel}</text>')
    out.append(f'<text x="{ax + 6:.1f}" y="{T + 4}" font-size="11" fill="{AXIS}" font-weight="600" {FONT}>{ylabel}</text>')
    if x0 <= 0 <= x1 and y0 <= 0 <= y1:
        out.append(f'<text x="{ax - 5:.1f}" y="{ay + 13:.1f}" font-size="10" fill="{TEXT}" text-anchor="end" {FONT}>0</text>')
    # графики (обрезаем по рамке)
    out.append(f'<clipPath id="c"><rect x="{L}" y="{T}" width="{w - L - R}" height="{h - T - B}"/></clipPath><g clip-path="url(#c)">')
    for f, color in plots:
        pts = f if isinstance(f, list) else [(x0 + (x1 - x0) * i / 200, f(x0 + (x1 - x0) * i / 200)) for i in range(201)]
        d = " ".join(f"{'M' if i == 0 else 'L'}{X(x):.1f} {Y(y):.1f}" for i, (x, y) in enumerate(pts))
        out.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>')
    out.append("</g>")
    for x, y, lab in points:
        out.append(f'<circle cx="{X(x):.1f}" cy="{Y(y):.1f}" r="4" fill="{LINE2}" stroke="#fff" stroke-width="1.5"/>')
        if lab:
            right = X(x) > w - 90          # у правого края подпись ставим слева от точки
            tx, anchor = (X(x) - 7, "end") if right else (X(x) + 7, "start")
            out.append(f'<text x="{tx:.1f}" y="{Y(y) - 7:.1f}" font-size="11" fill="{AXIS}" font-weight="600" text-anchor="{anchor}" {FONT}>{lab}</text>')
    out.append("</svg>")
    return "".join(out)


def shape(polys, labels=(), w=300, h=220, circles=(), marks=()):
    """Фигура: polys — список многоугольников [(x, y), ...]; labels — (x, y, текст);
    marks — прямые углы (x, y, угол_поворота)."""
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">']
    for cx, cy, r in circles:
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F3EFFF" stroke="{LINE}" stroke-width="2.5"/>')
        out.append(f'<circle cx="{cx}" cy="{cy}" r="3" fill="{AXIS}"/>')
    for poly in polys:
        d = " ".join(f"{'M' if i == 0 else 'L'}{x} {y}" for i, (x, y) in enumerate(poly)) + " Z"
        out.append(f'<path d="{d}" fill="#F3EFFF" stroke="{LINE}" stroke-width="2.5" stroke-linejoin="round"/>')
    for x, y, rot in marks:
        out.append(f'<path d="M0 -12H12V0" transform="translate({x} {y}) rotate({rot})" fill="none" stroke="{AXIS}" stroke-width="1.6"/>')
    for x, y, t in labels:
        out.append(f'<text x="{x}" y="{y}" font-size="14" fill="{AXIS}" font-weight="600" text-anchor="middle" {FONT}>{t}</text>')
    out.append("</svg>")
    return "".join(out)


def segment_line(x0, y0, x1, y1, color=LINE, dash=False):
    extra = 'stroke-dasharray="6 5"' if dash else ""
    return f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}" stroke="{color}" stroke-width="2.5" {extra}/>'


def custom(body, w=300, h=220):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">{body}</svg>'
