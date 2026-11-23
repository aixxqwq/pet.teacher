/*
  Интерфейс сайта: страницы, кнопки, анимации.
  Страницы переключаются по адресу после «#»:  #/  #/learn  #/quiz  #/focus  #/my  #/new
*/
(() => {
  Pets.installDefs();

  // ---------- иконки (простые линии, цвет берут от текста) ----------
  const ico = (d, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    food: ico('<circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="14.5" cy="13" r="1" fill="currentColor"/><circle cx="10" cy="15.5" r="1" fill="currentColor"/>'),
    fun: ico('<path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z"/>'),
    energy: ico('<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>'),
    paw: ico('<ellipse cx="12" cy="16" rx="5" ry="4"/><circle cx="6" cy="10" r="1.8"/><circle cx="10" cy="6.5" r="1.8"/><circle cx="14" cy="6.5" r="1.8"/><circle cx="18" cy="10" r="1.8"/>', 22),
    arrow: ico('<path d="M5 12h14M13 6l6 6-6 6"/>', 18),
    play: ico('<path d="M7 5v14l12-7z" fill="currentColor"/>', 18),
    pause: ico('<path d="M8 5v14M16 5v14" stroke-width="3"/>', 18),
    reset: ico('<path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4"/>'),
    skip: ico('<path d="M6 5l9 7-9 7zM18 5v14"/>'),
    trash: ico('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', 18),
    down: ico('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', 18),
    up: ico('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>', 18),
    plus: ico('<path d="M12 5v14M5 12h14"/>', 18),
    book: ico('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/>'),
    music: ico('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
    moon: ico('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'),
    expand: ico('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  };

  // ---------- состояние ----------
  const view = document.getElementById("view");
  let pet = Game.loadPet();
  if (pet) { Game.applyTimePassed(pet); Game.savePet(pet); }
  let learn = { topic: pet ? pet.topic : "Английский", level: pet ? pet.level : "A1" };
  let quiz = null;
  let pick = { animal: "sheep", name: "" };
  let cleanup = [];            // что выключить при уходе со страницы

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };

  // ---------- питомец на странице ----------
  function petBox(pose, cls = "", id = "") {
    return `<div class="pet-box ${cls}" ${id ? `id="${id}"` : ""} data-base="${pose}">${Pets.petSVG(pet ? pet.animal : pick.animal, pose)}</div>`;
  }
  /** Сменить позу. Если указан ms — через это время вернуть обычную позу. */
  function setPose(box, pose, ms, animal) {
    if (!box) return;
    clearTimeout(box._t);
    if (box.dataset.pose !== pose) {
      box.innerHTML = Pets.petSVG(animal || pet.animal, pose);
      box.dataset.pose = pose;
      box.classList.remove("swap"); void box.offsetWidth; box.classList.add("swap");
    }
    if (ms) box._t = setTimeout(() => setPose(box, box.dataset.base, 0, animal), ms);
  }
  function bump(box, cls) {
    if (!box) return;
    box.classList.remove(cls); void box.offsetWidth; box.classList.add(cls);
  }

  // ---------- уведомления и конфетти ----------
  function toast(text, icon = "✓") {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="tico">${icon}</span><span>${text}</span>`;
    document.getElementById("toasts").append(t);
    setTimeout(() => { t.classList.add("hide"); setTimeout(() => t.remove(), 400); }, 2800);
  }
  function confetti() {
    const box = document.createElement("div");
    box.className = "confetti";
    const colors = ["#F6C343", "#5A5596", "#F4A7B9", "#BFE3C8", "#8FB3E2"];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement("i");
      c.style.left = Math.random() * 100 + "%";
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.8 + Math.random() * 1.6 + "s";
      c.style.animationDelay = Math.random() * 0.4 + "s";
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.append(c);
    }
    document.body.append(box);
    setTimeout(() => box.remove(), 4000);
  }

  // ---------- шапка ----------
  function updateHeader(route) {
    $$("#nav a, #tabbar a").forEach((a) => a.classList.toggle("active", a.dataset.route === route));
    $("#tabbar").style.display = pet ? "" : "none";
    const dueN = Cards.due().length;   // сколько карточек ждут повторения
    $("#dueBadge").textContent = dueN || "";
    $("#dueBadge").classList.toggle("on", dueN > 0);
    $("#tabDue").textContent = dueN || "";
    $("#tabDue").classList.toggle("on", dueN > 0);
    $("#nav").style.visibility = pet ? "" : "hidden";
    const acc = $("#accChip");
    if (acc) {
      const a = Api.auth();
      acc.classList.toggle("active", route === "account");
      acc.innerHTML = a ? `<span class="acc-dot">${esc(a.username[0].toUpperCase())}</span>` : "Войти";
      acc.title = a ? `Аккаунт: ${a.username}` : "Войти в аккаунт";
      acc.classList.toggle("in", !!a);
      // кнопки «Войти» и «Регистрация» сразу открывают нужную вкладку
      const reg = $("#regChip");
      reg.style.display = a ? "none" : "";
      document.body.classList.toggle("guest", !a);
      acc.onclick = (e) => { if (!Api.auth()) { e.preventDefault(); accMode = "login"; go("#/account"); } };
      reg.onclick = (e) => { e.preventDefault(); accMode = "register"; go("#/account"); };
    }
    const chip = $("#lvlChip");
    if (!pet) { chip.style.display = "none"; return; }
    chip.style.display = "";
    chip.innerHTML = `<span class="ava">${Pets.petSVG(pet.animal, "idle", { fx: false })}</span>
      <span class="ln"><b>${esc(pet.name)}</b> · ур. ${Game.level(pet)}</span>
      <span class="mini-xp"><span style="width:${(Game.xpInLevel(pet) / Game.XP_PER_LEVEL) * 100}%"></span></span>`;
  }
  window.addEventListener("scroll", () => $(".topbar").classList.toggle("scrolled", scrollY > 8), { passive: true });

  // ============================================================
  //  Главная: питомец, шкалы, действия
  // ============================================================
  const STATS = [
    { key: "food", name: "Сытость", icon: I.food, hint: "Растёт за верные ответы" },
    { key: "fun", name: "Настроение", icon: I.fun, hint: "Перерывы и серии ответов" },
    { key: "energy", name: "Энергия", icon: I.energy, hint: "Восстанавливается во сне" },
  ];
  function statCards() {
    return STATS.map((s) => {
      const v = pet[s.key];
      const segs = Array.from({ length: 10 }, (_, k) => `<i class="${k < v ? "on" : ""}" style="--k:${k}"></i>`).join("");
      return `<div class="card">
        <div class="stat-top"><span class="stat-ico">${s.icon}</span>${v <= 3 ? '<span class="chip bad">низко</span>' : v >= 8 ? '<span class="chip good">отлично</span>' : ""}</div>
        <div class="stat-val">${v}<small> / 10</small></div>
        <div class="stat-name">${s.name}</div>
        <div class="stat-hint">${s.hint}</div>
        <div class="segs ${v <= 3 ? "low" : ""}">${segs}</div>
      </div>`;
    }).join("");
  }
  function daysTogether() {
    return Math.max(1, Math.floor((Date.now() - new Date(pet.born).getTime()) / 86400000) + 1);
  }
  function numbers() {
    const d = daysTogether(), m = Game.totalFocusMinutes();
    return `
      <div class="num"><b data-count="${pet.correct}">${pet.correct}</b><span>${plural(pet.correct, "верный ответ", "верных ответа", "верных ответов")}</span></div>
      <div class="num"><b data-count="${pet.best_streak}">${pet.best_streak}</b><span>лучшая серия подряд</span></div>
      <div class="num"><b data-count="${m}">${m}</b><span>${plural(m, "минута", "минуты", "минут")} фокуса</span></div>
      <div class="num"><b data-count="${d}">${d}</b><span>${plural(d, "день", "дня", "дней")} вместе</span></div>`;
  }

  // ---------- календарь активности ----------
  const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const WEEKS = 26;   // полгода

  function dayText(iso, d) {
    const [, m, dd] = iso.split("-").map(Number);
    const head = `${dd} ${MONTHS_GEN[m - 1]}${iso === Game.isoDay() ? " · сегодня" : ""}`;
    if (!Game.activityLevel(d)) return `<b>${head}</b><span>Занятий не было</span>`;
    const parts = [];
    if (d.answers) parts.push(`${d.answers} ${plural(d.answers, "ответ", "ответа", "ответов")} (${d.correct || 0} верных)`);
    if (d.minutes) parts.push(`${d.minutes} мин фокуса`);
    if (d.cards) parts.push(`${d.cards} ${plural(d.cards, "карточка", "карточки", "карточек")}`);
    if (d.ielts) parts.push(`${d.ielts} IELTS`);
    if (d.xp) parts.push(`+${d.xp} XP`);
    return `<b>${head}</b><span>${parts.join(" · ")}</span>`;
  }

  /** Сколько дней подряд ты занималась (если сегодня ещё не занималась, серия не сгорает до полуночи). */
  function activeStreak(stats) {
    const d = new Date();
    if (!Game.activityLevel(stats[Game.isoDay(d)])) d.setDate(d.getDate() - 1);
    let n = 0;
    while (Game.activityLevel(stats[Game.isoDay(d)])) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function activityCalendar() {
    const stats = Game.allStats();
    const now = new Date();
    const todayIso = Game.isoDay(now);
    // начинаем с понедельника недели, которая была WEEKS-1 недель назад
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (WEEKS - 1) * 7);
    let cells = "", months = "", active = 0, lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const monday = new Date(start); monday.setDate(start.getDate() + w * 7);
      // подпись месяца — над неделей, в которой он начинается
      let label = w === 0 ? monday.getMonth() : -1;
      for (let i = 0; i < 7; i++) {
        const x = new Date(monday); x.setDate(monday.getDate() + i);
        if (x.getDate() === 1) label = x.getMonth();
      }
      months += `<span>${label >= 0 && label !== lastMonth ? MONTHS[label] : ""}</span>`;
      if (label >= 0) lastMonth = label;
      for (let i = 0; i < 7; i++) {
        const day = new Date(monday); day.setDate(monday.getDate() + i);
        const iso = Game.isoDay(day);
        if (iso > todayIso) { cells += `<i class="future"></i>`; continue; }
        const lvl = Game.activityLevel(stats[iso]);
        if (lvl) active++;
        cells += `<i class="l${lvl}${iso === todayIso ? " today" : ""}" data-day="${iso}"></i>`;
      }
    }
    const streak = activeStreak(stats);
    return `
      <div class="card white cal-card">
        <div class="list-head">
          <h3>Календарь активности</h3>
          <div class="cal-sum">
            <span class="chip">🔥 ${streak} ${plural(streak, "день", "дня", "дней")} подряд</span>
            <span class="chip">${active} ${plural(active, "активный день", "активных дня", "активных дней")} за полгода</span>
          </div>
        </div>
        <div class="cal-scroll" id="calScroll">
          <div class="cal">
            <div class="cal-months">${months}</div>
            <div class="cal-wd"><span>Пн</span><span></span><span>Ср</span><span></span><span>Пт</span><span></span><span>Вс</span></div>
            <div class="cal-grid" id="calGrid">${cells}</div>
          </div>
        </div>
        <div class="cal-foot">
          <div class="cal-info" id="calInfo">${dayText(todayIso, stats[todayIso])}</div>
          <div class="cal-legend">меньше <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> больше</div>
        </div>
      </div>`;
  }

  /** Нажала или навела на клеточку — внизу видно, что было в этот день. */
  function bindCalendar() {
    const grid = $("#calGrid");
    if (!grid) return;
    const sc = $("#calScroll");
    sc.scrollLeft = sc.scrollWidth;   // на телефоне сразу показываем последние недели
    const show = (cell) => {
      if (!cell || !cell.dataset.day) return;
      $$("#calGrid i.sel").forEach((x) => x.classList.remove("sel"));
      cell.classList.add("sel");
      $("#calInfo").innerHTML = dayText(cell.dataset.day, Game.allStats()[cell.dataset.day]);
    };
    grid.addEventListener("click", (e) => show(e.target.closest("i")));
    grid.addEventListener("mouseover", (e) => show(e.target.closest("i")));
  }

  function home() {
    const sp = Pets.SPECIES[pet.animal];
    view.innerHTML = `
      <section class="hero reveal">
        <div class="hero-text">
          <span class="eyebrow" style="--i:0">Твой питомец-учитель</span>
          <h1 style="--i:1">${esc(pet.name)}</h1>
          <p class="hero-sub" style="--i:2">${sp.title} · ${Game.stage(pet)} · ${sp.trait}</p>
          <div class="bubble in" id="mood" style="--i:3">${Game.mood(pet)}</div>
          <div class="hero-actions" style="--i:4">
            <a class="btn btn-sun" href="#/learn">Начать учиться <span class="arr">${I.arrow}</span></a>
            <a class="btn btn-line" href="#/focus">Фокус-таймер</a>
          </div>
        </div>
        <div class="hero-pet" style="--i:2">
          <div class="halo"></div>
          ${petBox(Game.feeling(pet), "", "heroPet")}
          <div class="float-card f1">Серия ответов<b id="fcStreak">${pet.streak}</b></div>
          <div class="float-card f2">Уровень <b id="fcLevel">${Game.level(pet)}</b>
            <span class="mini-xp"><span id="fcXp" style="width:${(Game.xpInLevel(pet) / Game.XP_PER_LEVEL) * 100}%"></span></span>
            <span class="muted" id="fcXpText">${Game.xpInLevel(pet)} / ${Game.XP_PER_LEVEL} XP</span></div>
        </div>
        <span class="dot" style="width:18px;height:18px;left:46%;top:12%"></span>
        <span class="dot" style="width:10px;height:10px;left:8%;bottom:14%;animation-delay:-2s"></span>
        <span class="dot" style="width:26px;height:26px;right:6%;top:46%;animation-delay:-4s;opacity:.9"></span>
      </section>

      <section class="section">
        <div class="section-head reveal">
          <h2 style="--i:0">Самочувствие</h2>
          <p style="--i:1">Шкалы меняются, даже когда сайт закрыт: каждые 2 часа питомец немного голодает и скучает.</p>
        </div>
        <div class="stats3 reveal" id="statCards">${statCards()}</div>
      </section>

      <section class="section">
        <div class="section-head reveal">
          <h2 style="--i:0">Чем займёмся?</h2>
          <p style="--i:1">Учёба кормит питомца, перерыв поднимает настроение, а сон возвращает силы.</p>
        </div>
        <div class="actions3 reveal">
          <article class="card action-card">
            <div class="art">${petBox("read")}</div>
            <div class="body">
              <h3>Учёба</h3>
              <p class="muted">Английский от A1 до C1, Python, математика, общие знания — или свои вопросы.</p>
              <div class="chips"><span class="chip">+3 сытости</span><span class="chip">+10…30 XP</span></div>
              <a class="btn" href="#/learn"><span class="lbl-long">К вопросам</span><span class="lbl-short">Учиться</span> <span class="arr">${I.arrow}</span></a>
            </div>
          </article>
          <article class="card action-card">
            <div class="art">${petBox("play", "", "playPet")}</div>
            <div class="body">
              <h3>Перерыв</h3>
              <p class="muted">Немного музыки и отдыха от учёбы. Настроение растёт, но тратится энергия.</p>
              <div class="chips"><span class="chip">+3 настроения</span><span class="chip">−2 энергии</span></div>
              <button class="btn btn-sun" id="actPlay"><span class="lbl-long">Сделать перерыв</span><span class="lbl-short">Играть</span></button>
            </div>
          </article>
          <article class="card action-card">
            <div class="art">${petBox("sleep", "", "sleepPet")}</div>
            <div class="body">
              <h3>Отдых</h3>
              <p class="muted">Подушка, колпак и крепкий сон. Энергия восстанавливается быстрее всего.</p>
              <div class="chips"><span class="chip">+4 энергии</span></div>
              <button class="btn" id="actSleep"><span class="lbl-long">Уложить спать</span><span class="lbl-short">Спать</span></button>
            </div>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="numbers reveal" id="numbers">${numbers()}</div>
      </section>

      <section class="section reveal" id="calendar">${activityCalendar()}</section>

      <section class="section">
        <div class="card save-card">
          <div>
            <h3>Сохранение</h3>
            <p>Прогресс хранится в браузере в формате <code>JSON</code>. Его можно скачать файлом
              и потом загрузить обратно — например, на другом компьютере.</p>
          </div>
          <div class="row">
            <button class="btn btn-white btn-sm" id="exp">${I.down} Скачать .json</button>
            <button class="btn btn-white btn-sm" id="imp">${I.up} Загрузить</button>
            <a class="btn btn-ghost btn-sm" href="#/new">Новый питомец</a>
            <input type="file" id="impFile" accept=".json,application/json" hidden>
          </div>
        </div>
      </section>`;

    countUp($$("#numbers b"));
    bindCalendar();

    const refresh = () => {
      $("#statCards").innerHTML = statCards();
      $("#numbers").innerHTML = numbers();
      $("#fcStreak").textContent = pet.streak;
      $("#fcLevel").textContent = Game.level(pet);
      $("#fcXp").style.width = (Game.xpInLevel(pet) / Game.XP_PER_LEVEL) * 100 + "%";
      $("#fcXpText").textContent = `${Game.xpInLevel(pet)} / ${Game.XP_PER_LEVEL} XP`;
      $("#heroPet").dataset.base = Game.feeling(pet);
      updateHeader("home");
    };
    const say = (text) => {
      const m = $("#mood");
      m.textContent = text;
      m.classList.remove("in"); void m.offsetWidth; m.classList.add("in");
    };

    $("#actPlay").onclick = () => {
      const r = Game.play(pet);
      if (!r.ok) { setPose($("#heroPet"), "sad", 2500); bump($("#heroPet"), "shake"); say(r.text); toast(r.text, "!"); return; }
      setPose($("#heroPet"), "play", 4500);
      $("#heroPet").scrollIntoView({ behavior: "smooth", block: "center" });
      say("Ля-ля-ля! Обожаю перерывы под музыку.");
      toast(r.text, "♪");
      refresh();
    };
    $("#actSleep").onclick = () => {
      const r = Game.sleep(pet);
      if (!r.ok) { say(r.text); toast(r.text, "!"); return; }
      setPose($("#heroPet"), "sleep", 5000);
      $("#heroPet").scrollIntoView({ behavior: "smooth", block: "center" });
      say("Zzz… ещё пять минуточек…");
      toast(r.text, "☾");
      refresh();
    };
    $("#heroPet").onclick = () => {
      setPose($("#heroPet"), "happy", 2200);
      bump($("#heroPet"), "jump");
      say(Game.mood(pet));
    };

    $("#exp").onclick = () => {
      const blob = new Blob([Game.exportSave()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "bilim-buddy-save.json";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Файл сохранения скачан");
    };
    $("#imp").onclick = () => $("#impFile").click();
    $("#impFile").onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      file.text().then((text) => {
        try {
          Game.importSave(text);
          pet = Game.loadPet();
          toast(`Загружено: ${esc(pet.name)}`);
          render();
        } catch (err) {
          toast("Не получилось прочитать файл", "!");
        }
      });
    };
  }

  function countUp(els) {
    els.forEach((el) => {
      const to = +el.dataset.count;
      if (!to) return;
      const t0 = performance.now(), dur = 900;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // ============================================================
  //  Учёба: выбор темы и уровня
  // ============================================================
  function learnPage() {
    const questions = Game.loadQuestions();
    const topics = Game.allTopics(questions);
    if (!topics.includes(learn.topic)) learn.topic = topics[0];
    const levels = Game.levelsFor(learn.topic, questions).concat(Game.ALL);
    if (!levels.includes(learn.level)) learn.level = levels[0];

    view.innerHTML = `
      <section class="page-head reveal">
        <div>
          <span class="eyebrow" style="--i:0">Учёба</span>
          <h1 style="--i:1">Что учим сегодня?</h1>
          <p style="--i:2">За каждый верный ответ ${esc(pet.name)} получает еду и опыт. Чем сложнее уровень, тем больше опыта.</p>
        </div>
        ${petBox("read")}
      </section>

      <div class="step"><span class="step-n">01</span><h3>Тема</h3></div>
      <div class="topic-grid reveal">
        ${topics.map((t, i) => {
          const meta = Game.TOPIC_META[t] || { code: t.slice(0, 2).toUpperCase(), about: "Твоя тема" };
          const cnt = Game.countFor(t, questions);
          const pr = t === Game.MISTAKES ? null : Game.sectionProgress(pet, t, Game.ALL, questions);
          return `<button class="topic ${t === learn.topic ? "sel" : ""} ${t === Game.MISTAKES ? "mist" : ""}" data-topic="${esc(t)}" style="--i:${i}">
            <span class="chip t-count">${pr ? `${pr.solved}/${pr.total}` : `${cnt} ${plural(cnt, "вопрос", "вопроса", "вопросов")}`}</span>
            ${pr ? `<span class="t-bar"><span style="width:${pr.total ? (pr.solved / pr.total) * 100 : 0}%"></span></span>` : ""}
            <span class="code">${esc(meta.code)}</span>
            <span class="t-name">${esc(t)}</span>
            <span class="t-about">${esc(meta.about)}</span>
          </button>`;
        }).join("")}
      </div>

      <div class="step"><span class="step-n">02</span><h3>Уровень</h3></div>
      <div class="pills" id="levels">
        ${levels.map((l) => {
          const pr = learn.topic === Game.MISTAKES ? null : Game.sectionProgress(pet, learn.topic, l, questions);
          const tag = !pr ? (l === Game.TRAINER ? "∞" : "") : pr.done ? "✓" : `${pr.solved}/${pr.total}`;
          return `<button class="pill ${l === learn.level ? "sel" : ""} ${pr && pr.done ? "done" : ""}" data-level="${esc(l)}">${esc(l)}${tag ? ` <span class="pill-tag">${tag}</span>` : ""}</button>`;
        }).join("")}
      </div>
      <div class="hint" style="margin-top:12px">Опыт дают только за новые вопросы. Когда секция решена полностью, вопросы можно повторять, но уровень питомца от этого не растёт.
        ${learn.topic === "Математика" ? "«Тренажёр» — бесконечные примеры на счёт, за каждый +3 XP." : ""}
      </div>

      <div class="learn-go">
        <button class="btn btn-sun" id="go" style="padding:18px 34px;font-size:18px">Начать <span class="arr">${I.arrow}</span></button>
        <span class="muted">${esc(learn.topic)} · ${esc(learn.level)}</span>
        <a class="btn btn-ghost btn-sm" href="#/my">${I.plus} Мои вопросы</a>
      </div>`;

    $$(".topic").forEach((b) => b.onclick = () => { learn.topic = b.dataset.topic; learnPage(); });
    $$(".pill").forEach((b) => b.onclick = () => { learn.level = b.dataset.level; learnPage(); });
    $("#go").onclick = () => {
      pet.topic = learn.topic; pet.level = learn.level; Game.savePet(pet);
      quiz = null;
      go("#/quiz");
    };
  }

  // ============================================================
  //  Вопрос
  // ============================================================
  function quizPage() {
    if (!quiz) quiz = { recent: [], n: 0, right: 0, q: null, answered: false };
    view.innerHTML = `
      <section class="quiz">
        <div class="quiz-card">
          <div class="quiz-top">
            <span class="chip plum">${esc(learn.topic)}</span><span class="chip">${esc(learn.level)}</span>
            <span class="chip" id="secProg"></span>
            <span class="sp"></span>
            <a class="btn btn-ghost btn-sm" href="#/learn">Сменить тему</a>
          </div>
          <div class="progress-line" title="Опыт до следующего уровня"><span id="xpLine"></span></div>
          <div id="qBody"></div>
        </div>
        <aside class="quiz-side">
          <div class="side-pet">
            ${petBox("read", "", "quizPet")}
            <div class="bubble" id="quizSay">Я готов! Читаю вопрос вместе с тобой.</div>
          </div>
          <div class="side-score">
            <div><b id="sRight">0</b><span>верно</span></div>
            <div><b id="sStreak">${pet.streak}</b><span>серия</span></div>
            <div><b id="sFood">${pet.food}</b><span>сытость</span></div>
          </div>
        </aside>
      </section>`;
    nextQuestion();

    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (quiz.answered && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); nextQuestion(); return; }
      const idx = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3, ф: 0, и: 1, с: 2, в: 3 }[e.key.toLowerCase()];
      const btn = $$(".opt")[idx];
      if (btn && !quiz.answered) btn.click();
    };
    document.addEventListener("keydown", onKey);
    cleanup.push(() => document.removeEventListener("keydown", onKey));
  }

  function nextQuestion() {
    const questions = Game.loadQuestions();
    const q = Game.randomQuestion(questions, learn.topic, learn.level, quiz.recent, pet);
    drawSectionProgress(questions);
    quiz.q = q;
    quiz.answered = false;
    $("#xpLine").style.width = (Game.xpInLevel(pet) / Game.XP_PER_LEVEL) * 100 + "%";
    const body = $("#qBody");
    if (!q) {
      if (learn.topic === Game.MISTAKES) {
        body.innerHTML = `<div class="empty">${petBox("proud")}<b>Все ошибки исправлены!</b><br>Выбери новую тему в разделе
          <a href="#/learn" style="color:var(--violet);font-weight:600">«Учёба»</a>.</div>`;
        setPose($("#quizPet"), "proud");
        return;
      }
      body.innerHTML = `<div class="empty">Здесь пока нет вопросов. Добавь свои в разделе
        <a href="#/my" style="color:var(--violet);font-weight:600">«Мои вопросы»</a> или выбери другую тему.</div>`;
      return;
    }
    quiz.n += 1;
    quiz.recent = quiz.recent.concat(q.question).slice(-12);
    setPose($("#quizPet"), "read");
    body.innerHTML = `
      <div class="q-in">
        <div class="q-num">Вопрос ${quiz.n}${q.topic !== Game.MISTAKES && !q.generated && Game.sectionProgress(pet, learn.topic, learn.level, questions)?.done ? " · повторение, без опыта" : ""}</div>
        <h2 class="q-text">${esc(q.question)}</h2>
        ${q.figure ? `<div class="q-fig">${q.figure}</div>` : ""}
      </div>
      ${q.options
        ? `<div class="opts">${q.options.map((o, i) => `<button class="opt" style="--i:${i}" data-v="${esc(o)}"><span class="l">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>
           <div class="kbd">Можно отвечать клавишами <kbd>1</kbd>–<kbd>4</kbd>, дальше — <kbd>Enter</kbd></div>`
        : `<form class="typed" id="typed"><input class="input" id="typedIn" placeholder="Напиши ответ…" autocomplete="off">
             <button class="btn">Проверить</button></form>
           <div class="kbd">Регистр и точка в конце не важны</div>`}
      <div class="feedback" id="fb"></div>`;

    if (q.options) {
      $$(".opt").forEach((b) => b.onclick = () => {
        if (quiz.answered) return;
        const ok = b.dataset.v === q.answer;
        $$(".opt").forEach((x) => {
          x.disabled = true;
          if (x.dataset.v === q.answer) x.classList.add("right");
          else if (x !== b) x.classList.add("dim");
        });
        if (!ok) b.classList.add("wrong");
        onAnswer(ok);
      });
    } else {
      const inp = $("#typedIn");
      inp.focus();
      $("#typed").onsubmit = (e) => {
        e.preventDefault();
        if (quiz.answered) { nextQuestion(); return; }
        if (!inp.value.trim()) { bump(inp, "wrong"); return; }
        const ok = Game.checkTyped(q, inp.value);
        inp.classList.add(ok ? "right" : "wrong");
        inp.readOnly = true;
        onAnswer(ok);
      };
    }
  }

  function onAnswer(ok) {
    quiz.answered = true;
    const q = quiz.q;
    if (ok) Game.removeMistake(q); else Game.addMistake(q);   // неверные ответы попадут в «Работу над ошибками»
    const lvl = q.fromLevel || (learn.level === Game.ALL ? q.level : learn.level);
    const res = Game.answer(pet, ok, Game.difficulty(q.from || learn.topic, lvl), q);
    const box = $("#quizPet");
    const say = $("#quizSay");
    if (ok) {
      quiz.right += 1;
      setPose(box, res.levelUp ? "proud" : "eat", res.levelUp ? 3500 : 2600);
      bump(box, "jump");
      const pop = document.createElement("div");
      pop.className = "xp-pop";
      pop.textContent = res.repeat ? "повтор" : `+${res.gained} XP`;
      $(".side-pet").append(pop);
      setTimeout(() => pop.remove(), 1500);
      say.textContent = res.repeat ? "Это мы уже знаем — хорошо закрепили!" : res.bonus ? `Серия ${pet.streak}! Бонус +10 XP` : ["Ням! Вкусный ответ.", "Верно! Ещё такой же?", "Отлично, я сыт и доволен."][quiz.n % 3];
    } else {
      setPose(box, "sad", 2600);
      bump(box, "shake");
      say.textContent = "Ничего, в следующий раз получится.";
    }
    if (res.levelUp) {
      confetti();
      toast(`Новый уровень ${Game.level(pet)}: ${Game.stage(pet)}!`, "★");
    }
    $("#sRight").textContent = `${quiz.right}/${quiz.n}`;
    $("#sStreak").textContent = pet.streak;
    $("#sFood").textContent = pet.food;
    $("#xpLine").style.width = (Game.xpInLevel(pet) / Game.XP_PER_LEVEL) * 100 + "%";
    updateHeader("learn");

    $("#fb").innerHTML = `<div class="fb ${ok ? "good" : "bad"}">
        <span class="ic">${ok ? "✓" : "✕"}</span>
        <span class="sp">${ok
          ? res.repeat ? `<b>Верно.</b> Этот вопрос уже решён раньше — опыт не начисляется, сытость +1`
            : q.generated ? `<b>Верно.</b> +3 XP за пример из тренажёра`
            : `<b>Верно.</b> +${res.gained} XP, сытость +3`
          : `<b>Неверно.</b> Правильный ответ: <b>${esc(q.answer)}</b>`}</span>
        ${ok ? "" : `<button class="btn btn-ghost btn-sm" id="askT">Спросить учителя</button>`}
        <button class="btn btn-sm ${ok ? "" : "btn-white"}" id="nextQ">Дальше <span class="arr">${I.arrow}</span></button>
      </div>`;
    $("#nextQ").onclick = nextQuestion;
    $("#nextQ").focus({ preventScroll: true });
    const askBtn = $("#askT");
    if (askBtn) askBtn.onclick = () => askTutor(`Объясни, пожалуйста, вопрос: «${q.question}». Правильный ответ — «${q.answer}». Почему именно так? Как это запомнить?`);
    drawSectionProgress(Game.loadQuestions());
    if (res.sectionDone) sectionComplete(q);
  }

  /** Счётчик «решено 12/25» в шапке вопроса. */
  function drawSectionProgress(questions) {
    const el = $("#secProg");
    if (!el) return;
    const pr = learn.topic === Game.MISTAKES ? null : Game.sectionProgress(pet, learn.topic, learn.level, questions);
    el.style.display = pr ? "" : "none";
    if (pr) el.textContent = pr.done ? "секция решена ✓" : `решено ${pr.solved}/${pr.total}`;
  }

  /** Секция решена целиком: поздравляем и предлагаем следующий уровень. */
  function sectionComplete(q) {
    const topic = q.from || q.topic, lvl = q.fromLevel || q.level;
    const levels = Game.TOPICS[topic] || [];
    const next = levels[levels.indexOf(lvl) + 1];
    confetti();
    setPose($("#quizPet"), "proud", 3500);
    toast(`Секция «${esc(topic)} · ${esc(lvl)}» решена полностью!`, "★");
    const box = document.createElement("div");
    box.className = "fb good section-done";
    box.innerHTML = `<span class="ic">★</span><span class="sp"><b>Секция пройдена!</b> Все вопросы «${esc(topic)} · ${esc(lvl)}» решены.
        ${next && next !== Game.TRAINER ? `Пора на следующий уровень: <b>${esc(next)}</b>.` : "Это был самый сложный уровень — ты молодец!"}</span>
      ${next && next !== Game.TRAINER ? `<button class="btn btn-sun btn-sm" id="nextLevel">Уровень ${esc(next)} <span class="arr">${I.arrow}</span></button>` : ""}`;
    $("#fb").append(box);
    const nl = $("#nextLevel");
    if (nl) nl.onclick = () => {
      learn = { topic, level: next };
      pet.topic = topic; pet.level = next; Game.savePet(pet);
      quiz = null;
      quizPage();
    };
  }

  // ============================================================
  //  Фокус-таймер
  // ============================================================
  const R = 180, C = 2 * Math.PI * R;

  function focusPage() {
    const st = Timer.state();
    const today = Game.dayStats();
    view.innerHTML = `
      <section class="focus">
        <div class="focus-panel ${st.mode === "focus" ? "" : "break"}" id="fPanel">
          <div class="modes" id="modes">
            ${Object.entries(Timer.MODES).map(([k, m]) => `<button data-mode="${k}" class="${k === st.mode ? "sel" : ""}">${m.label}</button>`).join("")}
          </div>
          <div class="ring-wrap">
            <svg class="ring" viewBox="0 0 400 400">
              <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#FFC7E3"/><stop offset="1" stop-color="#9FE6FF"/>
              </linearGradient></defs>
              <circle class="ticks" cx="200" cy="200" r="196"/>
              <circle class="track" cx="200" cy="200" r="${R}"/>
              <circle class="bar" id="ringBar" cx="200" cy="200" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="0"/>
            </svg>
            <div class="ring-in">
              <div class="time-label" id="tLabel"></div>
              <div class="time" id="tTime">00:00</div>
              <div class="time-label" id="tRound"></div>
            </div>
          </div>
          <div class="controls">
            <button class="round-btn" id="tReset" title="Сбросить">${I.reset}</button>
            <button class="btn btn-sun" id="tMain"></button>
            <button class="round-btn" id="tSkip" title="Пропустить">${I.skip}</button>
          </div>
          <div class="presets" id="presets"></div>
          <input class="task-input" id="tTask" maxlength="80" placeholder="Над чем работаешь? Например: глава 3 по физике" value="${esc(st.task)}">
        </div>

        <aside class="focus-side">
          <div class="card white focus-pet">
            ${petBox("idle", "", "focusPet")}
            <div class="bubble" id="focusSay"></div>
          </div>
          <div class="today">
            <div><b id="dSessions">${today.sessions}</b><span>сессий сегодня</span></div>
            <div><b id="dMinutes">${today.minutes}</b><span>минут фокуса</span></div>
            <div><b id="dDistr">${today.distractions}</b><span>отвлечений</span></div>
          </div>
          <div class="card rules">
            <b>Как это работает</b>
            <ol>
              <li><b>Выбери время</b> и нажми «Старт». Питомец сядет за ноутбук вместе с тобой.</li>
              <li><b>Не уходи со вкладки.</b> Если переключишься на другую, питомец заметит и загрустит.</li>
              <li><b>За каждую сессию</b> — опыт: 25 минут дают +20 XP. После четырёх сессий — длинный перерыв.</li>
            </ol>
          </div>
          <div class="card white" style="display:grid;gap:14px">
            <label class="toggle">Звук в конце <input type="checkbox" id="tSound" ${st.sound ? "checked" : ""}><span class="sw"></span></label>
            <label class="toggle">Режим «без отвлечений» <input type="checkbox" id="tZen" ${document.body.classList.contains("zen") ? "checked" : ""}><span class="sw"></span></label>
          </div>
        </aside>
      </section>`;

    $$("#modes button").forEach((b) => b.onclick = () => {
      if (Timer.state().running && !confirm("Таймер идёт. Переключить режим и сбросить время?")) return;
      Timer.setMode(b.dataset.mode);
      focusPage();
    });
    $("#tMain").onclick = () => (Timer.state().running ? Timer.pause() : Timer.start());
    $("#tReset").onclick = () => Timer.reset();
    $("#tSkip").onclick = () => Timer.skip();
    $("#tTask").oninput = (e) => Timer.setTask(e.target.value);
    $("#tSound").onchange = (e) => Timer.setSound(e.target.checked);
    $("#tZen").onchange = (e) => {
      document.body.classList.toggle("zen", e.target.checked);
      if (e.target.checked && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
      if (!e.target.checked && document.fullscreenElement) document.exitFullscreen();
    };
    drawPresets();
    drawFocus(true);
    cleanup.push(() => {
      document.body.classList.remove("zen");
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    });
  }

  function drawPresets() {
    const st = Timer.state();
    $("#presets").innerHTML = Timer.MODES[st.mode].presets
      .map((m) => `<button data-min="${m}" class="${st.minutes[st.mode] === m ? "sel" : ""}" ${st.running ? "disabled" : ""}>${m} мин</button>`).join("");
    $$("#presets button").forEach((b) => b.onclick = () => { Timer.setMinutes(+b.dataset.min); drawPresets(); });
  }

  let lastFocusPose = "";
  let distracted = false;
  function focusPose() {
    const st = Timer.state();
    if (distracted) return "sad";
    if (!st.running) return st.mode === "focus" ? "idle" : "sleep";
    return st.mode === "focus" ? "focus" : "boba";
  }
  function focusText() {
    const st = Timer.state();
    if (distracted) return "Эй, ты отвлекаешься! Возвращаемся к задаче.";
    if (!st.running && st.left === Timer.total()) {
      return st.mode === "focus" ? "Готов поработать вместе? Жми «Старт»." : "Сессия закончена! Время отдохнуть.";
    }
    if (!st.running) return "Пауза. Я подожду тебя.";
    if (st.mode === "focus") return st.task ? `Работаем: «${esc(st.task)}». Я рядом.` : "Тсс… мы сосредоточены.";
    return "Перерыв! Попей воды и разомнись.";
  }

  function drawFocus(force) {
    const time = $("#tTime");
    if (!time) return;
    const st = Timer.state();
    const left = Timer.remaining(), total = Timer.total();
    time.textContent = Timer.fmt(left);
    $("#ringBar").style.strokeDashoffset = C * (1 - left / total);
    $("#tLabel").textContent = Timer.MODES[st.mode].label;
    $("#tRound").textContent = st.mode === "focus" ? `сессия ${(st.done % 4) + 1} из 4` : "отдых";
    $("#tMain").innerHTML = st.running ? `${I.pause} Пауза` : `${I.play} ${st.left < total ? "Продолжить" : "Старт"}`;
    $("#fPanel").classList.toggle("break", st.mode !== "focus");
    const pose = focusPose();
    if (force || pose !== lastFocusPose) {
      lastFocusPose = pose;
      setPose($("#focusPet"), pose);
      $("#focusSay").innerHTML = focusText();
    }
  }

  function updateTimerChip() {
    const st = Timer.state();
    const chip = $("#timerChip");
    const on = st.running || st.left < Timer.total();
    chip.classList.toggle("on", on && !!pet);
    chip.querySelector("span").textContent = Timer.fmt(Timer.remaining());
    document.title = st.running ? `${Timer.fmt(Timer.remaining())} · ${Timer.MODES[st.mode].label} — Bilim Buddy` : "Bilim Buddy — учись вместе с питомцем";
  }

  Timer.on((type, data) => {
    updateTimerChip();
    if (type === "tick") { drawFocus(false); return; }
    if (type === "complete" && pet) {
      Timer.chime();
      if (data.mode === "focus" && !data.skipped) {
        const r = Game.focusDone(pet, data.minutes);
        confetti();
        toast(`Сессия фокуса завершена! +${r.gained} XP`, "★");
        if (r.levelUp) toast(`Новый уровень ${Game.level(pet)}!`, "★");
        updateHeader(currentRoute());
      } else if (data.mode !== "focus" && !data.skipped) {
        Game.breakDone(pet);
        toast("Перерыв окончен. Настроение и энергия +2", "☕");
      }
      const t = Game.dayStats();
      if ($("#dSessions")) {
        $("#dSessions").textContent = t.sessions;
        $("#dMinutes").textContent = t.minutes;
      }
    }
    if ($("#tTime")) {
      if (type === "mode" || type === "complete") { focusPage(); return; }
      drawPresets();
      drawFocus(true);
    }
  });

  // если во время фокуса уйти со вкладки — это отвлечение
  document.addEventListener("visibilitychange", () => {
    const st = Timer.state();
    if (!pet || !st.running || st.mode !== "focus") return;
    if (document.hidden) {
      Game.addDistraction();
      distracted = true;
    } else if (distracted) {
      toast(`${esc(pet.name)} заметил отвлечение. Возвращаемся!`, "!");
      if ($("#dDistr")) $("#dDistr").textContent = Game.dayStats().distractions;
      drawFocus(true);
      setTimeout(() => { distracted = false; drawFocus(true); }, 3500);
    }
  });
  window.addEventListener("beforeunload", (e) => {
    const st = Timer.state();
    if (st.running && st.mode === "focus") { e.preventDefault(); e.returnValue = ""; }
  });

  // ============================================================
  //  Мои вопросы
  // ============================================================
  function myPage() {
    const mine = Game.loadMyQuestions();
    const topics = Game.allTopics(Game.loadQuestions());
    view.innerHTML = `
      <section class="page-head reveal">
        <div>
          <span class="eyebrow" style="--i:0">Мои вопросы</span>
          <h1 style="--i:1">Свой предмет</h1>
          <p style="--i:2">Добавь вопросы по любой теме — истории, биологии, словам к экзамену. Они появятся в «Учёбе» с уровнем «Мои».</p>
        </div>
        ${petBox("focus")}
      </section>

      <section class="my-grid" style="margin-top:28px">
        <form class="card my-form" id="myForm" autocomplete="off">
          <h3>Новый вопрос</h3>
          <div class="field"><label for="fTopic">Тема</label>
            <input class="input" id="fTopic" list="topicList" placeholder="Например: История" required value="${esc(localStorage.getItem("petTeacher.lastTopic") || "")}">
            <datalist id="topicList">${topics.map((t) => `<option value="${esc(t)}">`).join("")}</datalist></div>
          <div class="field"><label for="fQ">Вопрос</label>
            <textarea class="input" id="fQ" placeholder="В каком году началась Вторая мировая война?" required></textarea></div>
          <div class="field"><label for="fA">Правильный ответ</label>
            <input class="input" id="fA" placeholder="1939" required></div>
          <div class="field"><label>Неверные варианты <span style="font-weight:400">(можно не заполнять)</span></label>
            <div class="wrong3">
              <input class="input fW" placeholder="Вариант 1"><input class="input fW" placeholder="Вариант 2"><input class="input fW" placeholder="Вариант 3">
            </div>
            <span class="hint">Есть варианты — будет выбор из кнопок. Нет — ответ нужно будет напечатать.</span></div>
          <button class="btn">${I.plus} Сохранить вопрос</button>
        </form>

        <div>
          <div class="list-head">
            <h3>Сохранено: ${mine.length}</h3>
            ${mine.length ? `<button class="btn btn-sun btn-sm" id="learnMine">Учить мои вопросы <span class="arr">${I.arrow}</span></button>` : ""}
          </div>
          <div class="q-list">
            ${mine.length ? mine.slice().reverse().map((q, i) => `
              <div class="q-item" style="--i:${i}" data-id="${esc(q.id)}">
                <span class="n">${String(mine.length - i).padStart(2, "0")}</span>
                <div>
                  <div class="qq">${esc(q.question)}</div>
                  <div class="meta">
                    <span class="chip plum">${esc(q.topic)}</span>
                    <span class="chip good">✓ ${esc(q.answer)}</span>
                    ${q.wrong.map((w) => `<span class="chip">${esc(w)}</span>`).join("")}
                    ${q.wrong.length ? "" : '<span class="chip">ввод с клавиатуры</span>'}
                  </div>
                </div>
                <button class="del" title="Удалить">${I.trash}</button>
              </div>`).join("")
            : `<div class="empty">${petBox("idle")}Пока пусто. Напиши первый вопрос слева.</div>`}
          </div>
        </div>
      </section>`;

    $("#myForm").onsubmit = (e) => {
      e.preventDefault();
      const topic = $("#fTopic").value.trim(), q = $("#fQ").value.trim(), a = $("#fA").value.trim();
      if (!topic || !q || !a) return;
      Game.addMyQuestion(topic, q, a, $$(".fW").map((x) => x.value));
      localStorage.setItem("petTeacher.lastTopic", topic);
      toast("Вопрос сохранён");
      myPage();
      $("#fQ").focus();
    };
    $$(".q-item .del").forEach((b) => b.onclick = () => {
      const item = b.closest(".q-item");
      item.classList.add("out");
      setTimeout(() => { Game.deleteMyQuestion(item.dataset.id); myPage(); }, 330);
    });
    const lm = $("#learnMine");
    if (lm) lm.onclick = () => {
      learn = { topic: mine[mine.length - 1].topic, level: Game.MY_LEVEL };
      quiz = null;
      go("#/quiz");
    };
  }

  // ============================================================
  //  Карточки (интервальное повторение)
  // ============================================================
  let review = null;          // текущая сессия повторения: {deck, queue, done, good}
  let openDeck = null;        // какая колода раскрыта в списке

  function cardsPage() {
    const cards = Cards.load();
    const decks = Cards.decks(cards);
    const dueAll = Cards.due(null, cards).length;
    const starters = Object.keys(Cards.STARTER).filter((d) => !decks.includes(d));

    view.innerHTML = `
      <section class="page-head reveal">
        <div>
          <span class="eyebrow" style="--i:0">Карточки</span>
          <h1 style="--i:1">Запоминай надолго</h1>
          <p style="--i:2">Каждая карточка возвращается ровно тогда, когда начинает забываться.
            ${dueAll ? `Сегодня к повторению: <b>${dueAll}</b>.` : cards.length ? "На сегодня всё повторено!" : "Создай первую карточку или возьми готовую колоду."}</p>
          ${dueAll ? `<button class="btn btn-white" id="revAll" style="margin-top:22px;--i:3">Повторить всё · ${dueAll} <span class="arr">${I.arrow}</span></button>` : ""}
        </div>
        ${petBox(dueAll ? "read" : "happy")}
      </section>

      <section class="my-grid" style="margin-top:28px">
        <form class="card my-form" id="cardForm" autocomplete="off">
          <h3>Новая карточка</h3>
          <div class="field"><label for="cDeck">Колода</label>
            <input class="input" id="cDeck" list="deckList" placeholder="Например: Английские слова" required value="${esc(localStorage.getItem("petTeacher.lastDeck") || "")}">
            <datalist id="deckList">${decks.map((d) => `<option value="${esc(d)}">`).join("")}</datalist></div>
          <div class="field"><label for="cFront">Лицевая сторона — вопрос или слово</label>
            <textarea class="input" id="cFront" placeholder="photosynthesis" required></textarea></div>
          <div class="field"><label for="cBack">Обратная сторона — ответ</label>
            <textarea class="input" id="cBack" placeholder="фотосинтез — образование веществ на свету" required></textarea></div>
          <button class="btn">${I.plus} Добавить карточку</button>
          <span class="hint">Одна карточка — один факт. Короткие карточки запоминаются лучше длинных.</span>
        </form>

        <div>
          <div class="list-head"><h3>Колоды</h3><span class="muted">${cards.length} ${plural(cards.length, "карточка", "карточки", "карточек")}</span></div>
          <div class="deck-list">
            ${decks.length ? decks.map((d, i) => deckCard(d, cards, i)).join("") : `<div class="empty">${petBox("idle")}Пока нет ни одной карточки.</div>`}
          </div>
          ${starters.length ? `
            <div class="starter">
              <b>Готовые колоды</b>
              <div class="row">${starters.map((d) => `<button class="btn btn-ghost btn-sm" data-starter="${esc(d)}">${I.plus} ${esc(d)} · ${Cards.STARTER[d].length}</button>`).join("")}</div>
            </div>` : ""}
        </div>
      </section>`;

    $("#cardForm").onsubmit = (e) => {
      e.preventDefault();
      const deck = $("#cDeck").value.trim(), front = $("#cFront").value.trim(), back = $("#cBack").value.trim();
      if (!deck || !front || !back) return;
      Cards.add(deck, front, back);
      localStorage.setItem("petTeacher.lastDeck", deck);
      openDeck = deck;
      toast("Карточка добавлена");
      cardsPage();
      updateHeader("cards");
      $("#cFront").focus();
    };
    const ra = $("#revAll");
    if (ra) ra.onclick = () => startReview(null);
    $$("[data-review]").forEach((b) => b.onclick = () => startReview(b.dataset.review));
    $$("[data-open]").forEach((b) => b.onclick = () => { openDeck = openDeck === b.dataset.open ? null : b.dataset.open; cardsPage(); });
    $$("[data-starter]").forEach((b) => b.onclick = () => {
      Cards.addStarter(b.dataset.starter);
      toast(`Колода «${esc(b.dataset.starter)}» добавлена`);
      cardsPage();
      updateHeader("cards");
    });
    $$("[data-del]").forEach((b) => b.onclick = () => {
      Cards.remove(b.dataset.del);
      cardsPage();
      updateHeader("cards");
    });
  }

  function deckCard(d, cards, i) {
    const list = cards.filter((c) => c.deck === d);
    const due = list.filter((c) => c.due <= Date.now()).length;
    const learned = list.filter((c) => c.interval >= 21).length;   // 3+ недели — считаем выученной
    const studied = list.filter((c) => c.reps > 0).length;
    const open = openDeck === d;
    return `<div class="card deck" style="--i:${i}">
      <div class="deck-top">
        <div>
          <h4>${esc(d)}</h4>
          <div class="meta">
            ${due ? `<span class="chip grad">к повторению: ${due}</span>` : `<span class="chip good">на сегодня всё</span>`}
            <span class="chip">всего ${list.length}</span>
            <span class="chip">изучаются ${studied}</span>
            <span class="chip">выучено ${learned}</span>
          </div>
        </div>
        <div class="row">
          <button class="btn btn-sm ${due ? "btn-sun" : "btn-ghost"}" data-review="${esc(d)}" ${due ? "" : "disabled"}>Повторить</button>
          <button class="btn btn-ghost btn-sm" data-open="${esc(d)}">${open ? "Скрыть" : "Карточки"}</button>
        </div>
      </div>
      <div class="deck-bar" title="Выучено"><span style="width:${list.length ? (learned / list.length) * 100 : 0}%"></span><span class="b2" style="width:${list.length ? ((studied - learned) / list.length) * 100 : 0}%"></span></div>
      ${open ? `<div class="deck-cards">${list.map((c) => `
        <div class="dc"><span class="f">${esc(c.front)}</span><span class="b">${esc(c.back)}</span>
          <span class="w">${Cards.whenText(c)}</span><button class="del" data-del="${esc(c.id)}" title="Удалить">${I.trash}</button></div>`).join("")}</div>` : ""}
    </div>`;
  }

  function startReview(deck) {
    const ids = Cards.due(deck).map((c) => c.id).sort(() => Math.random() - 0.5);
    if (!ids.length) return;
    review = { deck, queue: ids, total: ids.length, done: 0, good: 0 };
    location.hash = "#/review";
  }

  // ---------- сессия повторения ----------
  function reviewPage() {
    if (!review) { location.hash = "#/cards"; return; }
    view.innerHTML = `
      <section class="quiz">
        <div class="quiz-card">
          <div class="quiz-top">
            <span class="chip plum">${esc(review.deck || "Все колоды")}</span>
            <span class="chip" id="rLeft"></span>
            <span class="sp"></span>
            <a class="btn btn-ghost btn-sm" href="#/cards">Закончить</a>
          </div>
          <div class="progress-line"><span id="rLine"></span></div>
          <div id="rBody"></div>
        </div>
        <aside class="quiz-side">
          <div class="side-pet">
            ${petBox("read", "", "cardPet")}
            <div class="bubble" id="cardSay">Вспоминай ответ, а потом переверни карточку.</div>
          </div>
          <div class="side-score">
            <div><b id="rDone">0</b><span>повторено</span></div>
            <div><b id="rGood">0</b><span>вспомнила</span></div>
            <div><b id="rFood">${pet.food}</b><span>сытость</span></div>
          </div>
        </aside>
      </section>`;
    showCard();
    const onKey = (e) => {
      if (!review || !$("#rBody")) return;
      if ((e.key === " " || e.key === "Enter") && $("#flash") && !$("#flash").classList.contains("flipped")) { e.preventDefault(); flip(); return; }
      const g = { "1": 0, "2": 1, "3": 2, "4": 3 }[e.key];
      const b = g !== undefined && $$(".rate button")[g];
      if (b && $("#flash").classList.contains("flipped")) b.click();
    };
    document.addEventListener("keydown", onKey);
    cleanup.push(() => document.removeEventListener("keydown", onKey));
  }

  const GRADES = [
    { name: "Не помню", cls: "g0" }, { name: "Трудно", cls: "g1" },
    { name: "Помню", cls: "g2" }, { name: "Легко", cls: "g3" },
  ];

  function showCard() {
    const left = review.queue.length;
    $("#rLeft").textContent = `осталось ${left}`;
    $("#rLine").style.width = (review.done / (review.done + left)) * 100 + "%";
    if (!left) { finishReview(); return; }
    const c = Cards.load().find((x) => x.id === review.queue[0]);
    if (!c) { review.queue.shift(); showCard(); return; }
    setPose($("#cardPet"), "read");
    $("#rBody").innerHTML = `
      <div class="flash-wrap q-in">
        <button class="flash" id="flash" aria-label="Перевернуть карточку">
          <span class="face front">
            <span class="chip">${esc(c.deck)}</span>
            <span class="ftext">${esc(c.front)}</span>
            <span class="hint">Нажми или пробел — перевернуть</span>
          </span>
          <span class="face back">
            <span class="fsmall">${esc(c.front)}</span>
            <span class="ftext">${esc(c.back)}</span>
          </span>
        </button>
      </div>
      <div class="rate" id="rate">
        <button class="btn btn-sun show-btn" id="showBtn">Показать ответ</button>
      </div>
      <div class="kbd">Пробел — перевернуть, <kbd>1</kbd>–<kbd>4</kbd> — оценка</div>`;
    $("#flash").onclick = flip;
    $("#showBtn").onclick = flip;
  }

  function flip() {
    const f = $("#flash");
    if (!f || f.classList.contains("flipped")) return;
    f.classList.add("flipped");
    const c = Cards.load().find((x) => x.id === review.queue[0]);
    $("#rate").innerHTML = GRADES.map((g, i) => {
      const next = Cards.schedule(c, i);
      return `<button class="grade ${g.cls}" data-g="${i}"><b>${g.name}</b><span>${Cards.human(next.wait)}</span></button>`;
    }).join("");
    $$("#rate .grade").forEach((b) => b.onclick = () => rateCard(c, +b.dataset.g));
  }

  function rateCard(c, g) {
    Cards.rate(c.id, g);
    const res = Game.cardReviewed(pet, g);
    review.queue.shift();
    review.done += 1;
    if (g === 0) review.queue.push(c.id);       // не вспомнила — покажем ещё раз в конце
    else review.good += 1;
    const box = $("#cardPet");
    if (g === 0) { setPose(box, "sad", 1600); bump(box, "shake"); $("#cardSay").textContent = "Ничего, покажу её ещё раз чуть позже."; }
    else { setPose(box, g === 3 ? "happy" : "eat", 1600); bump(box, "jump"); $("#cardSay").textContent = g === 3 ? "Легко! Покажу её нескоро." : "Отлично, запомнили!"; }
    if (res.levelUp) { confetti(); toast(`Новый уровень ${Game.level(pet)}!`, "★"); }
    $("#rDone").textContent = review.done;
    $("#rGood").textContent = review.good;
    $("#rFood").textContent = pet.food;
    updateHeader("cards");
    setTimeout(showCard, 380);
  }

  function finishReview() {
    const next = Cards.load().filter((c) => !review.deck || c.deck === review.deck).sort((a, b) => a.due - b.due)[0];
    setPose($("#cardPet"), "proud");
    $("#cardSay").textContent = "Мы молодцы! Мозг скажет спасибо.";
    $("#rBody").innerHTML = `<div class="empty q-in" style="border-style:solid">
        <div style="font-size:44px;font-weight:500;letter-spacing:-.04em;color:var(--ink)">Готово!</div>
        Повторено карточек: <b>${review.done}</b>, вспомнила сразу: <b>${review.good}</b>.<br>
        ${next ? `Следующее повторение — ${Cards.whenText(next)}.` : ""}
        <div class="row" style="justify-content:center;margin-top:18px"><a class="btn" href="#/cards">К колодам</a></div>
      </div>`;
    confetti();
    review = null;
  }

  // ============================================================
  //  IELTS: Speaking и Writing
  // ============================================================
  const KEY_IELTS = "petTeacher.ielts";
  const ieltsData = () => Object.assign({ essays: [], done: [] }, Game.readJSON(KEY_IELTS, {}));
  const ieltsSave = (d) => Game.writeJSON(KEY_IELTS, d);
  const rndIdx = (arr, not) => { let i; do { i = Math.floor(Math.random() * arr.length); } while (arr.length > 1 && i === not); return i; };
  const wordCount = (t) => (t.trim().match(/[A-Za-zА-Яа-яЁё0-9'’-]+/g) || []).length;
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  let ielts = { tab: "speaking", part: 1, p1: 0, p2: 0, q: 0, wkind: "t2", widx: 0 };
  ielts.p1 = rndIdx(IELTS.PART1);
  ielts.p2 = rndIdx(IELTS.PART2);
  ielts.widx = rndIdx(IELTS.TASK2);

  /** Опыт за задание — один раз за каждое (как и в обычных вопросах). */
  function ieltsReward(id, xp, text) {
    const d = ieltsData();
    if (d.done.includes(id)) { toast("Это задание уже засчитано — опыт не начисляется", "✓"); return; }
    d.done.push(id);
    ieltsSave(d);
    const old = Game.level(pet);
    pet.xp += xp;
    pet.fun = Math.min(10, pet.fun + 1);
    Game.savePet(pet);
    Game.track({ ielts: 1, xp });
    toast(`${text} +${xp} XP`, "★");
    if (Game.level(pet) > old) { confetti(); toast(`Новый уровень ${Game.level(pet)}!`, "★"); }
    updateHeader("ielts");
  }

  function ieltsPage() {
    const d = ieltsData();
    view.innerHTML = `
      <section class="page-head reveal">
        <div>
          <span class="eyebrow" style="--i:0">IELTS</span>
          <h1 style="--i:1">Speaking и Writing</h1>
          <p style="--i:2">Пробные задания в формате экзамена на темы, которые постоянно встречаются на IELTS.
            Тренируй речь с таймером и записью голоса, пиши эссе с подсчётом слов.</p>
        </div>
        ${petBox("focus")}
      </section>
      <div class="ielts-tabs">
        <div class="modes light" id="ieltsTabs">
          <button data-tab="speaking" class="${ielts.tab === "speaking" ? "sel" : ""}">Speaking</button>
          <button data-tab="writing" class="${ielts.tab === "writing" ? "sel" : ""}">Writing</button>
        </div>
        <span class="muted">Выполнено заданий: <b>${d.done.length}</b> · эссе сохранено: <b>${d.essays.length}</b></span>
      </div>
      <section class="quiz" style="margin-top:18px">
        <div class="quiz-card" id="ieltsMain"></div>
        <aside class="quiz-side">
          <div class="card white">
            <b>Как оценивают ${ielts.tab === "speaking" ? "Speaking" : "Writing"}</b>
            <div class="crit">${IELTS.CRITERIA[ielts.tab].map(([n, t]) => `<label><input type="checkbox"><span><b>${n}</b>${t}</span></label>`).join("")}</div>
            <span class="hint">Отмечай, что получилось — это самопроверка. Оценивают по шкале band 0–9.</span>
          </div>
          <div class="card white ai-soon">
            <b>Проверка ИИ-учителем</b>
            <span class="hint">${ielts.tab === "writing" ? "Под текстом есть кнопка «Проверить ИИ»: экзаменатор оценит работу по 4 критериям и покажет ошибки."
              : "Есть вопрос по ответу или лексике? Спроси на странице «Учитель»."}</span>
          </div>
        </aside>
      </section>`;
    $$("#ieltsTabs button").forEach((b) => b.onclick = () => { ielts.tab = b.dataset.tab; ieltsPage(); });
    if (ielts.tab === "speaking") speakingView(); else writingView();
  }

  // ---------- Speaking ----------
  let ieltsTimer = null;
  function stopIeltsTimer() { clearInterval(ieltsTimer); ieltsTimer = null; }

  function speakingView() {
    stopIeltsTimer();
    const box = $("#ieltsMain");
    const parts = `<div class="pills" id="parts">${[1, 2, 3].map((p) => `<button class="pill ${ielts.part === p ? "sel" : ""}" data-p="${p}">Part ${p}</button>`).join("")}</div>`;
    const rec = `<div class="rec" id="rec"><button class="btn btn-ghost btn-sm" id="recBtn">● Записать себя</button><span class="hint" id="recHint">Запись остаётся только в браузере.</span></div>`;
    if (ielts.part === 1) {
      const t = IELTS.PART1[ielts.p1];
      const q = t.q[ielts.q];
      box.innerHTML = `${parts}
        <div class="q-in" style="margin-top:26px">
          <div class="q-num">Part 1 · ${esc(t.topic)} · вопрос ${ielts.q + 1} из ${t.q.length}</div>
          <h2 class="q-text">${esc(q)}</h2>
          <p class="muted">Отвечай 2–3 предложениями: ответ + причина + пример. Примерно 20–30 секунд.</p>
        </div>
        ${rec}
        <div class="row" style="margin-top:22px">
          ${ielts.q < t.q.length - 1 ? `<button class="btn" id="nextQ1">Следующий вопрос <span class="arr">${I.arrow}</span></button>`
            : `<button class="btn btn-sun" id="doneP1">Тема пройдена</button>`}
          <button class="btn btn-ghost" id="newTopic">Другая тема</button>
        </div>`;
      const n = $("#nextQ1");
      if (n) n.onclick = () => { ielts.q += 1; speakingView(); };
      const dn = $("#doneP1");
      if (dn) dn.onclick = () => { ieltsReward("s1:" + t.topic, 5, "Part 1 пройден."); ielts.p1 = rndIdx(IELTS.PART1, ielts.p1); ielts.q = 0; speakingView(); };
      $("#newTopic").onclick = () => { ielts.p1 = rndIdx(IELTS.PART1, ielts.p1); ielts.q = 0; speakingView(); };
    } else if (ielts.part === 2) {
      const c = IELTS.PART2[ielts.p2];
      box.innerHTML = `${parts}
        <div class="cue q-in">
          <div class="q-num">Part 2 · карточка</div>
          <h2 class="q-text" style="margin-bottom:14px">${esc(c.card)}</h2>
          <p class="muted" style="margin-bottom:6px">You should say:</p>
          <ul>${c.say.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
        </div>
        <div class="talk-timer" id="talk"><span class="tt-label" id="ttLabel">1 минута на подготовку, потом до 2 минут речи</span><span class="tt-time" id="ttTime">01:00</span></div>
        <textarea class="input notes" id="notes" placeholder="Заметки на время подготовки (ключевые слова)…"></textarea>
        ${rec}
        <div class="row" style="margin-top:18px">
          <button class="btn btn-sun" id="startTalk">Начать подготовку</button>
          <button class="btn btn-ghost" id="toP3">Вопросы Part 3 <span class="arr">${I.arrow}</span></button>
          <button class="btn btn-ghost" id="newCard">Другая карточка</button>
        </div>`;
      $("#startTalk").onclick = () => runTalk(c);
      $("#toP3").onclick = () => { ielts.part = 3; ielts.q = 0; speakingView(); };
      $("#newCard").onclick = () => { ielts.p2 = rndIdx(IELTS.PART2, ielts.p2); speakingView(); };
    } else {
      const c = IELTS.PART2[ielts.p2];
      box.innerHTML = `${parts}
        <div class="q-in" style="margin-top:26px">
          <div class="q-num">Part 3 · обсуждение к теме «${esc(c.card)}»</div>
          ${c.part3.map((q, i) => `<h2 class="q-text p3">${i + 1}. ${esc(q)}</h2>`).join("")}
          <p class="muted">Отвечай развёрнуто, 40–60 секунд: мнение, объяснение, пример, иногда — другая точка зрения.
            Полезные фразы: <i>It depends on…, On the one hand…, A good example of this is…</i></p>
        </div>
        ${rec}
        <div class="row" style="margin-top:22px">
          <button class="btn btn-sun" id="doneP3">Ответила на все</button>
          <button class="btn btn-ghost" id="newCard">Другая тема</button>
        </div>`;
      $("#doneP3").onclick = () => { ieltsReward("s3:" + ielts.p2, 5, "Part 3 пройден."); ielts.p2 = rndIdx(IELTS.PART2, ielts.p2); speakingView(); };
      $("#newCard").onclick = () => { ielts.p2 = rndIdx(IELTS.PART2, ielts.p2); speakingView(); };
    }
    $$("#parts .pill").forEach((b) => b.onclick = () => { ielts.part = +b.dataset.p; ielts.q = 0; speakingView(); });
    setupRecorder();
  }

  /** Part 2: минута подготовки, затем 2 минуты речи. */
  function runTalk(c) {
    stopIeltsTimer();
    let phase = "prep", left = 60;
    const btn = $("#startTalk");
    btn.textContent = "Начать говорить сейчас";
    const tick = () => {
      $("#ttTime").textContent = mmss(left);
      $("#ttLabel").textContent = phase === "prep" ? "Подготовка: продумай план и запиши ключевые слова" : "Говори! Раскрой все пункты карточки";
      $("#talk").classList.toggle("speaking", phase === "talk");
      if (left <= 0) {
        if (phase === "prep") { phase = "talk"; left = 120; Timer.chime(); return; }
        stopIeltsTimer();
        Timer.chime();
        $("#ttLabel").textContent = "Время вышло! Экзаменатор остановил бы тебя здесь.";
        btn.textContent = "Ещё раз";
        btn.onclick = () => runTalk(c);
        ieltsReward("s2:" + c.card, 5, "Part 2 пройден.");
        return;
      }
      left -= 1;
    };
    btn.onclick = () => { if (phase === "prep") { phase = "talk"; left = 120; btn.textContent = "Закончить"; } else { left = 0; } };
    tick();
    ieltsTimer = setInterval(tick, 1000);
    cleanup.push(stopIeltsTimer);
  }

  /** Запись своего голоса через микрофон (MediaRecorder). Ничего не отправляется — только прослушать. */
  function setupRecorder() {
    const btn = $("#recBtn");
    if (!btn) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) { btn.disabled = true; $("#recHint").textContent = "Браузер не поддерживает запись."; return; }
    let rec = null, chunks = [], stream = null;
    btn.onclick = async () => {
      if (rec && rec.state === "recording") { rec.stop(); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) { $("#recHint").textContent = "Нет доступа к микрофону. Разреши его в настройках браузера."; return; }
      chunks = [];
      rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType }));
        btn.textContent = "● Записать заново";
        btn.classList.remove("recording");
        $("#recHint").innerHTML = `<audio controls src="${url}"></audio> Послушай себя: паузы, «эээ», произношение.`;
      };
      rec.start();
      btn.textContent = "■ Остановить запись";
      btn.classList.add("recording");
      $("#recHint").textContent = "Идёт запись…";
      cleanup.push(() => { if (rec && rec.state === "recording") rec.stop(); });
    };
  }

  // ---------- Writing ----------
  const WKINDS = {
    t2: { name: "Task 2 · эссе", list: () => IELTS.TASK2, min: 250, time: 40 },
    t1: { name: "Task 1 · график (Academic)", list: () => IELTS.TASK1, min: 150, time: 20 },
    gt: { name: "Task 1 · письмо (General)", list: () => IELTS.LETTERS, min: 150, time: 20 },
  };

  function writingView() {
    stopIeltsTimer();
    const k = WKINDS[ielts.wkind];
    const list = k.list();
    if (ielts.widx >= list.length) ielts.widx = 0;
    const task = list[ielts.widx];
    const id = `w:${ielts.wkind}:${ielts.widx}`;
    const d = ieltsData();
    const draft = (d.essays.find((e) => e.id === id && !e.submitted) || {}).text || "";
    const box = $("#ieltsMain");
    box.innerHTML = `
      <div class="pills" id="wkinds">${Object.entries(WKINDS).map(([key, v]) => `<button class="pill ${ielts.wkind === key ? "sel" : ""}" data-k="${key}">${v.name}</button>`).join("")}</div>
      <div class="q-in" style="margin-top:24px">
        <div class="q-num">${k.name}${task.type ? " · " + esc(task.type) : ""} · минимум ${k.min} слов · ${k.time} минут</div>
        <p class="w-prompt">${esc(task.text)}</p>
        ${task.chart ? `<div class="w-chart">${IELTS.chartSVG(task.chart)}</div>` : ""}
      </div>
      <div class="w-bar">
        <span class="chip" id="wc">0 / ${k.min} слов</span>
        <span class="chip" id="wt">${mmss(k.time * 60)}</span>
        <button class="btn btn-ghost btn-sm" id="wStart">Старт таймера</button>
        <span class="sp"></span>
        <button class="btn btn-ghost btn-sm" id="wNew">Другое задание</button>
      </div>
      <textarea class="input essay" id="essay" placeholder="Write your answer here…" spellcheck="false">${esc(draft)}</textarea>
      <div class="row" style="margin-top:14px">
        <button class="btn btn-sun" id="wSubmit">Сдать работу</button>
        <button class="btn btn-ghost" id="wDraft">Сохранить черновик</button>
        <button class="btn btn-ghost" id="wAI">✦ Проверить ИИ</button>
      </div>
      <div id="aiOut"></div>
      ${d.essays.length ? `<div class="essays"><b>Мои работы</b>${d.essays.slice().reverse().map((e) => `
        <div class="essay-row">
          <span class="chip ${e.submitted ? "good" : ""}">${e.submitted ? "сдано" : "черновик"}</span>
          <span class="et">${esc(WKINDS[e.kind].name)} · ${e.words} слов · ${new Date(e.date).toLocaleDateString("ru-RU")}</span>
          <button class="btn btn-ghost btn-sm" data-open="${esc(e.id)}|${e.date}">Открыть</button>
          <button class="del" data-del="${e.date}" title="Удалить">${I.trash}</button>
        </div>`).join("")}</div>` : ""}`;

    const ta = $("#essay");
    const upd = () => {
      const n = wordCount(ta.value);
      $("#wc").textContent = `${n} / ${k.min} слов`;
      $("#wc").className = "chip " + (n >= k.min ? "good" : "");
    };
    ta.oninput = upd;
    upd();
    $$("#wkinds .pill").forEach((b) => b.onclick = () => { ielts.wkind = b.dataset.k; ielts.widx = rndIdx(WKINDS[b.dataset.k].list()); writingView(); });
    $("#wNew").onclick = () => { ielts.widx = rndIdx(list, ielts.widx); writingView(); };
    $("#wStart").onclick = () => {
      if (ieltsTimer) { stopIeltsTimer(); $("#wStart").textContent = "Продолжить"; return; }
      let left = ielts.wLeft && ielts.wLeftId === id ? ielts.wLeft : k.time * 60;
      $("#wStart").textContent = "Пауза";
      ieltsTimer = setInterval(() => {
        left -= 1;
        ielts.wLeft = left; ielts.wLeftId = id;
        $("#wt").textContent = mmss(Math.max(0, left));
        $("#wt").className = "chip " + (left <= 300 ? "bad" : "");
        if (left <= 0) { stopIeltsTimer(); Timer.chime(); toast("Время вышло! На экзамене пришлось бы сдать работу.", "!"); }
      }, 1000);
      cleanup.push(stopIeltsTimer);
    };
    const save = (submitted) => {
      const dd = ieltsData();
      const words = wordCount(ta.value);
      dd.essays = dd.essays.filter((e) => !(e.id === id && !e.submitted));
      dd.essays.push({ id, kind: ielts.wkind, prompt: task.text, text: ta.value, words, date: Date.now(), submitted });
      ieltsSave(dd);
      return words;
    };
    $("#wDraft").onclick = () => { save(false); toast("Черновик сохранён"); writingView(); };
    $("#wAI").onclick = () => {
      if (wordCount(ta.value) < 50) { toast("Напиши хотя бы 50 слов, чтобы было что проверять", "!"); return; }
      save(false);
      checkEssayAI(k.name, task, ta.value, $("#aiOut"));
      $("#aiOut").scrollIntoView({ behavior: "smooth", block: "start" });
    };
    $("#wSubmit").onclick = () => {
      const words = wordCount(ta.value);
      if (words < k.min && !confirm(`Сейчас ${words} слов, а нужно минимум ${k.min}. На экзамене за это снижают балл. Всё равно сдать?`)) return;
      save(true);
      stopIeltsTimer();
      if (words >= k.min) ieltsReward(id, 15, "Работа сдана.");
      else toast("Работа сохранена. Опыт даётся, если слов не меньше минимума.", "!");
      ielts.widx = rndIdx(list, ielts.widx);
      writingView();
    };
    $$("[data-open]").forEach((b) => b.onclick = () => {
      const [eid, date] = b.dataset.open.split("|");
      const e = ieltsData().essays.find((x) => String(x.date) === date);
      if (!e) return;
      const [, kind, idx] = eid.split(":");
      ielts.wkind = kind; ielts.widx = +idx;
      writingView();
      $("#essay").value = e.text;
      $("#essay").dispatchEvent(new Event("input"));
      $("#essay").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    $$(".essay-row [data-del]").forEach((b) => b.onclick = () => {
      const dd = ieltsData();
      dd.essays = dd.essays.filter((x) => String(x.date) !== b.dataset.del);
      ieltsSave(dd);
      writingView();
    });
  }

  // ============================================================
  //  Аккаунт
  // ============================================================
  let accMode = "login";

  function serverMissing(what) {
    return `<div class="card white notice">
      <h3>${what} работают через сервер</h3>
      <p class="muted">Сейчас сайт открыт без сервера (адрес <code>${esc(location.host || "файл на компьютере")}</code>).
        Если сервер уже запущен, просто открой <a href="http://localhost:8000" style="color:var(--violet);font-weight:600">http://localhost:8000</a>. Если нет:</p>
      <ol class="steps">
        <li>Открой папку <code>pet-teacher</code> и дважды кликни <code>run.bat</code>.</li>
        <li>Сайт откроется по адресу <code>http://localhost:8000</code> — пользуйся им.</li>
        <li>Для ИИ-учителя положи ключ DeepSeek в файл <code>server/.env</code> (образец — <code>server/.env.example</code>).</li>
      </ol>
    </div>`;
  }

  async function accountPage() {
    view.innerHTML = `<section class="page-head reveal"><div>
        <span class="eyebrow" style="--i:0">Аккаунт</span>
        <h1 style="--i:1">${Api.auth() ? "Твой аккаунт" : "Вход"}</h1>
        <p style="--i:2">С аккаунтом прогресс хранится на сервере: питомец, карточки, вопросы и эссе не потеряются и откроются на другом компьютере.</p>
      </div>${petBox("happy")}</section><div id="accBody" style="margin-top:24px"></div>`;
    const h = Api.health() || await Api.checkServer();
    const body = $("#accBody");
    if (!body) return;
    if (!h.ok) { body.innerHTML = serverMissing("Аккаунты"); return; }
    const a = Api.auth();
    if (a) {
      let left = "", admin = false;
      try { const me = await Api.req("GET", "/api/me"); left = me.ai_left; admin = me.is_admin; } catch (e) { /* сессия устарела */ }
      if (!Api.auth()) { accountPage(); return; }
      body.innerHTML = `<div class="card white acc-card">
          <div class="acc-ava">${esc(a.username[0].toUpperCase())}</div>
          <div class="acc-info"><h3>${esc(a.username)}</h3>
            <p class="muted">Прогресс сохраняется на сервере автоматически каждые 10 секунд.
              ${Api.lastSync() ? `Последняя синхронизация: ${new Date(Api.lastSync()).toLocaleTimeString("ru-RU")}.` : ""}</p>
            <p class="muted">ИИ-учитель: ${h.ai ? `подключён, сегодня осталось вопросов: <b>${left}</b>` : "ключ DeepSeek ещё не добавлен в server/.env"}</p></div>
          <div class="row">${admin ? `<a class="btn btn-sun" href="#/admin">Статистика сайта</a>` : ""}<button class="btn btn-ghost" id="syncNow">Синхронизировать</button><button class="btn" id="logout">Выйти</button></div>
        </div>`;
      $("#syncNow").onclick = async () => { try { await Api.push(true); toast("Прогресс сохранён на сервере"); accountPage(); } catch (e) { toast(esc(e.message), "!"); } };
      $("#logout").onclick = async () => {
        if (!confirm("Выйти? Прогресс останется в аккаунте, а с этого компьютера будет удалён.")) return;
        await Api.logout();
        location.hash = "#/account";
        location.reload();
      };
      return;
    }
    body.innerHTML = `<form class="card white auth-form" id="authForm" autocomplete="on">
        <div class="modes light" id="accTabs">
          <button type="button" data-m="login" class="${accMode === "login" ? "sel" : ""}">Вход</button>
          <button type="button" data-m="register" class="${accMode === "register" ? "sel" : ""}">Регистрация</button>
        </div>
        <div class="field"><label for="aUser">Логин</label><input class="input" id="aUser" autocomplete="username" required minlength="3" maxlength="24" placeholder="aisha"></div>
        <div class="field"><label for="aPass">Пароль</label><input class="input" id="aPass" type="password" autocomplete="${accMode === "login" ? "current-password" : "new-password"}" required minlength="6" placeholder="минимум 6 символов"></div>
        <div class="auth-err" id="aErr"></div>
        <button class="btn btn-sun">${accMode === "login" ? "Войти" : "Создать аккаунт"}</button>
        <span class="hint">${accMode === "register" ? "Текущий прогресс в этом браузере перенесётся в новый аккаунт." : "Если в аккаунте уже есть прогресс, он загрузится на этот компьютер."}
          Пароль хранится на сервере только в зашифрованном виде.</span>
      </form>`;
    $$("#accTabs button").forEach((b) => b.onclick = () => { accMode = b.dataset.m; accountPage(); });
    $("#authForm").onsubmit = async (e) => {
      e.preventDefault();
      $("#aErr").textContent = "";
      try {
        const how = await Api.login($("#aUser").value.trim(), $("#aPass").value, accMode === "register");
        toast(how === "pulled" ? "Вход выполнен, прогресс загружен" : "Готово! Прогресс сохранён в аккаунте");
        location.hash = "#/";
        location.reload();
      } catch (err) {
        $("#aErr").textContent = err.message;
      }
    };
  }

  // ============================================================
  //  ИИ-учитель (чат)
  // ============================================================
  const KEY_CHAT = "petTeacher.chat";
  let tutorPending = null;       // вопрос, который надо отправить сразу (например, из «Спросить учителя»)
  let tutorBusy = false;

  /** Короткая сводка прогресса — её получает учитель, чтобы давать советы. */
  function progressContext() {
    const sp = Pets.SPECIES[pet.animal];
    const qs = Game.loadQuestions();
    const lines = [
      `Питомец: ${pet.name} (${sp.title}), уровень ${Game.level(pet)} (${Game.stage(pet)}), сытость ${pet.food}/10, настроение ${pet.fun}/10, энергия ${pet.energy}/10.`,
      `Ответы: верных ${pet.correct}, ошибок ${pet.wrong}, лучшая серия ${pet.best_streak}. Сейчас выбрана тема: ${pet.topic} · ${pet.level}.`,
      "Прогресс по секциям (решено/всего):",
    ];
    Object.entries(Game.TOPICS).forEach(([t, levels]) => {
      const parts = levels.filter((l) => l !== Game.TRAINER).map((l) => {
        const p = Game.sectionProgress(pet, t, l, qs);
        return p ? `${l} ${p.solved}/${p.total}` : "";
      }).filter(Boolean);
      lines.push(`- ${t}: ${parts.join(", ")}`);
    });
    const mist = Game.loadMistakes().slice(-10);
    if (mist.length) {
      lines.push("Последние ошибки (тема — вопрос — правильный ответ):");
      mist.forEach((m) => lines.push(`- ${m.from}${m.fromLevel ? " · " + m.fromLevel : ""} — ${m.question} — ${m.answer}`));
    }
    const cards = Cards.load();
    Cards.decks(cards).forEach((d) => {
      const l = cards.filter((c) => c.deck === d);
      lines.push(`Карточки «${d}»: всего ${l.length}, к повторению ${l.filter((c) => c.due <= Date.now()).length}, выучено ${l.filter((c) => c.interval >= 21).length}.`);
    });
    const t = Game.dayStats();
    lines.push(`Фокус: всего ${Game.totalFocusMinutes()} мин; сегодня ${t.sessions} сессий, ${t.minutes} мин, отвлечений ${t.distractions}.`);
    const ie = ieltsData();
    lines.push(`IELTS: выполнено заданий ${ie.done.length}, работ по Writing ${ie.essays.length}.`);
    lines.push(`Дата: ${new Date().toLocaleDateString("ru-RU")}.`);
    return lines.join("\n");
  }

  /** Мини-Markdown для ответов учителя: **жирный**, *курсив*, `код`, списки, заголовки. Сначала экранируем HTML. */
  function md(text) {
    const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<i>$2</i>");
    let html = "", list = null;
    const close = () => { if (list) { html += `</${list}>`; list = null; } };
    text.split("\n").forEach((raw) => {
      const line = raw.trimEnd();
      let m;
      if ((m = line.match(/^\s*[-*•]\s+(.*)/))) { if (list !== "ul") { close(); html += "<ul>"; list = "ul"; } html += `<li>${inline(m[1])}</li>`; }
      else if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== "ol") { close(); html += "<ol>"; list = "ol"; } html += `<li>${inline(m[1])}</li>`; }
      else if ((m = line.match(/^#{1,4}\s+(.*)/))) { close(); html += `<h4>${inline(m[1])}</h4>`; }
      else if (!line.trim()) { close(); }
      else { close(); html += `<p>${inline(line)}</p>`; }
    });
    close();
    return html;
  }

  const QUICK = [
    "Проанализируй мой прогресс: что у меня хорошо, а что подтянуть?",
    "Составь мне план занятий на неделю",
    "Объясни мои последние ошибки",
    "Как мне готовиться к IELTS на band 7?",
    "Как не отвлекаться и не выгорать во время учёбы?",
  ];

  async function tutorPage() {
    const chat = Game.readJSON(KEY_CHAT, []);
    view.innerHTML = `
      <section class="quiz">
        <div class="quiz-card chat-card">
          <div class="quiz-top"><span class="chip plum">ИИ-учитель</span><span class="chip" id="aiLeft">DeepSeek</span><span class="sp"></span>
            ${chat.length ? `<button class="btn btn-ghost btn-sm" id="clearChat">Новый разговор</button>` : ""}</div>
          <div class="chat" id="chat"></div>
          <form class="chat-input" id="chatForm">
            <textarea class="input" id="chatIn" rows="1" placeholder="Спроси что угодно по учёбе…" title="Enter — отправить, Shift+Enter — новая строка"></textarea>
            <button class="btn btn-sun" id="chatSend">Спросить</button>
          </form>
        </div>
        <aside class="quiz-side">
          <div class="side-pet">${petBox("read", "", "tutorPet")}
            <div class="bubble" id="tutorSay">Я вижу твой прогресс и могу объяснить любую тему.</div></div>
          <div class="card white quick"><b>Быстрые вопросы</b>
            ${QUICK.map((q) => `<button class="quick-q" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div>
        </aside>
      </section>`;
    const h = Api.health() || await Api.checkServer();
    if (!$("#chat")) return;
    if (!h.ok) { $("#chat").innerHTML = serverMissing("Аккаунты и ИИ-учитель"); disableChat(); return; }
    if (!Api.auth()) { $("#chat").innerHTML = `<div class="empty">Чтобы спрашивать учителя, <a href="#/account" style="color:var(--violet);font-weight:600">войди в аккаунт</a>.</div>`; disableChat(); return; }
    if (!h.ai) { $("#chat").innerHTML = `<div class="empty">Учитель ещё не подключён: добавь ключ DeepSeek в <code>server/.env</code> и перезапусти <code>run.bat</code>.</div>`; disableChat(); return; }
    renderChat(chat);
    $("#chatForm").onsubmit = (e) => { e.preventDefault(); sendTutor($("#chatIn").value); };
    $("#chatIn").onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTutor($("#chatIn").value); } };
    $("#chatIn").oninput = (e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(160, e.target.scrollHeight) + "px"; };
    $$(".quick-q").forEach((b) => b.onclick = () => sendTutor(b.dataset.q));
    const cc = $("#clearChat");
    if (cc) cc.onclick = () => { Game.writeJSON(KEY_CHAT, []); tutorPage(); };
    if (tutorPending) { const q = tutorPending; tutorPending = null; sendTutor(q); }
  }

  function disableChat() {
    $("#chatIn").disabled = true;
    $("#chatSend").disabled = true;
    $$(".quick-q").forEach((b) => (b.disabled = true));
  }

  function renderChat(chat) {
    const box = $("#chat");
    if (!box) return;
    box.innerHTML = chat.length ? chat.map((m) => `<div class="msg ${m.role}">${m.role === "user" ? `<p>${esc(m.content).replace(/\n/g, "<br>")}</p>` : md(m.content)}</div>`).join("")
      : `<div class="chat-hello">${petBox("happy")}<p>Привет! Я ${esc(pet.name)}, твой учитель. Спроси меня о любой теме, попроси объяснить ошибку или составить план.</p></div>`;
    box.scrollTop = box.scrollHeight;
  }

  async function sendTutor(text) {
    text = (text || "").trim();
    if (!text || tutorBusy || !$("#chat")) return;
    tutorBusy = true;
    const chat = Game.readJSON(KEY_CHAT, []);
    chat.push({ role: "user", content: text });
    Game.writeJSON(KEY_CHAT, chat.slice(-40));
    $("#chatIn").value = "";
    renderChat(chat);
    $("#chat").insertAdjacentHTML("beforeend", `<div class="msg assistant typing" id="typing"><span></span><span></span><span></span></div>`);
    $("#chat").scrollTop = $("#chat").scrollHeight;
    setPose($("#tutorPet"), "focus");
    $("#tutorSay").textContent = "Думаю…";
    try {
      const sp = Pets.SPECIES[pet.animal];
      const r = await Api.req("POST", "/api/tutor/chat", { messages: chat.slice(-16), context: progressContext(), pet_name: pet.name, species: sp.title });
      chat.push({ role: "assistant", content: r.reply });
      Game.writeJSON(KEY_CHAT, chat.slice(-40));
      if ($("#aiLeft")) $("#aiLeft").textContent = `осталось сегодня: ${r.ai_left}`;
      setPose($("#tutorPet"), "happy", 2500);
      if ($("#tutorSay")) $("#tutorSay").textContent = "Надеюсь, стало понятнее! Спрашивай ещё.";
    } catch (e) {
      chat.push({ role: "assistant", content: "⚠ " + e.message });
      setPose($("#tutorPet"), "sad", 2500);
      if ($("#tutorSay")) $("#tutorSay").textContent = "Что-то пошло не так…";
    }
    tutorBusy = false;
    renderChat(chat);
  }

  /** Открыть учителя с готовым вопросом (кнопка «Спросить учителя» после ошибки). */
  function askTutor(question) {
    tutorPending = question;
    go("#/tutor");
  }

  // ---------- проверка эссе IELTS ----------
  async function checkEssayAI(kindName, task, text, out) {
    const h = Api.health() || await Api.checkServer();
    if (!h.ok) { out.innerHTML = serverMissing("Проверка эссе"); return; }
    if (!Api.auth()) { out.innerHTML = `<div class="empty">Чтобы ИИ проверил работу, <a href="#/account" style="color:var(--violet);font-weight:600">войди в аккаунт</a>.</div>`; return; }
    if (!h.ai) { out.innerHTML = `<div class="empty">Добавь ключ DeepSeek в <code>server/.env</code> и перезапусти <code>run.bat</code>.</div>`; return; }
    out.innerHTML = `<div class="ai-wait"><span class="msg assistant typing"><span></span><span></span><span></span></span> Экзаменатор читает твою работу… (до минуты)</div>`;
    const prompt = task.chart ? `${task.text}\nДанные графика: ${JSON.stringify(task.chart)}` : task.text;
    try {
      const r = await Api.req("POST", "/api/tutor/essay", { kind: kindName, prompt, text });
      const band = (v) => (typeof v === "number" ? v.toFixed(1) : esc(v));
      out.innerHTML = `<div class="ai-result">
          <div class="ai-overall"><span>Примерный band</span><b>${band(r.overall)}</b></div>
          <div class="ai-crit">${(r.criteria || []).map((c) => `<div><span class="chip grad">${band(c.band)}</span><b>${esc(c.name)}</b><p>${esc(c.comment)}</p></div>`).join("")}</div>
          ${(r.strengths || []).length ? `<h4>Что получилось</h4><ul>${r.strengths.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
          ${(r.improve || []).length ? `<h4>Что улучшить</h4><ul>${r.improve.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
          ${(r.corrections || []).length ? `<h4>Исправления</h4><div class="ai-fix">${r.corrections.map((c) => `<div><s>${esc(c.wrong)}</s> → <b>${esc(c.right)}</b><span>${esc(c.why)}</span></div>`).join("")}</div>` : ""}
          <span class="hint">Это примерная оценка ИИ, а не официальный результат IELTS.</span>
        </div>`;
      const d = ieltsData();
      d.lastFeedback = { date: Date.now(), overall: r.overall };
      ieltsSave(d);
    } catch (e) {
      out.innerHTML = `<div class="fb bad"><span class="ic">!</span><span class="sp">${esc(e.message)}</span></div>`;
    }
  }

  // ============================================================
  //  Админ: статистика сайта (видна только логинам из ADMIN_USERS в server/.env)
  // ============================================================
  const ROUTE_NAMES = { home: "Питомец", learn: "Учёба", quiz: "Вопросы", cards: "Карточки", review: "Повторение карточек",
    ielts: "IELTS", tutor: "ИИ-учитель", focus: "Фокус", my: "Мои вопросы", new: "Выбор питомца", account: "Аккаунт", admin: "Админ" };

  async function adminPage() {
    view.innerHTML = `<section class="page-head reveal"><div>
        <span class="eyebrow" style="--i:0">Админ</span>
        <h1 style="--i:1">Статистика</h1>
        <p style="--i:2">Кто зарегистрировался, кто возвращается и какими разделами пользуются. Видно только тебе.</p>
      </div>${petBox("proud")}</section><div id="adm" style="margin-top:22px"><div class="empty">Загружаю…</div></div>`;
    const h = Api.health() || await Api.checkServer();
    const box = $("#adm");
    if (!h.ok) { box.innerHTML = serverMissing("Статистика"); return; }
    if (!Api.auth()) { box.innerHTML = `<div class="empty"><a href="#/account" style="color:var(--violet);font-weight:600">Войди в аккаунт</a> админа.</div>`; return; }
    let d;
    try { d = await Api.req("GET", "/api/admin/stats"); } catch (e) {
      box.innerHTML = `<div class="card white notice"><h3>Нет доступа</h3><p class="muted">${esc(e.message)}. Чтобы стать админом, добавь в <code>server/.env</code> строку
        <code>ADMIN_USERS=${esc(Api.auth().username)}</code> и перезапусти сервер.</p></div>`;
      return;
    }
    if (!$("#adm")) return;
    const s = d.summary;
    const tile = (n, label, hint = "") => `<div class="num"><b>${n}</b><span>${label}${hint ? `<br><i>${hint}</i>` : ""}</span></div>`;
    const maxDay = Math.max(1, ...d.daily.map((x) => Math.max(x.active, x.new, x.ai)));
    const maxRoute = Math.max(1, ...d.routes.map((r) => r.count));
    const fmtDay = (iso) => { const [, m, dd] = iso.split("-"); return `${dd}.${m}`; };
    const ago = (iso) => {
      if (!iso) return "—";
      const diff = Math.round((new Date(new Date().toISOString().slice(0, 10)) - new Date(iso)) / 86400000);
      return diff <= 0 ? "сегодня" : diff === 1 ? "вчера" : `${diff} ${plural(diff, "день", "дня", "дней")} назад`;
    };
    box.innerHTML = `
      <div class="numbers adm-tiles">
        ${tile(s.users, "всего аккаунтов", `+${s.new_week} за неделю`)}
        ${tile(s.active_today, "заходили сегодня")}
        ${tile(s.active_week, "активны за 7 дней", s.users ? Math.round((s.active_week / s.users) * 100) + "% от всех" : "")}
        ${tile(s.ai_week, "вопросов ИИ за неделю", `${s.ai_today} сегодня · ${(s.tokens_week / 1000).toFixed(1)}k токенов`)}
      </div>

      <div class="card white" style="margin-top:14px">
        <div class="list-head"><h3>Последние 14 дней</h3>
          <div class="adm-legend"><span><i style="background:#7B61FF"></i>активные</span><span><i style="background:#FF7EB6"></i>новые</span><span><i style="background:#3CC8FF"></i>вопросы ИИ</span></div></div>
        <div class="adm-chart">${d.daily.map((x) => `
          <div class="adm-day" title="${fmtDay(x.day)}: активных ${x.active}, новых ${x.new}, вопросов ИИ ${x.ai}">
            <div class="adm-bars">
              <i style="height:${(x.active / maxDay) * 100}%;background:#7B61FF"></i>
              <i style="height:${(x.new / maxDay) * 100}%;background:#FF7EB6"></i>
              <i style="height:${(x.ai / maxDay) * 100}%;background:#3CC8FF"></i>
            </div><span>${fmtDay(x.day)}</span></div>`).join("")}</div>
      </div>

      <div class="adm-grid">
        <div class="card white">
          <h3 class="adm-h">Популярные разделы <span class="muted">· 7 дней</span></h3>
          ${d.routes.length ? d.routes.map((r) => `<div class="adm-route"><span>${esc(ROUTE_NAMES[r.route] || r.route)}</span>
            <div class="adm-rbar"><i style="width:${(r.count / maxRoute) * 100}%"></i></div><b>${r.count}</b></div>`).join("")
            : `<p class="muted">Пока нет данных.</p>`}
        </div>
        <div class="card white">
          <h3 class="adm-h">Как читать</h3>
          <ul class="adm-help">
            <li><b>Активны за 7 дней</b> — главный показатель интереса. Если люди возвращаются сами, сайт им нужен.</li>
            <li><b>Дней активности</b> у пользователя: 1 — зашёл и ушёл, 5+ — постоянный ученик.</li>
            <li><b>Вопросы ИИ</b> стоят денег. Точную сумму смотри на platform.deepseek.com → Usage.</li>
            <li>Разделы считаются без имён: только сколько раз их открыли.</li>
          </ul>
        </div>
      </div>

      <div class="card white" style="margin-top:14px">
        <div class="list-head"><h3>Пользователи</h3><span class="muted">${d.users.length}</span></div>
        <div class="adm-table">
          <div class="adm-row adm-th"><span>Логин</span><span>Питомец</span><span>Регистрация</span><span>Последний вход</span><span>Дней</span><span>Верных</span><span>ИИ</span></div>
          ${d.users.map((u) => `<div class="adm-row">
            <span><b>${esc(u.username)}</b></span>
            <span>${u.pet.name ? `${esc(u.pet.name)} <i>${esc((Pets.SPECIES[u.pet.animal] || {}).title || "")}</i>` : "—"}</span>
            <span>${new Date(u.created * 1000).toLocaleDateString("ru-RU")}</span>
            <span>${ago(u.last)}</span>
            <span>${u.days_active}</span>
            <span>${u.pet.correct || 0}</span>
            <span>${u.ai}</span></div>`).join("") || `<p class="muted">Ещё никто не зарегистрировался.</p>`}
        </div>
      </div>
      <div class="row" style="margin-top:14px"><button class="btn btn-ghost btn-sm" id="admReload">Обновить</button></div>`;
    $("#admReload").onclick = adminPage;
  }

  // ============================================================
  //  Выбор питомца
  // ============================================================
  function choosePage() {
    if (pet && !pick.name) pick = { animal: pet.animal, name: "" };
    view.innerHTML = `
      <section class="page-head reveal" style="min-height:300px">
        <div>
          <span class="eyebrow" style="--i:0">Bilim Buddy</span>
          <h1 style="--i:1">Учись вместе с питомцем</h1>
          <p style="--i:2">Отвечай на вопросы — и питомец сыт. Занимайся с таймером — и он растёт.
            Забудешь про учёбу — загрустит.</p>
        </div>
        <div class="pet-box" id="choosePreview">${Pets.petSVG(pick.animal, "happy")}</div>
      </section>

      <div class="step"><span class="step-n">01</span><h3>Выбери питомца</h3></div>
      <div class="pick-grid reveal">
        ${Object.entries(Pets.SPECIES).map(([k, s], i) => `
          <button class="pick ${k === pick.animal ? "sel" : ""}" data-animal="${k}" style="--i:${i}">
            <span class="chip trait">${s.trait}</span>
            <div class="pet-box">${Pets.petSVG(k, k === pick.animal ? "happy" : "idle")}</div>
            <h3>${s.title}</h3>
            <p>${s.about}</p>
          </button>`).join("")}
      </div>

      <div class="step"><span class="step-n">02</span><h3>Как зовут?</h3></div>
      <form class="name-row" id="nameForm">
        <input class="input" id="petName" maxlength="20" placeholder="Например: Зефирка" value="${esc(pick.name)}" required>
        <button class="btn btn-sun" style="padding:16px 30px">Завести питомца <span class="arr">${I.arrow}</span></button>
        ${pet ? `<a class="btn btn-ghost" href="#/">Отмена</a>` : ""}
      </form>
      ${!pet && !Api.auth() ? `<p class="muted" style="margin-top:16px">Уже есть аккаунт? <a href="#/account" style="color:var(--violet);font-weight:600">Войти</a> — питомец загрузится с сервера.</p>` : ""}`;

    $$(".pick").forEach((b) => {
      const box = b.querySelector(".pet-box");
      b.onmouseenter = () => { if (b.dataset.animal !== pick.animal) setPose(box, "happy", 0, b.dataset.animal); };
      b.onmouseleave = () => { if (b.dataset.animal !== pick.animal) setPose(box, "idle", 0, b.dataset.animal); };
      b.onclick = () => {
        pick.animal = b.dataset.animal;
        $$(".pick").forEach((x) => {
          x.classList.toggle("sel", x === b);
          setPose(x.querySelector(".pet-box"), x === b ? "happy" : "idle", 0, x.dataset.animal);
        });
        setPose($("#choosePreview"), "happy", 0, pick.animal);
        bump($("#choosePreview"), "jump");
      };
    });
    $("#petName").oninput = (e) => (pick.name = e.target.value);
    $("#nameForm").onsubmit = (e) => {
      e.preventDefault();
      const name = $("#petName").value.trim();
      if (!name) return;
      if (pet && !confirm(`Текущий питомец ${pet.name} будет заменён. Продолжить?`)) return;
      pet = Game.newPet(name, pick.animal);
      Game.savePet(pet);
      learn = { topic: pet.topic, level: pet.level };
      pick = { animal: pick.animal, name: "" };
      confetti();
      go("#/");
      toast(`Привет, ${esc(name)}!`, "♥");
    };
  }

  // ============================================================
  //  Переключение страниц
  // ============================================================
  const ROUTES = { "": home, learn: learnPage, quiz: quizPage, cards: cardsPage, review: reviewPage, ielts: ieltsPage, account: accountPage, tutor: tutorPage, admin: adminPage, focus: focusPage, my: myPage, new: choosePage };
  const NAV = { "": "home", learn: "learn", quiz: "learn", cards: "cards", review: "cards", ielts: "ielts", account: "account", tutor: "tutor", admin: "admin", focus: "focus", my: "my", new: "" };
  const currentRoute = () => NAV[location.hash.replace(/^#\/?/, "")] || "home";

  function render() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    let name = location.hash.replace(/^#\/?/, "");
    if (!(name in ROUTES)) name = "";
    if (!pet && name !== "account") name = "new";
    view.className = "";
    void view.offsetWidth;        // перезапуск анимации появления страницы
    view.className = "wrap view";
    ROUTES[name]();
    updateHeader(NAV[name]);
    updateTimerChip();
    Api.visit(name || "home");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  /** Перейти на страницу. Если адрес тот же самый, браузер не пришлёт hashchange — тогда рисуем сами. */
  function go(hash) {
    if (location.hash === hash || (hash === "#/" && location.hash === "")) render();
    else location.hash = hash;
  }
  window.addEventListener("hashchange", render);
  render();
  Api.checkServer().then(() => updateHeader(currentRoute()));
})();
