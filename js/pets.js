/*
  Питомцы, нарисованные кодом (SVG) в стиле милых стикеров.

  petSVG("sheep", "read") вернёт строку с картинкой <svg>…</svg>.
  Позы (pose): idle, happy, eat, read, sleep, play, sad, focus, boba, proud.
  Пропорции «чиби»: большая круглая голова, маленькое тельце, глазки внизу лица и широко расставлены.
  Анимация (дыхание, моргание, прыжки) описана в css/style.css в разделе «Питомцы».
*/
(function () {
  const O = "#5B4336";      // мягкий коричневый контур (не чёрный — так милее)
  const SW = 2.8;           // толщина контура
  const BLUSH = "#FFA9BA";  // румянец

  // ---------- шесть питомцев ----------
  // headCy/headRx/headRy — голова, eyeY/eyeDX — глаза, top — макушка (для шапочек)
  const BASE = { headCy: 96, headRx: 70, headRy: 58, top: 38, eyeY: 110, eyeDX: 30, mouthY: 119, blushY: 120, blushDX: 47 };
  const SPECIES = {
    sheep: Object.assign({}, BASE, {
      title: "Овечка", trait: "поддерживает",
      about: "Мягкая и терпеливая. Не даст бросить учёбу на полпути.",
      body: "#FFFAF4", arm: "#FFFAF4", foot: "#9C7F73", pad: "#C9B1A6", top: 34,
      phrases: ["Шаг за шагом.", "Хороший день для учёбы.", "Попробуем новую тему?", "Ты молодец, продолжаем."],
    }),
    capybara: Object.assign({}, BASE, {
      title: "Капибара", trait: "сохраняет спокойствие",
      about: "Невозмутима при любом дедлайне. Учит спокойно и без паники.",
      body: "#DDA87D", arm: "#D29C70", foot: "#C08A61", pad: "#E9C29F",
      eyeY: 102, eyeDX: 32, mouthY: 127, blushY: 116, blushDX: 52,
      phrases: ["Спокойно, всё успеем.", "Один вопрос — и чай.", "Без паники, по порядку.", "Хороший темп."],
    }),
    hamster: Object.assign({}, BASE, {
      title: "Хомяк", trait: "запасает знания",
      about: "Набивает щёки знаниями про запас. Любит частые маленькие занятия.",
      body: "#F7BE8E", belly: "#FFF3E3", arm: "#FFF3E3", foot: "#F8B9AE", pad: "#FCD7CF",
      phrases: ["Ещё один факт в запас!", "Щёки полны знаний.", "Маленькими шагами — далеко.", "Давай ещё вопросик?"],
    }),
    panda: Object.assign({}, BASE, {
      title: "Панда", trait: "не спешит",
      about: "Учится без спешки, но каждый день. Ценит режим и перерывы.",
      body: "#FFFFFF", arm: "#3B3537", foot: "#3B3537", pad: "#6B6265", patch: true,
      phrases: ["Спокойно и по шагам.", "Без спешки, но каждый день.", "Хороший ритм. Продолжим?", "Маленькие шаги — большой результат."],
    }),
    duck: Object.assign({}, BASE, {
      title: "Утёнок", trait: "всегда на позитиве",
      about: "Радуется каждому верному ответу. С ним учиться веселее.",
      body: "#FFE27A", arm: "#FFD95C", foot: "#FFA94D", pad: "#FFA94D",
      mouthY: 121,
      phrases: ["Кря! Отличный день для учёбы.", "Ещё чуть-чуть — и новый уровень!", "У тебя всё получается.", "Вперёд, к знаниям!"],
    }),
    hedgehog: Object.assign({}, BASE, {
      title: "Ёжик", trait: "доводит дело до конца",
      about: "Колючий снаружи, усердный внутри. Любит фокус и тишину.",
      body: "#C49C79", belly: "#F9E8D2", face: "#F9E8D2", arm: "#F3D9BB", foot: "#F3D9BB", pad: "#E8C7A3",
      headCy: 100, headRx: 60, headRy: 50, top: 30, eyeY: 110, eyeDX: 26, blushDX: 40,
      phrases: ["Фокус — моя суперсила.", "Доделаем начатое?", "Тишина и концентрация.", "Ещё один шаг к цели."],
    }),
  };

  // ---------- помощники для SVG ----------
  const n = (v) => Math.round(v * 10) / 10;
  const line = `stroke="${O}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;
  const ell = (cx, cy, rx, ry, fill, extra = "") =>
    `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" ${line} ${extra}/>`;
  const circ = (cx, cy, r, fill, extra = "") =>
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" ${line} ${extra}/>`;
  const path = (d, fill = "none", extra = "") => `<path d="${d}" fill="${fill}" ${line} ${extra}/>`;

  /* «Облачко» из кружков (шерсть овечки): сначала кружки с толстым контуром,
     потом те же кружки без контура — внутренние линии закрываются, остаётся только внешний край. */
  function cloud(cx, cy, rx, ry, r, fill) {
    const pts = [];
    const count = Math.round((2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2)) / (r * 1.15));
    for (let i = 0; i < count; i++) {
      const a = (2 * Math.PI * i) / count;
      pts.push([cx + (rx - r * 0.6) * Math.cos(a), cy + (ry - r * 0.6) * Math.sin(a)]);
    }
    const stroked = pts.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${fill}" stroke="${O}" stroke-width="${SW * 2}"/>`).join("");
    const filled = pts.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${fill}"/>`).join("");
    const core = `<ellipse cx="${cx}" cy="${cy}" rx="${rx - r * 0.5}" ry="${ry - r * 0.5}" fill="${fill}"/>`;
    return stroked + core + filled;
  }

  /* Несколько фигур одним силуэтом (голова + тельце без линии между ними).
     Тот же приём: сначала толстый контур у всех фигур, потом заливка поверх. */
  function blob(shapes, fill) {
    const st = shapes.map((sh) => sh.replace("/>", ` fill="${fill}" stroke="${O}" stroke-width="${SW * 2}" stroke-linejoin="round"/>`)).join("");
    const fl = shapes.map((sh) => sh.replace("/>", ` fill="${fill}"/>`)).join("");
    return st + fl;
  }
  const MERGED = ["duck", "hamster", "capybara"];
  function headEl(sp, key) {
    if (key === "capybara") return `<rect x="52" y="${sp.headCy - 54}" width="136" height="112" rx="54"/>`;
    return `<ellipse cx="120" cy="${sp.headCy}" rx="${sp.headRx}" ry="${sp.headRy}"/>`;
  }
  const bodyEl = () => `<ellipse cx="120" cy="176" rx="56" ry="34"/>`;

  const heart = (x, y, s, color = "#FF8FAB") =>
    `<g class="fx-i"><path transform="translate(${x} ${y}) scale(${s})" d="M0 3C0-2 6-3 7 1C8-3 14-2 14 3C14 8 7 12 7 13C7 12 0 8 0 3Z" fill="${color}" stroke="${O}" stroke-width="${1.5 / s}" stroke-linejoin="round"/></g>`;
  const sparkle = (x, y, s, color = "#FFD166") =>
    `<g class="fx-i"><path transform="translate(${x} ${y}) scale(${s})" d="M0-10Q1.5-1.5 10 0Q1.5 1.5 0 10Q-1.5 1.5-10 0Q-1.5-1.5 0-10Z" fill="${color}" stroke="${O}" stroke-width="${1.3 / s}" stroke-linejoin="round"/></g>`;

  // ---------- голова ----------
  function behindHead(sp, key) {
    const c = 120;
    switch (key) {
      case "sheep":   // ушки висят по бокам
        return [-1, 1].map((d) => {
          const x = c + d * 70, y = 112, rot = d * 28;
          return `<g transform="rotate(${rot} ${x} ${y})">${ell(x, y, 21, 11, sp.body)}<ellipse cx="${x + d * 3}" cy="${y + 1}" rx="13" ry="5.5" fill="#FBC9CF"/></g>`;
        }).join("");
      case "capybara":
        return circ(c - 52, 48, 9, "#C8916A") + circ(c + 52, 48, 9, "#C8916A");
      case "hamster":
        return [-1, 1].map((d) => circ(c + d * 50, 50, 16, sp.body) + `<circle cx="${c + d * 50}" cy="51" r="9" fill="#FBB9BE"/>`).join("");
      case "panda":
        return circ(c - 52, 48, 17, sp.arm) + circ(c + 52, 48, 17, sp.arm);
      case "hedgehog": {
        // иголки — мягкие закруглённые зубчики вокруг головы
        const cx = 120, cy = 98, R1x = 80, R1y = 72, R2x = 66, R2y = 58, k = 17;
        const from = Math.PI * 0.82, to = Math.PI * 2.18;
        let d = "";
        for (let i = 0; i <= k; i++) {
          const a = from + ((to - from) * i) / k;
          const p = [cx + R2x * Math.cos(a), cy + R2y * Math.sin(a)];
          if (i === 0) d += `M${n(p[0])} ${n(p[1])}`;
          else {
            const am = from + ((to - from) * (i - 0.5)) / k;
            d += `Q${n(cx + R1x * 1.08 * Math.cos(am))} ${n(cy + R1y * 1.08 * Math.sin(am))} ${n(p[0])} ${n(p[1])}`;
          }
        }
        d += "Z";
        let hatch = "";
        for (let i = 1; i < k; i += 2) {
          const a = from + ((to - from) * (i - 0.5)) / k;
          hatch += `<path d="M${n(cx + 62 * Math.cos(a))} ${n(cy + 54 * Math.sin(a))}L${n(cx + 72 * Math.cos(a))} ${n(cy + 64 * Math.sin(a))}" stroke="#9C7859" stroke-width="2" stroke-linecap="round"/>`;
        }
        return path(d, sp.body) + hatch + circ(c - 36, 58, 9, "#E8C7A3") + circ(c + 36, 58, 9, "#E8C7A3");
      }
      default:
        return "";
    }
  }

  function headShape(sp, key) {
    const c = 120, cy = sp.headCy;
    switch (key) {
      case "sheep": {
        let curls = "";
        [[98, 50], [120, 44], [142, 50], [82, 66], [158, 66]].forEach(([x, y]) => {
          curls += `<path d="M${x - 6} ${y + 2}q6-8 12 0" fill="none" stroke="#EADBC9" stroke-width="2.3" stroke-linecap="round"/>`;
        });
        return cloud(c, cy, sp.headRx, sp.headRy, 15, sp.body) + curls;
      }
      case "capybara":
        // голова-«булочка» и чуть более тёмная мордочка
        return `<ellipse cx="${c}" cy="124" rx="42" ry="23" fill="#CF976C"/>` +
          `<rect x="${c - 11}" y="111" width="22" height="8" rx="4" fill="${O}"/>`;
      case "hamster":
        return `<ellipse cx="${c - 22}" cy="${cy + 26}" rx="34" ry="27" fill="${sp.belly}"/><ellipse cx="${c + 22}" cy="${cy + 26}" rx="34" ry="27" fill="${sp.belly}"/>` +
          `<ellipse cx="${c}" cy="114" rx="4" ry="3" fill="#F0909C"/>`;
      case "panda":
        return ell(c, cy, sp.headRx, sp.headRy, sp.body) +
          `<ellipse cx="${c - sp.eyeDX}" cy="${sp.eyeY - 1}" rx="12.5" ry="15" transform="rotate(28 ${c - sp.eyeDX} ${sp.eyeY - 1})" fill="${sp.arm}"/>` +
          `<ellipse cx="${c + sp.eyeDX}" cy="${sp.eyeY - 1}" rx="12.5" ry="15" transform="rotate(-28 ${c + sp.eyeDX} ${sp.eyeY - 1})" fill="${sp.arm}"/>` +
          `<ellipse cx="${c}" cy="116" rx="4.6" ry="3.3" fill="${O}"/>`;
      case "duck":
        return path(`M${c - 3} ${cy - sp.headRy + 1}q-3-14 7-17M${c + 3} ${cy - sp.headRy + 1}q6-11 15-7`);
      case "hedgehog":
        return ell(c, sp.headCy, sp.headRx, sp.headRy, sp.face) +
          `<ellipse cx="${c}" cy="118" rx="4.4" ry="3.3" fill="${O}"/>`;
      default:
        return "";
    }
  }

  // ---------- тельце и лапки ----------
  function bodyShape(sp, key) {
    const c = 120;
    let s;
    if (key === "sheep") s = cloud(c, 176, 56, 34, 12, sp.body);
    else if (MERGED.includes(key)) s = blob([bodyEl(), headEl(sp, key)], sp.body);
    else s = ell(c, 176, 56, 34, sp.body);
    if (sp.belly && key !== "sheep") s += `<ellipse cx="${c}" cy="182" rx="34" ry="22" fill="${sp.belly}"/>`;
    return s;
  }

  // сидит, лапки вперёд — видно подушечки
  function feet(sp, key) {
    if (key === "duck") return ell(90, 207, 19, 8, sp.foot) + ell(150, 207, 19, 8, sp.foot);
    return [88, 152].map((x) => ell(x, 204, 17, 12, sp.foot) + `<ellipse cx="${x}" cy="206" rx="8.5" ry="6" fill="${sp.pad}"/>`).join("");
  }

  // ---------- лицо ----------
  function eye(kind, x, y, patch) {
    const col = patch ? "#fff" : O;
    switch (kind) {
      case "happy":
        return `<path d="M${x - 5.5} ${y + 2}Q${x} ${y - 6} ${x + 5.5} ${y + 2}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
      case "closed":
        return `<path d="M${x - 5.5} ${y - 1}Q${x} ${y + 4.5} ${x + 5.5} ${y - 1}" fill="none" stroke="${col}" stroke-width="2.8" stroke-linecap="round"/>`;
      case "down":
        return patch
          ? `<circle cx="${x}" cy="${y + 2}" r="4" fill="#fff"/><circle cx="${x}" cy="${y + 3}" r="2.4" fill="${O}"/>`
          : `<ellipse cx="${x}" cy="${y + 2}" rx="4.4" ry="4" fill="${O}"/>`;
      case "sad":
        return patch
          ? `<circle cx="${x}" cy="${y}" r="4.6" fill="#fff"/><circle cx="${x}" cy="${y + 0.6}" r="2.8" fill="${O}"/><circle cx="${x + 1.4}" cy="${y - 1}" r="1.1" fill="#fff"/>`
          : `<ellipse cx="${x}" cy="${y}" rx="4.8" ry="5.6" fill="${O}"/><circle cx="${x + 1.7}" cy="${y - 2}" r="1.8" fill="#fff"/><circle cx="${x - 1.6}" cy="${y + 2}" r="1" fill="#fff"/>`;
      default:   // глазик-бусинка с бликом
        return patch
          ? `<circle cx="${x}" cy="${y}" r="4.8" fill="#fff"/><circle cx="${x + 0.5}" cy="${y + 0.5}" r="3" fill="${O}"/><circle cx="${x + 1.5}" cy="${y - 0.8}" r="1.1" fill="#fff"/>`
          : `<ellipse cx="${x}" cy="${y}" rx="4.6" ry="5.4" fill="${O}"/><circle cx="${x + 1.6}" cy="${y - 1.9}" r="1.8" fill="#fff"/>`;
    }
  }

  function mouth(kind, key, sp) {
    const x = 120, y = sp.mouthY;
    if (key === "duck") {   // у утёнка вместо рта клювик-улыбка
      if (kind === "open" || kind === "chew") {
        return ell(x, y - 2, 13, 5.5, "#FFA94D") + path(`M${x - 10} ${y + 3}Q${x} ${y + 13} ${x + 10} ${y + 3}Z`, "#F08A3A");
      }
      return path(`M${x - 13} ${y - 1}Q${x} ${y - 7} ${x + 13} ${y - 1}Q${x} ${y + 9} ${x - 13} ${y - 1}Z`, "#FFA94D") +
        `<path d="M${x - 9} ${y}Q${x} ${y + 2.5} ${x + 9} ${y}" fill="none" stroke="${O}" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    const st = `fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
    let m;
    switch (kind) {
      case "open":
        m = `<path d="M${x - 6} ${y - 1}Q${x} ${y + 10} ${x + 6} ${y - 1}Z" fill="#B5525F" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/>` +
          `<path d="M${x - 3} ${y + 4.5}Q${x} ${y + 2} ${x + 3} ${y + 4.5}Q${x} ${y + 7} ${x - 3} ${y + 4.5}Z" fill="#FF9AAA"/>`;
        break;
      case "chew":
        m = `<ellipse class="p-chew" cx="${x}" cy="${y + 2}" rx="4" ry="3.6" fill="#B5525F" stroke="${O}" stroke-width="2"/>`;
        break;
      case "o":
        m = `<ellipse cx="${x}" cy="${y + 2}" rx="2.6" ry="3" fill="#B5525F" stroke="${O}" stroke-width="1.8"/>`;
        break;
      case "frown":
        m = `<path d="M${x - 4.5} ${y + 3.5}Q${x} ${y} ${x + 4.5} ${y + 3.5}" ${st}/>`;
        break;
      case "small":
        m = `<path d="M${x - 2.5} ${y + 1}q2.5 2 5 0" ${st}/>`;
        break;
      default:   // «ω»
        m = `<path d="M${x - 6} ${y}q3 3.8 6 0q3 3.8 6 0" ${st}/>`;
    }
    if (key === "hamster" && kind === "w") {
      m += `<rect x="${x - 2.6}" y="${y + 2.6}" width="5.2" height="4.4" rx="1" fill="#fff" stroke="${O}" stroke-width="1.5"/>`;
    }
    return m;
  }

  const POSE_FACE = {
    idle: ["dot", "w"], happy: ["happy", "open"], eat: ["happy", "chew"], read: ["down", "w"],
    sleep: ["closed", "small"], play: ["happy", "w"], sad: ["sad", "frown"], focus: ["down", "small"],
    boba: ["happy", "o"], proud: ["happy", "open"],
  };

  function face(sp, key, pose) {
    const [eyeKind, mouthKind] = POSE_FACE[pose] || POSE_FACE.idle;
    const c = 120, patch = !!sp.patch;
    let s = `<ellipse cx="${c - sp.blushDX}" cy="${sp.blushY}" rx="10" ry="6" fill="${BLUSH}" opacity=".8"/>` +
      `<ellipse cx="${c + sp.blushDX}" cy="${sp.blushY}" rx="10" ry="6" fill="${BLUSH}" opacity=".8"/>`;
    const blink = eyeKind === "dot" ? " p-blink" : "";
    s += `<g class="p-eyes${blink}">` + eye(eyeKind, c - sp.eyeDX, sp.eyeY, patch) + eye(eyeKind, c + sp.eyeDX, sp.eyeY, patch) + "</g>";
    if (eyeKind === "sad") {   // бровки домиком
      const y = sp.eyeY, b = patch ? "#fff" : O;
      s += `<path d="M${c - sp.eyeDX - 6} ${y - 9}Q${c - sp.eyeDX} ${y - 10} ${c - sp.eyeDX + 5} ${y - 13}M${c + sp.eyeDX - 5} ${y - 13}Q${c + sp.eyeDX} ${y - 10} ${c + sp.eyeDX + 6} ${y - 9}" fill="none" stroke="${patch ? O : b}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    s += mouth(mouthKind, key, sp);
    return s;
  }

  // ---------- аксессуары на голове ----------
  function glasses(sp) {
    const y = sp.eyeY + 1, r = 11, c = 120;
    return `<g fill="rgba(255,255,255,.3)" stroke="${O}" stroke-width="2.4">` +
      `<circle cx="${c - sp.eyeDX}" cy="${y}" r="${r}"/><circle cx="${c + sp.eyeDX}" cy="${y}" r="${r}"/></g>` +
      `<path d="M${c - sp.eyeDX + r} ${y - 2}Q${c} ${y - 7} ${c + sp.eyeDX - r} ${y - 2}" fill="none" stroke="${O}" stroke-width="2.4"/>`;
  }

  function headphones(sp) {
    const c = 120, x1 = c - sp.headRx - 2, x2 = c + sp.headRx + 2, y = sp.headCy, t = sp.top - 14;
    const band = `M${x1 + 4} ${y}C${x1} ${t}, ${x2} ${t}, ${x2 - 4} ${y}`;
    return `<path d="${band}" fill="none" stroke="${O}" stroke-width="12" stroke-linecap="round"/>` +
      `<path d="${band}" fill="none" stroke="#9CC0EE" stroke-width="6.5" stroke-linecap="round"/>` +
      `<rect x="${x1 - 9}" y="${y - 15}" width="21" height="32" rx="10" fill="#9CC0EE" ${line}/>` +
      `<rect x="${x2 - 12}" y="${y - 15}" width="21" height="32" rx="10" fill="#9CC0EE" ${line}/>` +
      sparkle(x2 - 1.5, y + 1, 0.5, "#FFD166");
  }

  function nightcap(sp) {
    const c = 120, t = sp.top + 8;
    let dots = "";
    [[c - 24, t - 14], [c + 2, t - 26], [c + 26, t - 22], [c - 6, t - 4], [c + 40, t - 6]].forEach(([x, y]) => {
      dots += `<circle cx="${x}" cy="${y}" r="3.3" fill="#fff"/>`;
    });
    return path(`M${c - 50} ${t + 6}C${c - 44} ${t - 40} ${c + 30} ${t - 52} ${c + 70} ${t - 12}C${c + 56} ${t - 10} ${c + 46} ${t - 4} ${c + 46} ${t + 6}Z`, "#FFBFD0") +
      dots + circ(c + 72, t - 12, 9, "#fff") +
      `<rect x="${c - 54}" y="${t}" width="104" height="13" rx="6.5" fill="#fff" ${line}/>`;
  }

  function crown(sp) {
    const c = 120, t = sp.top + 4;
    return path(`M${c - 22} ${t + 4}L${c - 26} ${t - 22}L${c - 11} ${t - 9}L${c} ${t - 28}L${c + 11} ${t - 9}L${c + 26} ${t - 22}L${c + 22} ${t + 4}Z`, "#FFD166") +
      `<circle cx="${c}" cy="${t - 6}" r="3.3" fill="#FF8FAB"/>`;
  }

  // ---------- лапки и предметы перед тельцем ----------
  // маленькие лапки сложены на животике
  function armsDefault(sp) {
    return `<g class="p-arm-l">${ell(100, 166, 10, 12, sp.arm, `transform="rotate(-18 100 166)"`)}</g>` +
      `<g class="p-arm-r">${ell(140, 166, 10, 12, sp.arm, `transform="rotate(18 140 166)"`)}</g>`;
  }
  function armsUp(sp) {
    return `<g class="p-arm-l">${ell(72, 146, 9.5, 14, sp.arm, `transform="rotate(-40 72 146)"`)}</g>` +
      `<g class="p-arm-r">${ell(168, 146, 9.5, 14, sp.arm, `transform="rotate(40 168 146)"`)}</g>`;
  }
  const paw = (x, y, sp, cls = "") => `<g class="${cls}">${ell(x, y, 9.5, 8.5, sp.arm)}</g>`;

  function front(sp, key, pose) {
    switch (pose) {
      case "read":
        return `<g class="p-book">` +
          path("M70 172Q96 163 120 173Q144 163 170 172L172 204Q146 196 120 206Q94 196 68 204Z", "#9CC0EE") +
          path("M75 168Q98 160 120 170L120 200Q98 191 75 196Z", "#FFFDF8") +
          path("M165 168Q142 160 120 170L120 200Q142 191 165 196Z", "#FFFDF8") +
          `<g stroke="#D9CFC2" stroke-width="2" stroke-linecap="round"><path d="M84 177Q98 172 112 178M84 185Q98 180 112 186"/><path d="M128 178Q142 172 156 177M128 186Q142 180 156 185"/></g>` +
          `<path class="p-page" d="M120 170Q137 159 156 166L156 194Q137 189 120 200Z" fill="#FFFDF8" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/>` +
          `</g>` + paw(72, 186, sp) + paw(168, 186, sp);
      case "eat":
        return `<g class="p-arm-l">${ell(100, 166, 10, 12, sp.arm, `transform="rotate(-18 100 166)"`)}</g>` +
          `<g class="p-cookie">` + circ(146, 146, 15, "#EDBB7E") +
          `<path d="M155 133.5a6 6 0 0 0 6 6" fill="#FFF8EC" stroke="${O}" stroke-width="2.2"/>` +
          `<circle cx="141" cy="141" r="2.4" fill="#6B4430"/><circle cx="150" cy="151" r="2.4" fill="#6B4430"/><circle cx="139" cy="152" r="2" fill="#6B4430"/>` +
          paw(154, 160, sp) + `</g>`;
      case "boba":
        return `<g class="p-boba">` +
          `<path d="M126 140L121 122" stroke="${O}" stroke-width="9.5" stroke-linecap="round"/><path d="M126 140L121 122" stroke="#FF9AB3" stroke-width="5" stroke-linecap="round"/>` +
          path("M102 152L138 152L134 198Q120 203 106 198Z", "#F3E2C9") +
          `<rect x="99" y="145" width="42" height="9" rx="4.5" fill="#fff" ${line}/>` +
          `<g fill="#5A3B2E"><circle cx="112" cy="192" r="3.2"/><circle cx="120" cy="194" r="3.2"/><circle cx="128" cy="192" r="3.2"/><circle cx="116" cy="185" r="3.2"/><circle cx="125" cy="186" r="3.2"/></g>` +
          `</g>` + paw(100, 174, sp) + paw(140, 174, sp);
      case "focus":
        return `<g class="p-laptop">` +
          `<rect x="76" y="152" width="88" height="50" rx="7" fill="#E1DCF0" ${line}/>` +
          heart(113, 170, 1, "#FF8FAB") +
          `<rect x="64" y="200" width="112" height="10" rx="4" fill="#C3BADB" ${line}/>` +
          `</g>` + paw(72, 196, sp, "p-type-l") + paw(168, 196, sp, "p-type-r");
      case "happy":
      case "proud":
        return armsUp(sp);
      default:
        return armsDefault(sp);
    }
  }

  // ---------- эффекты вокруг (сердечки, Zzz, ноты) ----------
  function effects(sp, pose) {
    switch (pose) {
      case "happy":
      case "eat":
        return `<g class="fx fx-hearts">${heart(188, 66, 1.2)}${heart(38, 80, 0.9)}${heart(198, 30, 0.8)}</g>` +
          (pose === "eat" ? `<g class="fx fx-crumbs" fill="#D9A260"><circle cx="134" cy="168" r="2"/><circle cx="156" cy="174" r="1.6"/><circle cx="144" cy="180" r="1.8"/></g>` : "");
      case "proud":
        return `<g class="fx fx-sparkles">${sparkle(40, 56, 1)}${sparkle(202, 50, 1.2)}${sparkle(208, 120, 0.7)}${sparkle(30, 128, 0.7)}</g>`;
      case "sleep":
        return `<g class="fx fx-zzz" fill="${O}" font-family="Onest, sans-serif" font-weight="800">` +
          `<text x="190" y="62" font-size="24">Z</text><text x="206" y="38" font-size="17">z</text><text x="216" y="20" font-size="12">z</text></g>`;
      case "play":
        return `<g class="fx fx-notes" fill="${O}" font-family="Segoe UI Symbol, sans-serif">` +
          `<text x="200" y="60" font-size="26">♪</text><text x="18" y="74" font-size="22">♫</text><text x="208" y="112" font-size="18">♪</text></g>`;
      case "sad":
        return `<g class="fx fx-tear"><path d="M${120 - sp.eyeDX - 3} ${sp.eyeY + 7}q-5 8 0 11q5-3 0-11z" fill="#A6D3F7" stroke="${O}" stroke-width="1.5"/></g>`;
      case "focus":
        return `<g class="fx fx-sparkles">${sparkle(202, 58, 0.8, "#C6EBD3")}${sparkle(34, 78, 0.6, "#C6EBD3")}</g>`;
      default:
        return "";
    }
  }

  // ---------- собираем питомца ----------
  function petSVG(key, pose = "idle", opts = {}) {
    const sp = SPECIES[key] || SPECIES.sheep;
    const fx = opts.fx !== false;
    let head = behindHead(sp, key) + headShape(sp, key) + face(sp, key, pose);
    if (pose === "read") head += glasses(sp);
    if (pose === "play") head += headphones(sp);
    if (pose === "sleep") head += nightcap(sp);
    if (pose === "proud") head += crown(sp);

    const pillow = pose === "sleep"
      ? `<rect x="32" y="186" width="176" height="40" rx="20" fill="url(#pt-gingham)" ${line}/>`
      : "";
    // тельце рисуем первым: голова наполовину закрывает его — так получается «чиби»
    return `<svg class="pet pet-${key} pose-${pose}${MERGED.includes(key) ? " merged" : ""}" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
      `<g filter="url(#pt-sticker)"><g class="p-all">${pillow}` +
      `<g class="p-body">${bodyShape(sp, key)}${feet(sp, key)}</g>` +
      `<g class="p-head">${head}</g>` +
      `<g class="p-front">${front(sp, key, pose)}</g>` +
      `</g></g>${fx ? effects(sp, pose) : ""}</svg>`;
  }

  // Общие определения SVG: «стикерная» белая обводка с тенью и клетчатая ткань для подушки.
  function installDefs() {
    if (document.getElementById("pet-defs")) return;
    const div = document.createElement("div");
    div.innerHTML = `<svg id="pet-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <filter id="pt-sticker" x="-15%" y="-15%" width="130%" height="130%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="grow"/>
        <feFlood flood-color="#ffffff"/><feComposite in2="grow" operator="in" result="white"/>
        <feGaussianBlur in="grow" stdDeviation="6" result="blur"/><feOffset in="blur" dy="6" result="off"/>
        <feFlood flood-color="#4b3a8a" flood-opacity=".14"/><feComposite in2="off" operator="in" result="shadow"/>
        <feMerge><feMergeNode in="shadow"/><feMergeNode in="white"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <pattern id="pt-gingham" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#EEF4FC"/>
        <rect width="8" height="16" fill="#C3D8F2" opacity=".7"/><rect width="16" height="8" fill="#C3D8F2" opacity=".7"/>
      </pattern></defs></svg>`;
    document.body.prepend(div.firstElementChild);
  }

  window.Pets = { SPECIES, petSVG, installDefs };
})();
