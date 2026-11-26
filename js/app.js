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
    $$("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === route));
    const dueN = Cards.due().length;   // сколько карточек ждут повторения
    $("#dueBadge").textContent = dueN || "";
    $("#dueBadge").classList.toggle("on", dueN > 0);
    if ($("#coinBadge")) $("#coinBadge").textContent = pet ? "🪙 " + (pet.coins || 0) : "";
    $("#nav").style.visibility = pet ? "" : "hidden";
    // полоска сверху на телефоне: название раздела и аватарка питомца
    const cur = $(`#nav a[data-route="${route}"]`);
    $("#mtopTitle").textContent = cur ? cur.querySelector(".lbl").textContent : ({ account: "Аккаунт", rest: "Отдых", admin: "Админка", privacy: "Конфиденциальность", shop: "Магазин" }[route] || "Bilim Buddy");
    $("#mtopPet").innerHTML = pet ? Pets.petSVG(pet.animal, "idle", { fx: false }) : "";
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
      <span class="ln"><b>${esc(pet.name)}</b> · ур. ${Game.level(pet)}${Game.dayStreak() ? ` · 🔥${Game.dayStreak()}` : ""}</span>
      <span class="mini-xp"><span style="width:${(Game.xpInLevel(pet) / Game.XP_PER_LEVEL) * 100}%"></span></span>`;
  }

  // ---------- боковое меню: свернуть на компьютере, выдвинуть на телефоне ----------
  const SIDE_KEY = "petTeacher.sideMini";
  try { document.body.classList.toggle("side-mini", localStorage.getItem(SIDE_KEY) === "1"); } catch (e) {}
  $("#sideToggle").onclick = () => {
    const mini = document.body.classList.toggle("side-mini");
    $("#sideToggle").title = mini ? "Развернуть меню" : "Свернуть меню";
    try { localStorage.setItem(SIDE_KEY, mini ? "1" : "0"); } catch (e) {}
  };
  const closeMenu = () => document.body.classList.remove("menu-open");
  $("#menuOpen").onclick = () => document.body.classList.add("menu-open");
  $("#menuClose").onclick = closeMenu;
  $("#sideDim").onclick = closeMenu;
  $$("#side a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

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

  // ---------- план на день ----------
  function planCard() {
    const plan = Game.dailyPlan();
    const streak = Game.dayStreak();
    const doneN = plan.filter((p) => p.done).length;
    const all = doneN === plan.length;
    const claimed = Game.dayStats().planClaimed;
    const risk = streak > 0 && !Game.todayCounts();
    const note = all ? (claimed ? `План выполнен! Награда получена: +${Game.PLAN_REWARD.xp} XP и ${Game.PLAN_REWARD.coins} монет.` : "План выполнен!")
      : risk ? `Сделай хотя бы один пункт, чтобы не потерять серию в ${streak} ${plural(streak, "день", "дня", "дней")}.`
      : doneN ? "Серия на сегодня засчитана. Выполни весь план — получишь награду." : `Выполни весь план и получи +${Game.PLAN_REWARD.xp} XP и ${Game.PLAN_REWARD.coins} монет.`;
    return `<div class="card plan ${all ? "all" : ""}">
      <div class="plan-head">
        <div><h2>План на сегодня</h2><p class="muted">${note}</p></div>
        <div class="streak ${streak ? "on" : ""} ${risk ? "risk" : ""}" title="Дней подряд, когда ты выполнял(а) хотя бы один пункт плана">
          <span class="fire">🔥</span><b>${streak}</b><span>${plural(streak, "день", "дня", "дней")} подряд</span></div>
      </div>
      <div class="plan-list">${plan.map((p) => `<a class="plan-item ${p.done ? "done" : ""}" href="${p.href}">
        <span class="plan-check">${p.done ? "✓" : ""}</span>
        <span class="plan-t">${p.title}<span class="plan-bar"><i style="width:${(p.got / p.goal) * 100}%"></i></span></span>
        <span class="plan-n">${p.got}/${p.goal}</span></a>`).join("")}</div>
    </div>`;
  }
  /** Весь план выполнен — праздник и награда (срабатывает из Game.track). */
  window.addEventListener("plan-complete", () => {
    if (!pet) return;
    const r = Game.claimPlan(pet);
    if (!r) return;
    confetti();
    toast(`План на день выполнен! +${r.xp} XP и ${r.coins} монет`, "🔥");
    updateHeader(currentRoute());
    if ($("#planBox")) $("#planBox").innerHTML = planCard();
  });

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

      <section class="section reveal" id="planBox">${planCard()}</section>

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
              <p class="muted">Две минуты отдыха: дыхание, разминка или мини-игра. Настроение растёт, но тратится энергия.</p>
              <div class="chips"><span class="chip">2 минуты</span><span class="chip">+3 настроения</span><span class="chip">−2 энергии</span></div>
              <button class="btn btn-sun" id="actPlay"><span class="lbl-long">Сделать перерыв</span><span class="lbl-short">Играть</span></button>
            </div>
          </article>
          <article class="card action-card">
            <div class="art">${petBox("sleep", "", "sleepPet")}</div>
            <div class="body">
              <h3>Отдых</h3>
              <p class="muted">Подушка, колпак и крепкий сон на 5 минут. Пока питомец спит, учёба закрыта.</p>
              <div class="chips"><span class="chip">5 минут</span><span class="chip">+4 энергии</span></div>
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
      if (Game.restState(pet)) { go("#/rest"); return; }
      const r = Game.play(pet);
      if (!r.ok) { setPose($("#heroPet"), "sad", 2500); bump($("#heroPet"), "shake"); say(r.text); toast(r.text, "!"); return; }
      toast(r.text, "♪");
      go("#/rest");
    };
    $("#actSleep").onclick = () => {
      if (Game.restState(pet)) { go("#/rest"); return; }
      const r = Game.sleep(pet);
      if (!r.ok) { say(r.text); toast(r.text, "!"); return; }
      toast(r.text, "☾");
      go("#/rest");
    };
    const rs = Game.restState(pet);
    if (rs) {
      const sl = rs.kind === "sleep";
      $("#mood").textContent = sl ? "Zzz… (питомец спит, учёба закрыта)" : "У меня перерыв! Скоро вернусь к учёбе.";
      const btn = $(sl ? "#actSleep" : "#actPlay");
      btn.innerHTML = sl ? "Сон идёт · открыть" : "Перерыв идёт · открыть";
      $$('a[href="#/learn"]', view).forEach((a) => { a.classList.add("locked"); a.title = sl ? "Питомец спит" : "Идёт перерыв"; });
    }
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

      ${learn.topic === "Английский" ? `<a class="card test-banner" href="#/test">
        <span class="land-ic">A?</span>
        <span><b>${pet.placement ? `Твой уровень по тесту: ${esc(pet.placement.level)}` : "Не знаешь свой уровень английского?"}</b>
          <span class="muted">${pet.placement ? "Можно пройти тест ещё раз." : "Пройди тест из 20 вопросов (5–7 минут) — сайт подскажет, с какого уровня начать."}</span></span>
        <span class="btn btn-sm">${pet.placement ? "Пройти снова" : "Пройти тест"}</span></a>` : ""}

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
            ${Game.TOPICS[learn.topic] && learn.level !== Game.TRAINER && learn.level !== Game.ALL ? `<button class="btn btn-ghost btn-sm" id="aiMore" title="ИИ составит 10 новых вопросов этой темы и уровня">✦ Новые от ИИ</button>` : ""}
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
    if ($("#aiMore")) $("#aiMore").onclick = () => moreFromAI($("#aiMore"));

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
        quiz.chosen = b.dataset.v;
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
        quiz.chosen = inp.value.trim();
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
        ${ok ? "" : `<button class="btn btn-ghost btn-sm" id="whyBtn">Почему?</button>`}
        <button class="btn btn-sm ${ok ? "" : "btn-white"}" id="nextQ">Дальше <span class="arr">${I.arrow}</span></button>
      </div>
      <div id="whyBox"></div>`;
    $("#nextQ").onclick = nextQuestion;
    $("#nextQ").focus({ preventScroll: true });
    const whyBtn = $("#whyBtn");
    if (whyBtn) whyBtn.onclick = () => explainMistake(q, quiz.chosen, whyBtn);
    drawSectionProgress(Game.loadQuestions());
    if (res.sectionDone) sectionComplete(q);
  }

  /** «Почему?» после ошибки: готовое объяснение (у вопросов от ИИ) или короткий ответ ИИ-учителя. */
  async function explainMistake(q, chosen, btn) {
    const box = $("#whyBox");
    const more = `<button class="btn btn-ghost btn-sm" id="askT">Спросить учителя подробнее</button>`;
    const show = (html) => {
      box.innerHTML = `<div class="why card">${html}<div class="row">${more}</div></div>`;
      $("#askT").onclick = () => askTutor(`Объясни, пожалуйста, вопрос: «${q.question}». Правильный ответ — «${q.answer}». Почему именно так? Как это запомнить?`);
    };
    btn.disabled = true;
    if (q.explain) { show(`<p>${esc(q.explain)}</p>`); return; }
    if (!Api.auth()) { show(`<p>Объяснения от ИИ доступны после входа в аккаунт. <a href="#/account">Войти</a></p>`); return; }
    box.innerHTML = `<div class="why card"><p class="muted">Учитель думает…</p></div>`;
    try {
      const r = await Api.req("POST", "/api/ai/explain", { question: q.question, answer: q.answer, chosen: chosen || "" });
      show(md(r.text));
    } catch (e) { show(`<p>${esc(e.message)}</p>`); btn.disabled = false; }
  }

  /** «Новые от ИИ»: 10 новых вопросов текущей темы и уровня. */
  async function moreFromAI(btn) {
    if (!Api.auth()) { toast("Задания от ИИ доступны после входа в аккаунт", "!"); go("#/account"); return; }
    const all = Game.loadQuestions().filter((q) => q.topic === learn.topic && q.level === learn.level);
    btn.disabled = true;
    btn.textContent = "ИИ составляет вопросы…";
    try {
      const r = await Api.req("POST", "/api/ai/questions", {
        topic: learn.topic, level: learn.level, count: 10,
        examples: all.filter((q) => !q.ai).slice(0, 6).map((q) => [q.question, q.answer]),
        avoid: all.map((q) => q.question).slice(-80),
      });
      Game.addAIQuestions(r.questions.map((q) => ({ topic: learn.topic, level: learn.level, ...q })));
      toast(`Добавлено ${r.questions.length} новых вопросов от ИИ`, "✦");
      drawSectionProgress(Game.loadQuestions());
      if (quiz && quiz.answered) nextQuestion();
    } catch (e) { toast(esc(e.message), "!"); }
    btn.disabled = false;
    btn.textContent = "✦ Новые от ИИ";
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
      ${next && next !== Game.TRAINER ? `<button class="btn btn-sun btn-sm" id="nextLevel">Уровень ${esc(next)} <span class="arr">${I.arrow}</span></button>` : ""}
      <button class="btn btn-ghost btn-sm" id="aiMore2">✦ Ещё 10 от ИИ</button>`;
    $("#fb").append(box);
    $("#aiMore2").onclick = () => moreFromAI($("#aiMore2"));
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

  let ielts = { tab: "listening", part: 1, p1: 0, p2: 0, q: 0, wkind: "t2", widx: 0, lpart: 1, lrate: 1, laccent: "", rpass: 1, mkind: "writing" };
  ielts.p1 = rndIdx(IELTS.PART1);
  ielts.p2 = rndIdx(IELTS.PART2);
  ielts.widx = rndIdx(IELTS.TASK2);

  /** Опыт за задание — один раз за каждое (как и в обычных вопросах). */
  function ieltsReward(id, xp, text) {
    const d = ieltsData();
    if (d.done.includes(id)) {
      Game.track({ ielts: 1 });          // повтор тоже считается в план на день, но без опыта
      toast("Это задание уже засчитано — опыт не начисляется, но в план на день оно идёт", "✓");
      return;
    }
    d.done.push(id);
    ieltsSave(d);
    const old = Game.level(pet);
    pet.xp += xp;
    pet.coins = (pet.coins || 0) + 5;
    pet.fun = Math.min(10, pet.fun + 1);
    Game.savePet(pet);
    Game.track({ ielts: 1, xp });
    toast(`${text} +${xp} XP и 5 монет`, "★");
    if (Game.level(pet) > old) { confetti(); toast(`Новый уровень ${Game.level(pet)}!`, "★"); }
    updateHeader("ielts");
  }

  function ieltsPage() {
    const d = ieltsData();
    view.innerHTML = `
      <section class="page-head reveal">
        <div>
          <span class="eyebrow" style="--i:0">IELTS</span>
          <h1 style="--i:1">Мини-подготовка к IELTS</h1>
          <p style="--i:2">Все четыре части экзамена: Listening, Reading, Speaking и Writing. Задания в точном формате IELTS,
            проверка ответов, примерный band и образцы ответов уровня 8–9.</p>
        </div>
        ${petBox("focus")}
      </section>
      <div class="ielts-tabs">
        <div class="modes light" id="ieltsTabs">
          ${[["listening", "Listening"], ["reading", "Reading"], ["speaking", "Speaking"], ["writing", "Writing"], ["models", "Образцы"], ["mock", "Пробный экзамен"]]
            .map(([k, n]) => `<button data-tab="${k}" class="${ielts.tab === k ? "sel" : ""}">${n}</button>`).join("")}
        </div>
        <span class="muted">Выполнено заданий: <b>${d.done.length}</b> · эссе сохранено: <b>${d.essays.length}</b></span>
      </div>
      <section class="quiz" style="margin-top:18px">
        <div class="quiz-card" id="ieltsMain"></div>
        <aside class="quiz-side">
          ${ieltsSide()}
        </aside>
      </section>`;
    $$("#ieltsTabs button").forEach((b) => b.onclick = () => { ielts.tab = b.dataset.tab; ieltsPage(); });
    ({ listening: listeningView, reading: readingView, speaking: speakingView, writing: writingView, models: modelsView, mock: mockView })[ielts.tab]();
  }

  /** Правая колонка IELTS: критерии и советы для текущей вкладки. */
  function ieltsSide() {
    const official = `<div class="card white"><b>Официальные пробные тесты</b>
      <span class="hint">Настоящие задания экзамена секретные. Официальные примеры бесплатно публикуют сами организаторы:</span>
      <div class="links">${IELTS_LR.OFFICIAL.map((o) => `<a href="${o.url}" target="_blank" rel="noopener">${esc(o.name)} ↗</a>`).join("")}</div></div>`;
    if (ielts.tab === "mock") return `
          <div class="card white"><b>Советы на экзамен</b>
            <ul class="side-list">
              <li>Перед каждой частью Listening быстро прочитай вопросы и подчеркни ключевые слова.</li>
              <li>В Reading не застревай на одном вопросе: пропусти и вернись в конце.</li>
              <li>Следи за лимитом слов в пропусках: «ONE WORD» — значит одно слово.</li>
              <li>В Writing оставь 5 минут, чтобы перечитать эссе и исправить ошибки.</li>
            </ul></div>${official}`;
    if (ielts.tab === "speaking" || ielts.tab === "writing") return `
          <div class="card white">
            <b>Как оценивают ${ielts.tab === "speaking" ? "Speaking" : "Writing"}</b>
            <div class="crit">${IELTS.CRITERIA[ielts.tab].map(([n, t]) => `<label><input type="checkbox"><span><b>${n}</b>${t}</span></label>`).join("")}</div>
            <span class="hint">Отмечай, что получилось — это самопроверка. Оценивают по шкале band 0–9.</span>
          </div>
          <div class="card white ai-soon">
            <b>Проверка ИИ-учителем</b>
            <span class="hint">${ielts.tab === "writing" ? "Под текстом есть кнопка «Проверить ИИ»: экзаменатор оценит работу по 4 критериям и покажет ошибки."
              : "Есть вопрос по ответу или лексике? Спроси на странице «ИИ-учитель»."}</span>
          </div>`;
    if (ielts.tab === "listening") return `
          <div class="card white"><b>Как устроен Listening</b>
            <ul class="side-list">
              <li>4 части, 40 вопросов, около 30 минут.</li>
              <li><b>Part 1–2</b> — бытовые темы, <b>Part 3–4</b> — учёба и лекция.</li>
              <li>Запись звучит <b>один раз</b>. Читай вопросы заранее.</li>
              <li>Следи за лимитом слов: «ONE WORD AND/OR A NUMBER».</li>
              <li>Орфография важна: ошибка в слове = неверный ответ.</li>
            </ul>
            <span class="hint">Здесь текст читает голос браузера: он звучит чуть роботизированно, но темп и формат как на экзамене.</span>
          </div>${official}`;
    if (ielts.tab === "reading") return `
          <div class="card white"><b>Как устроен Reading</b>
            <ul class="side-list">
              <li>3 текста, 40 вопросов, 60 минут — по 20 минут на текст.</li>
              <li>Сначала пробеги текст глазами за 2–3 минуты, потом читай вопросы.</li>
              <li><b>TRUE / FALSE / NOT GIVEN</b> — про факты, <b>YES / NO / NOT GIVEN</b> — про мнение автора.</li>
              <li>Ответы на вопросы одного типа обычно идут по порядку текста.</li>
            </ul>
          </div>${official}`;
    return `
          <div class="card white"><b>Как пользоваться образцами</b>
            <ul class="side-list">
              <li>Сначала напиши или скажи свой ответ, потом сравни с образцом.</li>
              <li>Выпиши 5–10 фраз, которых у тебя не было, и используй их в следующих ответах.</li>
              <li>Обрати внимание на структуру абзацев — её можно повторять в любой теме.</li>
            </ul>
          </div>${official}`;
  }

  // ---------- Listening, Reading, образцы: общие части ----------
  const TFNG = ["TRUE", "FALSE", "NOT GIVEN"];
  const YNG = ["YES", "NO", "NOT GIVEN"];
  const norm = (s) => String(s).toLowerCase().replace(/[£%.,!?"'’]/g, "").replace(/\s+/g, " ").trim();

  /** Вопросы одной части: группы с инструкциями, как в бланке экзамена. */
  function renderGroups(groups, start = 0) {
    let n = start;
    return groups.map((g) => `
      <div class="lr-group">
        <p class="lr-instr">${esc(g.instr)}</p>
        ${g.list && g.kind === "pick" && g.list.length > 3 ? `<div class="lr-list">${g.list.map(([k, t]) => `<span><b>${esc(k)}</b> ${esc(t)}</span>`).join("")}</div>` : ""}
        ${g.example ? `<p class="muted lr-ex">${esc(g.example)}</p>` : ""}
        ${g.title ? `<h4 class="lr-title">${esc(g.title)}</h4>` : ""}
        ${g.qs.map((q) => {
          n += 1;
          const id = `q${n}`;
          let input = "";
          if (q.type === "gap") {
            const [a, b] = q.text.split("___");
            input = `<span class="lr-gap">${esc(a)}<input class="input lr-in" data-q="${n}" id="${id}" autocomplete="off" autocapitalize="off" spellcheck="false">${esc(b || "")}</span>`;
            return `<div class="lr-q" data-n="${n}"><span class="lr-n">${n}</span>${input}<span class="lr-res"></span></div>`;
          }
          if (q.type === "mc") {
            input = q.options.map((o, i) => { const L = "ABC"[i]; return `<label class="lr-opt"><input type="radio" name="${id}" value="${L}" data-q="${n}"><b>${L}</b> ${esc(o)}</label>`; }).join("");
            return `<div class="lr-q" data-n="${n}"><span class="lr-n">${n}</span><div class="lr-body"><p>${esc(q.text)}</p>${input}</div><span class="lr-res"></span></div>`;
          }
          const opts = q.type === "tfng" ? (g.kind === "yng" ? YNG : TFNG) : g.list.map(([k]) => k);
          input = `<div class="lr-seg">${opts.map((o) => `<label><input type="radio" name="${id}" value="${esc(o)}" data-q="${n}"><span>${esc(o)}</span></label>`).join("")}</div>`;
          return `<div class="lr-q" data-n="${n}"><span class="lr-n">${n}</span><div class="lr-body"><p>${esc(q.text)}</p>${input}</div><span class="lr-res"></span></div>`;
        }).join("")}
      </div>`).join("");
  }

  /** Проверить ответы: подсветить верные и неверные, показать правильный ответ. */
  function checkGroups(groups, start = 0) {
    const all = groups.flatMap((g) => g.qs);
    let ok = 0;
    all.forEach((q, i) => {
      const n = start + i + 1;
      const row = $(`.lr-q[data-n="${n}"]`);
      let given = "";
      if (q.type === "gap") given = $(`#q${n}`).value;
      else { const r = $(`input[name="q${n}"]:checked`); given = r ? r.value : ""; }
      const good = q.type === "gap" ? q.answer.some((a) => norm(a).replace(/\s/g, "") === norm(given).replace(/\s/g, "")) : given === q.answer;
      if (good) ok++;
      row.classList.remove("good", "bad");
      row.classList.add(good ? "good" : "bad");
      row.querySelector(".lr-res").innerHTML = good ? "✓" : `✗ <b>${esc(q.type === "gap" ? q.answer[0] : q.answer)}</b>`;
    });
    return { ok, total: all.length };
  }

  function resultBox(ok, total, extra = "") {
    const b = IELTS_LR.band(ok, total);
    return `<div class="card lr-score">
      <div><b>${ok} / ${total}</b><span>верных ответов</span></div>
      <div><b>≈ ${b}</b><span>примерный band, если бы так прошёл весь тест из 40 вопросов</span></div>
      ${extra}</div>`;
  }

  function saveLR(id, ok, total) {
    const d = ieltsData();
    d.lr = d.lr || {};
    const prev = d.lr[id];
    if (!prev || ok > prev.ok) d.lr[id] = { ok, total, date: Date.now() };
    ieltsSave(d);
    ieltsReward(id, 10, `${id.startsWith("L") ? "Listening" : "Reading"}: ${ok}/${total}.`);
  }
  const bestLR = (id) => ((ieltsData().lr || {})[id]);

  // ---------- Listening ----------
  // Если для части есть готовые аудиофайлы (IELTS_LR.AUDIO), играем их в обычном плеере.
  // Если файлов нет — текст озвучивает браузер — по предложениям, чтобы пауза и бегунок работали.
  const FEMALE = /female|zira|hazel|susan|libby|sonia|serena|samantha|karen|moira|tessa|kate|fiona|victoria|emma|amy|olivia|natasha|aria|jenny|sara|martha|catherine|ava|michelle|ana|clara|molly|maisie|abbi|bella|hollie/i;
  const MALE = /(^|\W)male|david|george|ryan|daniel|arthur|oliver|thomas|mark|guy|alex|fred|james|william|brian|eric|christopher|liam|rishi|andrew|roger|steffan|ethan|noah|elliot|alfie/i;
  const ACCENT = { GB: "британский", AU: "австралийский", US: "американский", CA: "канадский", IE: "ирландский", NZ: "новозеландский", IN: "индийский", ZA: "южноафриканский" };
  const accentOf = (v) => ACCENT[(v.lang.split(/[-_]/)[1] || "").toUpperCase()] || v.lang;
  /** Насколько голос живой: «Natural»/«Online» (Edge) и Google звучат намного лучше старых системных. */
  const voiceScore = (v) => (/natural|neural/i.test(v.name) ? 40 : 0) + (/online/i.test(v.name) ? 20 : 0) + (/google/i.test(v.name) ? 15 : 0) + (/GB/i.test(v.lang) ? 5 : 0) - (v.localService ? 2 : 0);
  const enVoices = () => ("speechSynthesis" in window ? speechSynthesis.getVoices() : []).filter((v) => /^en[-_]/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a));

  /** Голоса для ролей. accent — код страны ("GB", "AU", …) или "" (лучшие голоса любого акцента). */
  function pickVoices(accent) {
    let all = enVoices();
    if (accent) { const a = all.filter((v) => (v.lang.split(/[-_]/)[1] || "").toUpperCase() === accent); if (a.length) all = a; }
    const f = all.filter((v) => FEMALE.test(v.name)), m = all.filter((v) => MALE.test(v.name) && !FEMALE.test(v.name));
    return {
      female: { v: f[0] || all[0], pitch: f[0] ? 1 : 1.2 },
      female2: { v: f[1] || f[0] || all[1] || all[0], pitch: f[1] ? 1 : 1.35 },
      male: { v: m[0] || all[1] || all[0], pitch: m[0] ? 1 : 0.8 },
    };
  }

  let lrPlaying = false, lrToken = 0, lrAudio = null;
  function stopSpeech() {
    lrPlaying = false; lrToken++;
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (lrAudio) { lrAudio.pause(); lrAudio = null; }
  }
  /** Запись по предложениям: [[роль, предложение], …] */
  const scriptLines = (test) => test.script.flatMap(([who, text]) => text.split(/(?<=[.!?])\s+/).map((t) => [who, t]));

  function listeningView() {
    stopIeltsTimer();
    stopSpeech();
    const box = $("#ieltsMain");
    const t = IELTS_LR.LISTENING[ielts.lpart - 1];
    const best = bestLR(t.id);
    const files = (IELTS_LR.AUDIO || {})[t.id] || null;     // {"GB": "audio/…mp3", "AU": …}
    const canSpeak = "speechSynthesis" in window;
    if (canSpeak) speechSynthesis.getVoices();               // Chrome загружает голоса не сразу
    const lines = scriptLines(t);

    box.innerHTML = `
      <div class="pills" id="lparts">${IELTS_LR.LISTENING.map((x) => `<button class="pill ${ielts.lpart === x.part ? "sel" : ""}" data-p="${x.part}">Part ${x.part}${bestLR(x.id) ? " ✓" : ""}</button>`).join("")}</div>
      <div class="q-in" style="margin-top:22px">
        <div class="q-num">Listening · Part ${t.part} · ${esc(t.title)}${best ? ` · лучший результат ${best.ok}/${best.total}` : ""}</div>
        <p class="muted">${esc(t.about)}</p>
      </div>
      <div class="card lp">
        <div class="lp-row">
          <button class="lp-btn" id="lPlay" aria-label="Слушать" ${files || canSpeak ? "" : "disabled"}>▶</button>
          <input type="range" class="lp-seek" id="lSeek" min="0" max="${files ? 1000 : lines.length - 1}" value="0" step="1" aria-label="Перемотка">
          <span class="lp-time" id="lTime"></span>
        </div>
        <div class="lp-row lp-opts">
          <label>Акцент <select id="lAccent"></select></label>
          <label>Скорость <select id="lRate">${[0.75, 0.85, 1, 1.15].map((r) => `<option value="${r}" ${ielts.lrate === r ? "selected" : ""}>${r === 1 ? "как на экзамене" : r + "×"}</option>`).join("")}</select></label>
        </div>
        <p class="hint" id="lHint">${files || canSpeak ? "Сначала прочитай вопросы, потом нажми ▶. Пауза — та же кнопка, бегунок перематывает." : "Этот браузер не умеет озвучивать текст. Попробуй Chrome, Edge или Safari."}</p>
      </div>
      <form id="lrForm" autocomplete="off">${renderGroups(t.groups)}</form>
      <div class="row" style="margin-top:18px">
        <button class="btn btn-sun" id="lCheck">Проверить ответы</button>
        <button class="btn btn-ghost" id="lReset">Сбросить</button>
      </div>
      <div id="lrOut"></div>`;

    $$("#lparts .pill").forEach((b) => b.onclick = () => { ielts.lpart = +b.dataset.p; listeningView(); });
    const play = $("#lPlay"), seek = $("#lSeek"), time = $("#lTime"), acc = $("#lAccent"), rateSel = $("#lRate");
    const setBtn = (on) => { play.textContent = on ? "❚❚" : "▶"; play.setAttribute("aria-label", on ? "Пауза" : "Слушать"); };

    // ----- вариант 1: готовые аудиофайлы -----
    if (files) {
      const keys = Object.keys(files);
      if (!keys.includes(ielts.laccent)) ielts.laccent = keys[0];
      acc.innerHTML = keys.map((k) => `<option value="${k}" ${k === ielts.laccent ? "selected" : ""}>${ACCENT[k] || k}</option>`).join("");
      const audio = new Audio(files[ielts.laccent]);
      audio.preload = "metadata";
      lrAudio = audio;
      const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
      const upd = () => {
        if (audio.duration) { seek.value = Math.round((audio.currentTime / audio.duration) * 1000); time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`; }
      };
      audio.playbackRate = ielts.lrate;
      audio.onloadedmetadata = upd;
      audio.ontimeupdate = upd;
      audio.onended = () => { setBtn(false); $("#lHint").textContent = "Запись закончилась. Проверь ответы и нажми «Проверить»."; };
      audio.onerror = () => { $("#lHint").textContent = "Не получилось загрузить запись. Проверь интернет и попробуй ещё раз."; };
      play.onclick = () => { if (audio.paused) { audio.play(); setBtn(true); } else { audio.pause(); setBtn(false); } };
      seek.oninput = () => { if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration; };
      rateSel.onchange = () => { ielts.lrate = +rateSel.value; audio.playbackRate = ielts.lrate; };
      acc.onchange = () => {
        const frac = audio.duration ? audio.currentTime / audio.duration : 0, was = !audio.paused;
        ielts.laccent = acc.value;
        audio.src = files[acc.value];
        audio.playbackRate = ielts.lrate;
        audio.onloadedmetadata = () => { audio.currentTime = frac * (audio.duration || 0); upd(); if (was) audio.play(); };
      };
      time.textContent = "0:00";
    } else {
      // ----- вариант 2: озвучка браузером -----
      let pos = 0;
      const fillAccents = () => {
        const have = [...new Set(enVoices().map((v) => (v.lang.split(/[-_]/)[1] || "").toUpperCase()))].filter((k) => ACCENT[k]);
        if (ielts.laccent && !have.includes(ielts.laccent)) ielts.laccent = "";
        acc.innerHTML = `<option value="">лучшие голоса</option>` + have.map((k) => `<option value="${k}" ${k === ielts.laccent ? "selected" : ""}>${ACCENT[k]}</option>`).join("");
      };
      fillAccents();
      if (canSpeak) speechSynthesis.onvoiceschanged = fillAccents;
      cleanup.push(() => { if (canSpeak) speechSynthesis.onvoiceschanged = null; });
      const show = () => {
        seek.value = pos;
        time.textContent = `${Math.min(pos + 1, lines.length)} / ${lines.length}`;
      };
      const speakFrom = (i) => {
        if (window.speechSynthesis) speechSynthesis.cancel();
        const my = ++lrToken;
        lrPlaying = true; setBtn(true);
        const voices = pickVoices(ielts.laccent);
        const say = (k) => {
          if (my !== lrToken) return;
          if (k >= lines.length) {
            lrPlaying = false; pos = 0; setBtn(false); show();
            $("#lHint").textContent = "Запись закончилась. Проверь ответы и нажми «Проверить».";
            return;
          }
          pos = k; show();
          const [who, text] = lines[k];
          const u = new SpeechSynthesisUtterance(text);
          const kind = voices[t.voices[who]] || voices.female;
          if (kind.v) { u.voice = kind.v; u.lang = kind.v.lang; } else u.lang = "en-GB";
          u.pitch = kind.pitch;
          u.rate = ielts.lrate;
          u.onend = () => { if (my === lrToken) setTimeout(() => say(k + 1), lines[k + 1] && lines[k + 1][0] !== who ? 350 : 120); };
          speechSynthesis.speak(u);
        };
        say(i);
      };
      play.onclick = () => {
        if (lrPlaying) { lrToken++; lrPlaying = false; speechSynthesis.cancel(); setBtn(false); return; }   // пауза: запоминаем место
        if (!enVoices().length) {
          $("#lHint").innerHTML = "В этом браузере нет английского голоса для озвучки. Открой сайт в Chrome, Edge или Safari (на телефоне тоже работает).";
          return;
        }
        const v = pickVoices(ielts.laccent).female.v;
        $("#lHint").textContent = v && !/natural|neural|online|google/i.test(v.name)
          ? "Голос в этом браузере простой и звучит неестественно. Лучше всего звучит в Microsoft Edge (голоса Natural) или Chrome."
          : "Идёт запись… Отвечай прямо во время прослушивания.";
        speakFrom(pos);
      };
      seek.oninput = () => { pos = +seek.value; show(); if (lrPlaying) speakFrom(pos); };
      rateSel.onchange = () => { ielts.lrate = +rateSel.value; if (lrPlaying) speakFrom(pos); };
      acc.onchange = () => { ielts.laccent = acc.value; if (lrPlaying) speakFrom(pos); };
      show();
    }

    cleanup.push(stopSpeech);
    $("#lrForm").onsubmit = (e) => e.preventDefault();
    $("#lReset").onclick = () => listeningView();
    $("#lCheck").onclick = () => {
      if (lrAudio) { lrAudio.pause(); } else { lrToken++; lrPlaying = false; if (window.speechSynthesis) speechSynthesis.cancel(); }
      setBtn(false);
      const { ok, total } = checkGroups(t.groups);
      saveLR(t.id, ok, total);
      $("#lrOut").innerHTML = resultBox(ok, total, `<p class="lr-tip"><b>Совет:</b> ${esc(t.tips)}</p>`) + `
        <details class="lr-script"><summary>Показать текст записи (transcript)</summary>
          ${t.script.map(([who, text]) => `<p><b>${esc(who)}:</b> ${esc(text)}</p>`).join("")}
        </details>`;
      $("#lrOut").scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }

  // ---------- Пробный экзамен: Listening (40) → Reading (40) → Writing Task 2 ----------
  let mock = null;
  const roundBand = (x) => Math.round(x * 2) / 2;
  function mockView() {
    stopIeltsTimer();
    stopSpeech();
    const box = $("#ieltsMain");
    if (!mock) {
      const best = ieltsData().mock;
      box.innerHTML = `
        <div class="q-in"><div class="q-num">Пробный экзамен IELTS Academic</div>
          <h2 class="q-text">Как настоящий экзамен — от начала до конца</h2></div>
        <ol class="mock-steps">
          <li><b>Listening · ~30 минут.</b> Все 4 части подряд, 40 вопросов. Запись звучит один раз — паузы нет, как на экзамене.</li>
          <li><b>Reading · 60 минут.</b> Три текста, 40 вопросов. Когда время кончится, ответы сдадутся сами.</li>
          <li><b>Writing · 40 минут.</b> Эссе Task 2 (от 250 слов). ИИ-экзаменатор поставит примерный band${Api.auth() ? "" : " (нужно войти в аккаунт)"}.</li>
        </ol>
        <p class="hint">Speaking в пробный экзамен не входит — тренируй его во вкладке «Speaking». Не закрывай страницу до конца: прогресс экзамена не сохраняется.
          Нужно около 2 часов и наушники.</p>
        ${best ? `<p class="muted">Прошлый результат: overall <b>${best.overall}</b> (L ${best.l} · R ${best.r}${best.w ? ` · W ${best.w}` : ""}), ${new Date(best.date).toLocaleDateString("ru-RU")}.</p>` : ""}
        <div class="row" style="margin-top:16px"><button class="btn btn-sun" id="mStart">Начать экзамен <span class="arr">${I.arrow}</span></button></div>`;
      $("#mStart").onclick = () => {
        const acc = ["GB", "AU", "GB", "US"];
        mock = { stage: "listening", accents: acc, l: 0, r: 0, w: null };
        mockView();
      };
      return;
    }
    if (mock.stage === "listening") return mockListening(box);
    if (mock.stage === "reading") return mockReading(box);
    if (mock.stage === "writing") return mockWriting(box);
    return mockResult(box);
  }

  function mockListening(box) {
    const parts = IELTS_LR.LISTENING;
    let start = 0;
    const html = parts.map((t) => { const h = `<h3 class="mock-part">Part ${t.part} · вопросы ${start + 1}–${start + 10}</h3>${renderGroups(t.groups, start)}`; start += 10; return h; }).join("");
    box.innerHTML = `
      <div class="q-num">Пробный экзамен · Listening · 40 вопросов</div>
      <div class="card lp"><div class="lp-row">
        <button class="lp-btn" id="mPlay" aria-label="Начать">▶</button>
        <span id="mNow" class="muted">Прочитай вопросы Part 1 и нажми ▶. Дальше части пойдут подряд без остановки.</span>
      </div></div>
      <form id="lrForm" autocomplete="off">${html}</form>
      <div class="row" style="margin-top:18px"><button class="btn btn-sun" id="mNext">Сдать Listening и перейти к Reading</button></div>`;
    let k = 0;
    const audio = new Audio();
    lrAudio = audio;
    const playPart = () => {
      if (k >= parts.length) { $("#mNow").textContent = "Запись закончилась. Проверь ответы и нажми «Сдать Listening»."; return; }
      const files = (IELTS_LR.AUDIO || {})[parts[k].id];
      if (!files) { $("#mNow").textContent = "Аудио не найдено."; return; }
      audio.src = files[mock.accents[k]] || Object.values(files)[0];
      audio.play();
      $("#mNow").textContent = `Сейчас звучит Part ${k + 1} из 4…`;
    };
    audio.onended = () => { k++; setTimeout(playPart, 2500); };
    $("#mPlay").onclick = () => { $("#mPlay").disabled = true; playPart(); };
    cleanup.push(() => audio.pause());
    $("#mNext").onclick = () => {
      if (k < parts.length && !confirm("Запись ещё не закончилась. Всё равно сдать Listening?")) return;
      audio.pause();
      mock.l = checkGroups(parts.flatMap((t) => t.groups)).ok;
      mock.stage = "reading";
      mockView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  function mockReading(box) {
    const ps = IELTS_LR.READING;
    let start = 0;
    const html = ps.map((r, i) => {
      const h = `<h3 class="mock-part">Passage ${i + 1} · вопросы ${start + 1}–${start + 10}</h3>
        <article class="lr-passage"><h2>${esc(r.title)}</h2>${r.paras.map(([k, t]) => `<p><b class="lr-para">${esc(k)}</b>${esc(t)}</p>`).join("")}</article>
        ${renderGroups(r.groups, start)}`;
      start += 10;
      return h;
    }).join("");
    const total = start;
    box.innerHTML = `
      <div class="q-num">Пробный экзамен · Reading · ${total} вопросов</div>
      <div class="w-bar mock-timer"><span class="chip" id="mT">${mmss(60 * 60)}</span><span class="muted">Время идёт. Совет: ~20 минут на текст.</span></div>
      <form id="lrForm" autocomplete="off">${html}</form>
      <div class="row" style="margin-top:18px"><button class="btn btn-sun" id="mNext">Сдать Reading и перейти к Writing</button></div>`;
    let left = mock.rLeft || 60 * 60;
    const finish = () => {
      stopIeltsTimer();
      mock.r = checkGroups(ps.flatMap((r) => r.groups)).ok;
      mock.rTotal = total;
      mock.stage = "writing";
      mockView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    ieltsTimer = setInterval(() => {
      left -= 1;
      mock.rLeft = left;
      const t = $("#mT");
      if (!t) return stopIeltsTimer();
      t.textContent = mmss(Math.max(0, left));
      t.className = "chip " + (left <= 300 ? "bad" : "");
      if (left <= 0) { Timer.chime(); toast("Время Reading вышло — ответы сданы", "!"); finish(); }
    }, 1000);
    cleanup.push(stopIeltsTimer);
    $("#mNext").onclick = () => { if (confirm("Сдать Reading? Вернуться к нему будет нельзя.")) finish(); };
  }

  function mockWriting(box) {
    if (!mock.task) mock.task = IELTS.TASK2[Math.floor(Math.random() * IELTS.TASK2.length)];
    const task = mock.task;
    box.innerHTML = `
      <div class="q-num">Пробный экзамен · Writing Task 2 · 40 минут · от 250 слов</div>
      <div class="cue"><b>${esc(task.type)}</b><p>${esc(task.text)}</p></div>
      <div class="w-bar mock-timer"><span class="chip" id="mT">${mmss(40 * 60)}</span><span class="chip" id="mWc">0 слов</span></div>
      <textarea class="input w-text" id="mText" rows="16" placeholder="Write your essay here...">${esc(mock.text || "")}</textarea>
      <div class="row" style="margin-top:14px"><button class="btn btn-sun" id="mNext">Сдать экзамен</button></div>`;
    const ta = $("#mText");
    const wc = () => { const n = (ta.value.trim().match(/\S+/g) || []).length; $("#mWc").textContent = `${n} слов`; mock.text = ta.value; return n; };
    ta.oninput = wc; wc();
    let left = mock.wLeft || 40 * 60;
    const finish = () => { stopIeltsTimer(); mock.stage = "result"; mockView(); window.scrollTo({ top: 0, behavior: "smooth" }); };
    ieltsTimer = setInterval(() => {
      left -= 1;
      mock.wLeft = left;
      const t = $("#mT");
      if (!t) return stopIeltsTimer();
      t.textContent = mmss(Math.max(0, left));
      t.className = "chip " + (left <= 300 ? "bad" : "");
      if (left <= 0) { Timer.chime(); toast("40 минут прошло — работа сдана", "!"); finish(); }
    }, 1000);
    cleanup.push(stopIeltsTimer);
    $("#mNext").onclick = () => {
      if (wc() < 150 && !confirm("В эссе меньше 150 слов — на экзамене за это сильно снижают оценку. Всё равно сдать?")) return;
      finish();
    };
  }

  async function mockResult(box) {
    const L = IELTS_LR.band(mock.l, 40), R = IELTS_LR.band(mock.r, mock.rTotal || 30);
    const show = () => {
      const bands = [L, R].concat(typeof mock.w === "number" ? [mock.w] : []);
      const overall = roundBand(bands.reduce((a, b) => a + b, 0) / bands.length);
      box.innerHTML = `
        <div class="q-num">Пробный экзамен · результат</div>
        <div class="mock-res">
          <div class="mock-band big"><span>Overall</span><b>${overall.toFixed(1)}</b></div>
          <div class="mock-band"><span>Listening</span><b>${Number(L).toFixed(1)}</b><em>${mock.l}/40</em></div>
          <div class="mock-band"><span>Reading</span><b>${Number(R).toFixed(1)}</b><em>${mock.r}/${mock.rTotal || 30}</em></div>
          <div class="mock-band"><span>Writing</span><b>${typeof mock.w === "number" ? mock.w.toFixed(1) : "—"}</b><em>${mock.wNote || ""}</em></div>
        </div>
        <p class="hint">Это примерная оценка на заданиях Bilim Buddy, а не официальный результат. Overall посчитан без Speaking.</p>
        <div id="mAi"></div>
        <div class="row" style="margin-top:16px"><button class="btn btn-sun" id="mAgain">Пройти ещё раз</button></div>`;
      $("#mAgain").onclick = () => { mock = null; mockView(); };
      return overall;
    };
    if (mock.w === null && !mock.wTried) {
      mock.wTried = true;
      const words = ((mock.text || "").trim().match(/\S+/g) || []).length;
      if (!Api.auth()) { mock.wNote = "войди, чтобы ИИ оценил эссе"; }
      else if (words < 40) { mock.wNote = "эссе слишком короткое"; }
      else {
        box.innerHTML = `<div class="ai-wait"><span class="msg assistant typing"><span></span><span></span><span></span></span> Экзаменатор проверяет эссе… (до минуты)</div>`;
        try {
          const r = await Api.req("POST", "/api/tutor/essay", { kind: "Task 2 · эссе", prompt: mock.task.text, text: mock.text });
          mock.w = typeof r.overall === "number" ? r.overall : null;
          mock.ai = r;
          mock.wNote = `${words} слов`;
        } catch (e) { mock.wNote = "ИИ не ответил"; }
      }
    }
    const overall = show();
    if (mock.ai) $("#mAi").innerHTML = `<details class="lr-script"><summary>Разбор эссе от ИИ</summary>
      ${(mock.ai.criteria || []).map((c) => `<p><b>${esc(c.name)} — ${esc(String(c.band))}.</b> ${esc(c.comment)}</p>`).join("")}
      ${(mock.ai.improve || []).length ? `<p><b>Что улучшить:</b></p><ul>${mock.ai.improve.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</details>`;
    if (!mock.saved) {
      mock.saved = true;
      const d = ieltsData();
      d.mock = { overall: overall.toFixed(1), l: L, r: R, w: typeof mock.w === "number" ? mock.w : null, date: Date.now() };
      ieltsSave(d);
      pet.xp += 40; pet.coins = (pet.coins || 0) + 20; Game.savePet(pet);
      Game.track({ ielts: 1, xp: 40 });
      confetti();
      toast("Пробный экзамен пройден! +40 XP и 20 монет", "★");
      updateHeader("ielts");
    }
  }

  // ---------- Reading ----------
  function readingView() {
    stopIeltsTimer();
    stopSpeech();
    const box = $("#ieltsMain");
    const r = IELTS_LR.READING[ielts.rpass - 1];
    const best = bestLR(r.id);
    box.innerHTML = `
      <div class="pills" id="rparts">${IELTS_LR.READING.map((x, i) => `<button class="pill ${ielts.rpass === i + 1 ? "sel" : ""}" data-p="${i + 1}">Passage ${i + 1}${bestLR(x.id) ? " ✓" : ""}</button>`).join("")}</div>
      <div class="q-num" style="margin-top:22px">Reading · ${esc(r.level)} · 10 вопросов · 20 минут${best ? ` · лучший результат ${best.ok}/${best.total}` : ""}</div>
      <div class="w-bar" style="margin-top:10px">
        <span class="chip" id="rt">${mmss(20 * 60)}</span>
        <button class="btn btn-ghost btn-sm" id="rStart">Старт таймера</button>
      </div>
      <article class="lr-passage">
        <h2>${esc(r.title)}</h2>
        ${r.paras.map(([k, t]) => `<p><b class="lr-para">${esc(k)}</b>${esc(t)}</p>`).join("")}
      </article>
      <form id="lrForm" autocomplete="off">${renderGroups(r.groups)}</form>
      <div class="row" style="margin-top:18px">
        <button class="btn btn-sun" id="rCheck">Проверить ответы</button>
        <button class="btn btn-ghost" id="rReset">Сбросить</button>
      </div>
      <div id="lrOut"></div>`;
    $$("#rparts .pill").forEach((b) => b.onclick = () => { ielts.rpass = +b.dataset.p; readingView(); });
    $("#lrForm").onsubmit = (e) => e.preventDefault();
    $("#rReset").onclick = () => readingView();
    $("#rStart").onclick = () => {
      if (ieltsTimer) { stopIeltsTimer(); $("#rStart").textContent = "Продолжить"; return; }
      let left = ielts.rLeft && ielts.rLeftId === r.id ? ielts.rLeft : 20 * 60;
      $("#rStart").textContent = "Пауза";
      ieltsTimer = setInterval(() => {
        left -= 1;
        ielts.rLeft = left; ielts.rLeftId = r.id;
        $("#rt").textContent = mmss(Math.max(0, left));
        $("#rt").className = "chip " + (left <= 180 ? "bad" : "");
        if (left <= 0) { stopIeltsTimer(); Timer.chime(); toast("20 минут прошло! На экзамене пора переходить к следующему тексту.", "!"); }
      }, 1000);
      cleanup.push(stopIeltsTimer);
    };
    $("#rCheck").onclick = () => {
      stopIeltsTimer();
      ielts.rLeft = null;
      const { ok, total } = checkGroups(r.groups);
      saveLR(r.id, ok, total);
      $("#lrOut").innerHTML = resultBox(ok, total, `<p class="lr-tip"><b>Совет:</b> NOT GIVEN — когда в тексте об этом просто ничего не сказано. FALSE — когда текст говорит обратное. Не додумывай за автора.</p>`);
      $("#lrOut").scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }

  // ---------- Образцы ответов ----------
  function modelsView() {
    stopIeltsTimer();
    stopSpeech();
    const box = $("#ieltsMain");
    const list = ielts.mkind === "writing" ? IELTS_MODELS.WRITING : IELTS_MODELS.SPEAKING;
    box.innerHTML = `
      <div class="pills" id="mkinds">
        <button class="pill ${ielts.mkind === "writing" ? "sel" : ""}" data-k="writing">Эссе и письма</button>
        <button class="pill ${ielts.mkind === "speaking" ? "sel" : ""}" data-k="speaking">Ответы Speaking</button>
      </div>
      <p class="muted" style="margin-top:16px">Ответы уровня band 8–9 на задания с этого сайта. Не заучивай их: экзаменаторы сразу узнают выученный текст.
        Смотри, <b>как</b> они построены, и бери приёмы и фразы в свои ответы.</p>
      <div class="models">${list.map((m, i) => `
        <details class="model" ${i === 0 ? "open" : ""}>
          <summary><span class="chip good">band ${esc(m.band)}</span><b>${esc(m.kind)}</b></summary>
          ${m.prompt ? `<p class="model-prompt">${esc(m.prompt)}</p>` : ""}
          ${m.text ? `<div class="model-text">${m.text.split(/\n\n+/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}</div><span class="hint">${wordCount(m.text)} слов</span>` : ""}
          ${m.items ? m.items.map(([q, a]) => `<div class="model-qa"><p class="model-q">${esc(q)}</p><div class="model-text">${a.split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join("")}</div></div>`).join("") : ""}
          <div class="model-why"><b>Почему это высокий балл</b><ul>${m.why.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>
        </details>`).join("")}</div>`;
    $$("#mkinds .pill").forEach((b) => b.onclick = () => { ielts.mkind = b.dataset.k; modelsView(); });
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
        </div>
        <details class="card danger-zone"><summary>Удалить аккаунт</summary>
          <p class="muted">Аккаунт и весь прогресс на сервере будут стёрты навсегда. Отменить это нельзя.</p>
          <form class="row" id="delForm"><input class="input" type="password" id="delPass" placeholder="Пароль для подтверждения" autocomplete="current-password" required>
            <button class="btn btn-danger">Удалить навсегда</button></form>
        </details>`;
      $("#delForm").onsubmit = async (e) => {
        e.preventDefault();
        if (!confirm("Точно удалить аккаунт и весь прогресс? Это нельзя отменить.")) return;
        try { await Api.deleteAccount($("#delPass").value); location.hash = "#/"; location.reload(); }
        catch (err) { toast(esc(err.message), "!"); }
      };
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
      `Питомец-учитель (это ты, не ученик): ${pet.name} (${sp.title}), уровень ${Game.level(pet)} (${Game.stage(pet)}), сытость ${pet.food}/10, настроение ${pet.fun}/10, энергия ${pet.energy}/10.`,
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
      <section class="page-head reveal land-hero" style="min-height:300px">
        <div>
          <span class="eyebrow" style="--i:0">Bilim Buddy</span>
          <h1 style="--i:1">Учись вместе с питомцем</h1>
          <p style="--i:2">Английский, IELTS и школьные предметы — с личным ИИ-учителем и питомцем,
            который растёт, когда ты учишься. Пара минут в день — и это входит в привычку.</p>
          ${pet ? "" : `<div class="hero-actions" style="--i:3">
            <a class="btn btn-sun" href="#pickStart" id="landGo">Завести питомца <span class="arr">${I.arrow}</span></a>
            ${Api.auth() ? "" : `<a class="btn btn-line" href="#/account">У меня есть аккаунт</a>`}</div>`}
        </div>
        <div class="pet-box" id="choosePreview">${Pets.petSVG(pick.animal, "happy")}</div>
      </section>

      ${pet ? "" : `<section class="section land-feats reveal">
        <div class="card land-f"><span class="land-ic">AI</span><h3>ИИ-учитель</h3>
          <p>Объяснит любую тему и разберёт твои ошибки. Видит твой прогресс и подсказывает, что повторить.</p></div>
        <div class="card land-f"><span class="land-ic">IE</span><h3>Подготовка к IELTS</h3>
          <p>Listening с живыми голосами, Reading, Speaking и Writing. ИИ проверит эссе по критериям экзамена.</p></div>
        <div class="card land-f"><span class="land-ic">🔥</span><h3>План на день</h3>
          <p>Три коротких задания каждый день и серия дней подряд — чтобы учёба стала привычкой.</p></div>
        <div class="card land-f"><span class="land-ic">♥</span><h3>Питомец растёт</h3>
          <p>Верные ответы кормят его и дают опыт и монеты. Забудешь про учёбу — загрустит.</p></div>
      </section>`}

      <div class="step" id="pickStart"><span class="step-n">01</span><h3>Выбери питомца</h3></div>
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

    if ($("#landGo")) $("#landGo").onclick = (e) => { e.preventDefault(); $("#pickStart").scrollIntoView({ behavior: "smooth", block: "start" }); };
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
  //  Тест уровня английского: по 4 вопроса A1…C1
  // ============================================================
  const TEST_LEVELS = ["A1", "A2", "B1", "B2", "C1"];
  let ltest = null;
  function testPage() {
    if (!ltest) {
      const bank = (window.QUESTIONS || []).filter((q) => q.topic === "Английский" && q.wrong.length === 3);
      const qs = TEST_LEVELS.flatMap((l) => bank.filter((q) => q.level === l).sort(() => Math.random() - 0.5).slice(0, 4));
      ltest = { qs, i: 0, right: {} };
    }
    const t = ltest;
    if (t.i >= t.qs.length) return testResult();
    const q = t.qs[t.i];
    const opts = [q.answer, ...q.wrong].sort(() => Math.random() - 0.5);
    view.innerHTML = `
      <section class="quiz"><div class="quiz-card">
        <div class="quiz-top"><span class="chip plum">Тест уровня</span><span class="chip">${t.i + 1} из ${t.qs.length}</span><span class="sp"></span>
          <button class="btn btn-ghost btn-sm" id="tSkip">Не знаю</button></div>
        <div class="progress-line"><span style="width:${(t.i / t.qs.length) * 100}%"></span></div>
        <div class="q-in"><div class="q-num">Вопросы постепенно усложняются. Если не знаешь — жми «Не знаю», не угадывай.</div>
          <h2 class="q-text">${esc(q.question)}</h2></div>
        <div class="opts">${opts.map((o, i) => `<button class="opt" data-v="${esc(o)}"><span class="l">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>
      </div></section>`;
    const next = (ok) => { if (ok) t.right[q.level] = (t.right[q.level] || 0) + 1; t.i++; testPage(); };
    $$(".opt").forEach((b) => b.onclick = () => next(b.dataset.v === q.answer));
    $("#tSkip").onclick = () => next(false);
  }
  function testResult() {
    const t = ltest;
    // уровень — последний, на котором 3 из 4 верно, и все уровни ниже тоже сданы
    let level = "A1", passed = 0;
    for (const l of TEST_LEVELS) { if ((t.right[l] || 0) >= 3) { level = l; passed++; } else break; }
    const nextL = passed === 0 ? "A1" : TEST_LEVELS[Math.min(passed, TEST_LEVELS.length - 1)];
    const first = !pet.placement;
    pet.placement = { level: passed ? level : "ниже A1", date: Date.now(), right: t.right };
    if (first) pet.coins = (pet.coins || 0) + 10;
    Game.savePet(pet);
    view.innerHTML = `
      <section class="page-head reveal"><div>
        <span class="eyebrow">Тест уровня</span>
        <h1>${passed ? `Твой уровень: ${level}` : "Начнём с основ"}</h1>
        <p>${passed ? `Ты уверенно справляешься с заданиями уровня ${level}. Советую заниматься на уровне <b>${nextL}</b> — там будет чему поучиться.`
          : "Сейчас лучше всего начать с уровня A1 — там самые базовые слова и грамматика."}${first ? " За первый тест — 10 монет." : ""}</p>
        <div class="hero-actions" style="margin-top:20px"><button class="btn btn-sun" id="tGo">Учить ${nextL} <span class="arr">${I.arrow}</span></button>
          <button class="btn btn-line" id="tAgain">Пройти ещё раз</button></div>
      </div>${petBox(passed >= 3 ? "proud" : "happy")}</section>
      <section class="section"><div class="card test-res">${TEST_LEVELS.map((l) => `<div><b>${l}</b><span class="t-bar"><span style="width:${((t.right[l] || 0) / 4) * 100}%"></span></span><span class="muted">${t.right[l] || 0}/4</span></div>`).join("")}</div></section>`;
    if (passed >= 2) confetti();
    $("#tGo").onclick = () => { learn = { topic: "Английский", level: nextL }; pet.topic = "Английский"; pet.level = nextL; Game.savePet(pet); quiz = null; ltest = null; go("#/quiz"); };
    $("#tAgain").onclick = () => { ltest = null; testPage(); };
    ltest = null;
    updateHeader("learn");
  }

  // ============================================================
  //  Магазин: одёжки за монеты
  // ============================================================
  const SLOT_NAMES = { hat: "На голову", face: "На мордочку", neck: "На шею" };
  let tryOn = null;      // что примеряем (ещё не куплено)
  function shopPage() {
    const owned = pet.owned || [], wear = pet.wear || {};
    const preview = Object.assign({}, wear, tryOn ? { [Pets.ITEMS[tryOn].slot]: tryOn } : {});
    view.innerHTML = `
      <section class="page-head reveal shop-head"><div>
        <span class="eyebrow" style="--i:0">Магазин</span>
        <h1 style="--i:1">Наряди ${esc(pet.name)}</h1>
        <p style="--i:2">Монеты дают за новые верные ответы (+2), задания IELTS (+5) и выполненный план на день (+20).
          Нажми на вещь, чтобы примерить.</p>
        <div class="coins-big" style="--i:3">🪙 <b>${pet.coins || 0}</b> монет</div>
      </div>
      <div class="pet-box" id="shopPet">${Pets.petSVG(pet.animal, "happy", { wear: preview })}</div></section>
      ${Object.entries(SLOT_NAMES).map(([slot, name]) => `
        <section class="section"><div class="section-head"><h2>${name}</h2></div>
        <div class="shop-grid">${Object.entries(Pets.ITEMS).filter(([, it]) => it.slot === slot).map(([id, it]) => {
          const has = owned.includes(id), on = wear[slot] === id;
          return `<div class="card shop-item ${on ? "on" : ""} ${tryOn === id ? "try" : ""}" data-id="${id}">
            <div class="pet-box">${Pets.petSVG(pet.animal, "idle", { wear: { [slot]: id }, fx: false })}</div>
            <h3>${it.title}</h3>
            ${has ? `<button class="btn btn-sm ${on ? "btn-ghost" : ""}" data-wear="${id}">${on ? "Снять" : "Надеть"}</button>`
              : `<button class="btn btn-sm btn-sun" data-buy="${id}" ${(pet.coins || 0) < it.price ? "data-poor" : ""}>🪙 ${it.price}</button>`}
          </div>`; }).join("")}</div></section>`).join("")}`;
    $$(".shop-item").forEach((c) => c.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      const id = c.dataset.id;
      tryOn = (pet.owned || []).includes(id) || tryOn === id ? null : id;
      shopPage();
      $("#shopPet").scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    $$("[data-buy]").forEach((b) => b.onclick = () => {
      const r = Game.buyItem(pet, b.dataset.buy);
      if (!r.ok) { toast(r.text, "!"); return; }
      tryOn = null;
      Pets.setWear(pet.animal, pet.wear);
      confetti();
      toast(r.text, "🪙");
      shopPage();
      updateHeader("shop");
    });
    $$("[data-wear]").forEach((b) => b.onclick = () => {
      Game.wearItem(pet, b.dataset.wear);
      Pets.setWear(pet.animal, pet.wear);
      shopPage();
      updateHeader("shop");
    });
  }

  // ============================================================
  //  Конфиденциальность: что хранится и куда уходит
  // ============================================================
  function privacyPage() {
    view.innerHTML = `
      <section class="page-head reveal"><div>
        <span class="eyebrow" style="--i:0">Конфиденциальность</span>
        <h1 style="--i:1">Что мы храним</h1>
        <p style="--i:2">Коротко и честно: какие данные есть у Bilim Buddy, где они лежат и кто их видит.</p>
      </div></section>
      <section class="section"><div class="card privacy">
        <h3>Без аккаунта</h3>
        <p>Весь прогресс (питомец, ответы, карточки, эссе) хранится только в твоём браузере и никуда не отправляется.
          Если очистить данные браузера, прогресс пропадёт — поэтому лучше завести аккаунт.</p>
        <h3>С аккаунтом</h3>
        <ul>
          <li><b>Логин и пароль.</b> Пароль хранится не сам, а в виде зашифрованного отпечатка (PBKDF2), узнать его по базе нельзя.</li>
          <li><b>Прогресс сайта</b> — чтобы он был одинаковым на телефоне и компьютере.</li>
          <li><b>Счётчики</b>: сколько вопросов задано ИИ за день и в какие дни ты заходил(а). Это нужно для лимитов и календаря.</li>
        </ul>
        <p>Мы <b>не спрашиваем</b> почту, телефон, настоящее имя и возраст. Данные хранятся в облачной базе PostgreSQL (Neon), соединение защищено (HTTPS).</p>
        <h3>ИИ-учитель</h3>
        <p>Когда ты пишешь учителю или отправляешь эссе на проверку, текст вопроса, эссе и короткая сводка прогресса
          отправляются нейросети DeepSeek, чтобы она могла ответить. Не пиши учителю личные данные: адрес, телефон, пароли.</p>
        <h3>Защита входа</h3>
        <p>После нескольких неверных паролей вход временно блокируется. Вход в аккаунт автоматически истекает через 60 дней.</p>
        <h3>Удаление</h3>
        <p>В разделе <a href="#/account">«Аккаунт»</a> есть кнопка «Удалить аккаунт»: аккаунт и весь прогресс на сервере стираются сразу и навсегда.</p>
      </div></section>`;
  }

  // ============================================================
  //  Сон (5 минут) и перерыв (2 минуты)
  // ============================================================
  const restFmt = (ms) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const BREAK_IDEAS = [
    { id: "breath", title: "Подышать", text: "Спокойное дыхание по квадрату: вдох, пауза, выдох." },
    { id: "stretch", title: "Разминка", text: "Шесть простых движений для шеи, плеч и глаз." },
    { id: "pairs", title: "Найди пару", text: "Мини-игра: соедини английские слова с переводом." },
    { id: "pet", title: "Погладить питомца", text: "Нажимай на питомца — ему приятно, а тебе весело." },
  ];
  const STRETCH = [
    ["Плечи", "Подними плечи к ушам, задержи на 3 секунды и опусти. Повтори 5 раз."],
    ["Шея", "Медленно наклони голову к правому плечу, потом к левому. По 3 раза."],
    ["Глаза", "Посмотри вдаль, в окно, на 20 секунд. Потом поморгай."],
    ["Спина", "Сцепи руки в замок и потянись вверх, как будто ты выше на 5 см."],
    ["Кисти", "Покрути кистями рук в одну и в другую сторону по 10 раз."],
    ["Вода", "Выпей пару глотков воды. Мозгу нужна вода, чтобы хорошо работать."],
  ];
  const PAIR_WORDS = [["apple", "яблоко"], ["window", "окно"], ["tired", "уставший"], ["journey", "поездка"], ["neighbour", "сосед"],
    ["early", "рано"], ["kitchen", "кухня"], ["borrow", "одалживать"], ["weather", "погода"], ["reliable", "надёжный"], ["achieve", "достигать"], ["despite", "несмотря на"]];
  let restIdea = "breath";

  /** Каждую секунду: проверяем, не закончился ли отдых. */
  function restTick() {
    const st = Game.restState(pet);
    const chip = $("#restChip");
    if (chip) {
      chip.classList.toggle("on", !!st);
      if (st) chip.querySelector("span").textContent = (st.kind === "sleep" ? "☾ " : "♪ ") + restFmt(st.left);
    }
    if (!st) return;
    if (st.left <= 0) {
      const r = Game.finishRest(pet);
      Timer.chime();
      toast(r.text, r.kind === "sleep" ? "☀" : "♪");
      if (currentRoute() === "rest") go("#/");
      else if (currentRoute() === "home") render();
      else updateHeader(currentRoute());
      return;
    }
    if ($("#restLeft")) {
      $("#restLeft").textContent = restFmt(st.left);
      $("#restBar").style.width = st.part * 100 + "%";
    }
  }
  setInterval(restTick, 1000);

  function restPage() {
    const st = Game.restState(pet);
    if (!st) { location.replace("#/"); return; }
    const sleep = st.kind === "sleep";
    view.innerHTML = `
      <section class="rest-hero card reveal ${sleep ? "night" : "day"}">
        <div class="rest-pet">${petBox(sleep ? "sleep" : "play", "", "restPet")}</div>
        <div class="rest-info">
          <span class="eyebrow">${sleep ? "Тихий час" : "Перерыв"}</span>
          <h1>${sleep ? `Тсс… ${esc(pet.name)} спит` : `${esc(pet.name)} отдыхает`}</h1>
          <p>${sleep ? "Пока питомец спит, раздел «Учёба» закрыт. Когда сон закончится, энергия вырастет на 4. Можно разбудить раньше, но тогда сил прибавится меньше."
            : "Две минуты отдыха от учёбы. Раздел «Учёба» откроется, когда перерыв закончится. Ниже — чем можно заняться."}</p>
          <div class="rest-time"><b id="restLeft">${restFmt(st.left)}</b><span>осталось</span></div>
          <div class="rest-bar"><i id="restBar" style="width:${st.part * 100}%"></i></div>
          <div class="row">
            <button class="btn ${sleep ? "btn-sun" : ""}" id="restStop">${sleep ? "Разбудить" : "Закончить перерыв"}</button>
            <a class="btn btn-ghost" href="#/">На главную</a>
          </div>
          ${sleep ? `<p class="muted rest-also">А пока можно: <a href="#/cards">повторить карточки</a>, <a href="#/ielts">позаниматься IELTS</a> или <a href="#/focus">поставить фокус-таймер</a>.</p>` : ""}
        </div>
      </section>
      ${sleep ? "" : `<section class="section">
        <div class="section-head"><h2>Чем заняться в перерыве?</h2><p>Выбери любое. Это не учёба, а отдых для головы.</p></div>
        <div class="idea-tabs" id="ideaTabs">${BREAK_IDEAS.map((x) => `<button class="idea ${x.id === restIdea ? "on" : ""}" data-id="${x.id}"><b>${x.title}</b><span>${x.text}</span></button>`).join("")}</div>
        <div class="card idea-box" id="ideaBox"></div>
      </section>`}`;

    $("#restStop").onclick = () => {
      const r = Game.finishRest(pet);
      if (r) toast(r.text, sleep ? "☀" : "♪");
      go("#/");
    };
    $("#restPet").onclick = () => petLove();
    if (!sleep) {
      $$("#ideaTabs .idea").forEach((b) => (b.onclick = () => { restIdea = b.dataset.id; $$("#ideaTabs .idea").forEach((x) => x.classList.toggle("on", x === b)); drawIdea(); }));
      drawIdea();
    }
  }

  function petLove() {
    const box = $("#restPet");
    if (!box) return;
    bump(box, "jump");
    const h = document.createElement("span");
    h.className = "love";
    h.textContent = "♥";
    h.style.left = 30 + Math.random() * 40 + "%";
    box.appendChild(h);
    setTimeout(() => h.remove(), 1200);
    const c = $("#loveCount");
    if (c) c.textContent = +c.textContent + 1;
  }

  function drawIdea() {
    const box = $("#ideaBox");
    if (!box) return;
    clearInterval(box._t);
    if (restIdea === "breath") {
      box.innerHTML = `<div class="breath"><div class="breath-ball" id="breathBall"></div><p id="breathTxt">Вдох…</p>
        <p class="muted">4 секунды вдох · 4 секунды пауза · 4 секунды выдох · 4 секунды пауза</p></div>`;
      const steps = ["Вдох…", "Задержи дыхание", "Выдох…", "Пауза"];
      let i = 0;
      const step = () => { const t = $("#breathTxt"); if (!t) return clearInterval(box._t); t.textContent = steps[i % 4]; $("#breathBall").className = "breath-ball s" + (i % 4); i++; };
      step();
      box._t = setInterval(step, 4000);
    } else if (restIdea === "stretch") {
      let i = 0;
      const draw = () => {
        const [t, d] = STRETCH[i];
        box.innerHTML = `<div class="stretch"><span class="chip">${i + 1} из ${STRETCH.length}</span><h3>${t}</h3><p>${d}</p>
          <button class="btn btn-sm" id="stretchNext">${i < STRETCH.length - 1 ? "Готово, дальше" : "Начать сначала"}</button></div>`;
        $("#stretchNext").onclick = () => { i = (i + 1) % STRETCH.length; draw(); };
      };
      draw();
    } else if (restIdea === "pairs") {
      const words = PAIR_WORDS.slice().sort(() => Math.random() - 0.5).slice(0, 6);
      const cards = words.flatMap(([en, ru], k) => [{ k, t: en }, { k, t: ru }]).sort(() => Math.random() - 0.5);
      box.innerHTML = `<div class="pairs">${cards.map((c, i) => `<button class="pair" data-i="${i}">${esc(c.t)}</button>`).join("")}</div>
        <p class="muted" id="pairsMsg">Нажми на слово, а потом на его перевод.</p>`;
      let first = null, found = 0;
      $$(".pair", box).forEach((b) => (b.onclick = () => {
        if (b.classList.contains("ok") || b === first) return;
        if (!first) { first = b; b.classList.add("sel"); return; }
        const a = cards[first.dataset.i], c = cards[b.dataset.i];
        if (a.k === c.k) {
          first.classList.replace("sel", "ok"); b.classList.add("ok"); found++;
          if (found === words.length) { $("#pairsMsg").innerHTML = `Все пары найдены! <button class="btn btn-sm btn-ghost" id="pairsAgain">Ещё раз</button>`; $("#pairsAgain").onclick = drawIdea; }
        } else {
          const f = first; b.classList.add("bad"); f.classList.add("bad");
          setTimeout(() => { b.classList.remove("bad"); f.classList.remove("bad", "sel"); }, 600);
        }
        first = null;
      }));
    } else {
      box.innerHTML = `<div class="stretch"><h3>Погладь питомца</h3><p>Нажимай на ${esc(pet.name)} вверху страницы — будут сердечки.</p>
        <p class="love-total">♥ <b id="loveCount">0</b></p><button class="btn btn-sm" id="loveBtn">Погладить</button></div>`;
      $("#loveBtn").onclick = () => { petLove(); $("#restPet").scrollIntoView({ behavior: "smooth", block: "center" }); };
    }
  }

  // ============================================================
  //  Переключение страниц
  // ============================================================
  const ROUTES = { "": home, rest: restPage, privacy: privacyPage, shop: shopPage, test: testPage, learn: learnPage, quiz: quizPage, cards: cardsPage, review: reviewPage, ielts: ieltsPage, account: accountPage, tutor: tutorPage, admin: adminPage, focus: focusPage, my: myPage, new: choosePage };
  const NAV = { "": "home", rest: "rest", privacy: "privacy", shop: "shop", test: "learn", learn: "learn", quiz: "learn", cards: "cards", review: "cards", ielts: "ielts", account: "account", tutor: "tutor", admin: "admin", focus: "focus", my: "my", new: "" };
  const currentRoute = () => NAV[location.hash.replace(/^#\/?/, "")] || "home";

  function render() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
    let name = location.hash.replace(/^#\/?/, "");
    if (!(name in ROUTES)) name = "";
    if (!pet && name !== "account" && name !== "privacy") name = "new";
    if (pet && Game.restState(pet) && Game.restState(pet).left > 0 && (name === "learn" || name === "quiz")) {
      toast(Game.restState(pet).kind === "sleep" ? `${pet.name} спит. Учёба откроется после сна.` : "Сейчас перерыв. Учёба откроется через пару минут.", "☾");
      name = "rest";
    }
    view.className = "";
    void view.offsetWidth;        // перезапуск анимации появления страницы
    view.className = "wrap view";
    document.body.classList.toggle("no-pet", !pet);
    if (pet) Pets.setWear(pet.animal, pet.wear);
    if (name !== "shop") tryOn = null;
    ROUTES[name]();
    updateHeader(NAV[name]);
    updateTimerChip();
    restTick();
    Api.visit(name || "home");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  /** Перейти на страницу. Если адрес тот же самый, браузер не пришлёт hashchange — тогда рисуем сами. */
  function go(hash) {
    if (location.hash === hash || (hash === "#/" && location.hash === "")) render();
    else location.hash = hash;
  }
  window.addEventListener("hashchange", render);
  $("#themeBtn").onclick = () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    window.setTheme(dark ? "light" : "dark");
    toast(dark ? "Светлая тема" : "Тёмная тема", dark ? "☀" : "☾");
  };
  render();
  Api.checkServer().then(() => updateHeader(currentRoute()));
})();
