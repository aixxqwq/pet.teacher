/*
  «Мозг» игры: питомец, действия, уровни, вопросы, таймер-статистика.
  Здесь нет вёрстки — только данные и правила (это перенос pet.py на JavaScript).

  Всё сохраняется в localStorage браузера в формате JSON:
    localStorage.setItem("ключ", JSON.stringify(данные))   — сохранить
    JSON.parse(localStorage.getItem("ключ"))               — загрузить
*/
const Game = (() => {
  const KEY_PET = "petTeacher.pet";
  const KEY_MY = "petTeacher.myQuestions";
  const KEY_STATS = "petTeacher.stats";

  const MAX = 10;              // максимум для каждой шкалы
  const HOURS_PER_POINT = 2;   // пока сайт закрыт, каждые 2 часа шкалы меняются на 1
  const XP_PER_LEVEL = 30;     // опыта на один уровень

  const TOPICS = {
    "Английский": ["A1", "A2", "B1", "B2", "C1"],
    "Python": ["Новичок", "Средний", "Профи"],
    "Математика": ["Лёгкий", "Средний", "Сложный", "Тренажёр"],
    "Знания": ["Лёгкий", "Средний", "Сложный"],
    "История": ["Лёгкий", "Средний", "Сложный"],
    "История Казахстана": ["Лёгкий", "Средний", "Сложный"],
    "География": ["Лёгкий", "Средний", "Сложный"],
    "Биология": ["Лёгкий", "Средний", "Сложный"],
    "Химия": ["Лёгкий", "Средний", "Сложный"],
    "Физика": ["Лёгкий", "Средний", "Сложный"],
  };
  const TOPIC_META = {
    "Английский": { code: "EN", about: "Слова, грамматика и времена" },
    "Python": { code: "PY", about: "Синтаксис, типы, функции" },
    "Математика": { code: "MA", about: "Задачи, графики, геометрия + тренажёр" },
    "Знания": { code: "GK", about: "Обо всём понемногу" },
    "История": { code: "ИС", about: "Даты, события, личности" },
    "История Казахстана": { code: "KZ", about: "От саков до независимости" },
    "География": { code: "ГЕ", about: "Страны, столицы, реки и горы" },
    "Биология": { code: "БИ", about: "Клетка, организм, животные" },
    "Химия": { code: "ХИ", about: "Элементы, формулы, реакции" },
    "Физика": { code: "ФИ", about: "Законы, формулы, единицы" },
    "Работа над ошибками": { code: "!", about: "Вопросы с ошибками — повторим" },
  };
  // Особая тема: сюда сами попадают вопросы, на которые ответили неверно
  const MISTAKES = "Работа над ошибками";
  const KEY_MISTAKES = "petTeacher.mistakes";
  const MY_LEVEL = "Мои";
  const TRAINER = "Тренажёр";   // бесконечные примеры по математике — за них мало опыта
  const ALL = "Все";

  // ---------- JSON в localStorage ----------
  function readJSON(key, fallback) {
    try {
      const text = localStorage.getItem(key);
      return text ? JSON.parse(text) : fallback;
    } catch (e) {
      return fallback;          // сломанный JSON или запрет хранилища
    }
  }
  function writeJSON(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* хранилище недоступно */ }
  }

  const limit = (v) => Math.max(0, Math.min(MAX, v));
  /** Дата в формате 2026-11-23 по местному времени (новый день начинается в полночь, а не по Гринвичу). */
  const isoDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = () => isoDay();

  // ---------- питомец ----------
  function newPet(name, animal) {
    return {
      name, animal,
      food: 5, fun: 5, energy: 5,
      xp: 0, correct: 0, wrong: 0, streak: 0, best_streak: 0,
      topic: "Английский", level: "A1",
      born: today(),
      last_update: Date.now() / 1000,
    };
  }
  function savePet(pet) { writeJSON(KEY_PET, pet); }
  function loadPet() {
    const pet = readJSON(KEY_PET, null);
    if (!pet || typeof pet !== "object" || !Pets.SPECIES[pet.animal]) return null;
    return Object.assign(newPet(pet.name || "Питомец", pet.animal), pet);   // новые поля для старых сохранений
  }
  function deleteSave() { localStorage.removeItem(KEY_PET); }

  function applyTimePassed(pet) {
    const now = Date.now() / 1000;
    const steps = Math.floor((now - pet.last_update) / 3600 / HOURS_PER_POINT);
    if (steps > 0) {
      pet.food = limit(pet.food - steps);
      pet.fun = limit(pet.fun - steps);
      pet.energy = limit(pet.energy + steps);
      pet.last_update += steps * HOURS_PER_POINT * 3600;
    }
    return steps;
  }

  const level = (pet) => 1 + Math.floor(pet.xp / XP_PER_LEVEL);
  const xpInLevel = (pet) => pet.xp % XP_PER_LEVEL;
  function stage(pet) {
    const l = level(pet);
    if (l <= 2) return "новичок";
    if (l <= 5) return "ученик";
    if (l <= 9) return "эксперт";
    return "мастер";
  }
  function mood(pet) {
    if (pet.food === 0) return "Я очень голоден. Ответь на пару вопросов!";
    if (pet.food <= 3) return "Сытость низкая — самое время поучиться.";
    if (pet.energy <= 2) return "Глаза слипаются… Уложишь меня поспать?";
    if (pet.fun <= 3) return "Что-то грустно. Сделаем перерыв?";
    const p = Pets.SPECIES[pet.animal].phrases;
    return p[Math.floor(Math.random() * p.length)];
  }
  /** Поза питомца по его состоянию. */
  function feeling(pet) {
    if (pet.rest) return pet.rest.kind === "sleep" ? "sleep" : "play";
    if (pet.energy <= 2) return "sleep";
    if (pet.food <= 3 || pet.fun <= 3) return "sad";
    return "idle";
  }

  // ---------- прогресс по секциям ----------
  // Секция — это тема + уровень, например «История · Лёгкий».
  // В pet.solved хранится, какие вопросы секции уже решены верно: {"История|Лёгкий": ["вопрос", ...]}
  /** Откуда вопрос на самом деле (у вопросов из «Работы над ошибками» — исходная тема). */
  const origin = (q) => ({ topic: q.from || q.topic, level: q.fromLevel || q.level });
  const sectionKey = (topic, levelName) => topic + "|" + levelName;
  function isSolved(pet, q) {
    const o = origin(q);
    return ((pet.solved || {})[sectionKey(o.topic, o.level)] || []).includes(q.question);
  }
  function markSolved(pet, q) {
    const o = origin(q);
    pet.solved = pet.solved || {};
    const key = sectionKey(o.topic, o.level);
    pet.solved[key] = (pet.solved[key] || []).concat(q.question);
  }
  /** Сколько вопросов секции решено. levelName = ALL — по всей теме. */
  function sectionProgress(pet, topic, levelName, questions) {
    if (levelName === TRAINER) return null;
    const pool = questions.filter((q) => q.topic === topic && (levelName === ALL || q.level === levelName));
    const solved = pool.filter((q) => isSolved(pet, q)).length;
    return { solved, total: pool.length, done: pool.length > 0 && solved === pool.length };
  }

  // ---------- действия ----------
  /**
   * Ответ на вопрос. Опыт дают только за вопросы, решённые впервые:
   * если вопрос секции уже был решён раньше, это повторение — питомец немного сыт, но опыта нет.
   */
  function answer(pet, isCorrect, difficulty = 0, q = null) {
    const res = { correct: isCorrect, gained: 0, bonus: false, levelUp: false, repeat: false, sectionDone: false };
    if (isCorrect) {
      const old = level(pet);
      pet.correct += 1;
      pet.streak += 1;
      pet.best_streak = Math.max(pet.best_streak, pet.streak);
      if (q && q.generated) {                       // пример из тренажёра
        pet.food = limit(pet.food + 1);
        res.gained = 3;
      } else if (q && isSolved(pet, q)) {           // уже решали — без опыта
        pet.food = limit(pet.food + 1);
        res.repeat = true;
      } else {
        pet.food = limit(pet.food + 3);
        res.gained = 10 + 5 * difficulty;
        pet.coins = (pet.coins || 0) + 2;          // монетки за новый верный ответ
        res.coins = 2;
        if (q) {
          markSolved(pet, q);
          const o = origin(q);
          const prog = sectionProgress(pet, o.topic, o.level, loadQuestions());
          res.sectionDone = !!(prog && prog.done);
        }
      }
      pet.xp += res.gained;
      if (!res.repeat && pet.streak % 5 === 0) {
        pet.fun = limit(pet.fun + 2);
        pet.xp += 10;
        res.gained += 10;
        res.bonus = true;
      }
      res.levelUp = level(pet) > old;
    } else {
      pet.wrong += 1;
      pet.streak = 0;
      pet.fun = limit(pet.fun - 1);
    }
    savePet(pet);
    track({ answers: 1, correct: isCorrect ? 1 : 0, xp: res.gained });
    return res;
  }
  // ---------- сон и перерыв идут по времени ----------
  // pet.rest = {kind: "sleep" | "break", start, until}. Пока он есть, раздел «Учёба» закрыт.
  const REST_MS = { sleep: 5 * 60 * 1000, break: 2 * 60 * 1000 };
  function play(pet) {
    if (pet.rest) return { ok: false, text: "Питомец уже отдыхает." };
    if (pet.energy < 2) return { ok: false, text: "Энергии не хватает. Сначала отдых." };
    pet.energy = limit(pet.energy - 2);
    pet.food = limit(pet.food - 1);
    pet.rest = { kind: "break", start: Date.now(), until: Date.now() + REST_MS.break };
    savePet(pet);
    return { ok: true, text: "Перерыв на 2 минуты начался." };
  }
  function sleep(pet) {
    if (pet.rest) return { ok: false, text: "Питомец уже отдыхает." };
    if (pet.energy >= MAX) return { ok: false, text: "Энергия уже на максимуме." };
    pet.rest = { kind: "sleep", start: Date.now(), until: Date.now() + REST_MS.sleep };
    savePet(pet);
    return { ok: true, text: "Питомец уснул на 5 минут." };
  }
  /** Сколько осталось отдыхать: {kind, left, part} или null. */
  function restState(pet) {
    if (!pet || !pet.rest) return null;
    const r = pet.rest, total = r.until - r.start;
    const left = Math.max(0, r.until - Date.now());
    return { kind: r.kind, left, total, part: 1 - left / total };
  }
  /** Закончить отдых (сам по таймеру или кнопкой «Разбудить»). Награда — по тому, сколько успел отдохнуть. */
  function finishRest(pet) {
    const st = restState(pet);
    if (!st) return null;
    const full = st.left <= 0;
    let text;
    if (st.kind === "sleep") {
      const add = full ? 4 : Math.max(1, Math.round(4 * st.part));
      pet.energy = limit(pet.energy + add);
      text = full ? `Выспался! Энергия +${add}.` : `Проснулся раньше времени. Энергия +${add}.`;
    } else {
      const add = full ? 3 : Math.max(1, Math.round(3 * st.part));
      pet.fun = limit(pet.fun + add);
      pet.xp += 2;
      text = full ? `Перерыв окончен. Настроение +${add}.` : `Перерыв закончился раньше. Настроение +${add}.`;
    }
    const kind = st.kind;
    delete pet.rest;
    savePet(pet);
    return { kind, full, text };
  }
  /** Закончили сессию фокуса: опыт за каждую минуту. */
  function focusDone(pet, minutes) {
    const old = level(pet);
    const gained = Math.max(5, Math.round(minutes * 0.8));
    pet.xp += gained;
    pet.energy = limit(pet.energy - 1);
    savePet(pet);
    const s = dayStats();
    s.sessions += 1;
    s.minutes += minutes;
    s.xp = (s.xp || 0) + gained;
    saveDayStats(s);
    return { gained, levelUp: level(pet) > old };
  }
  /** Повторили карточку: вспомнила — +3 XP и немного еды, не вспомнила — +1 XP за старание. */
  function cardReviewed(pet, grade) {
    const old = level(pet);
    if (grade >= 1) { pet.xp += 3; pet.food = limit(pet.food + 1); }
    else pet.xp += 1;
    savePet(pet);
    const s = dayStats();
    s.cards = (s.cards || 0) + 1;
    s.xp = (s.xp || 0) + (grade >= 1 ? 3 : 1);
    saveDayStats(s);
    return { levelUp: level(pet) > old };
  }
  function breakDone(pet) {
    pet.fun = limit(pet.fun + 2);
    pet.energy = limit(pet.energy + 2);
    savePet(pet);
  }

  // ---------- статистика фокуса по дням ----------
  function allStats() { return readJSON(KEY_STATS, {}); }
  function dayStats(date = today()) {
    return Object.assign({ sessions: 0, minutes: 0, distractions: 0 }, allStats()[date]);
  }
  function saveDayStats(s, date = today()) {
    const all = allStats();
    all[date] = s;
    writeJSON(KEY_STATS, all);
  }
  /** Прибавить к сегодняшней статистике: track({answers: 1, xp: 15}). Нужно для календаря и плана на день. */
  function track(add) {
    const s = dayStats();
    const wasDone = planComplete(s);
    for (const [k, v] of Object.entries(add)) s[k] = (s[k] || 0) + v;
    saveDayStats(s);
    // план на день только что выполнен — сайт покажет праздник и даст награду
    if (!wasDone && planComplete(s)) window.dispatchEvent(new CustomEvent("plan-complete"));
  }

  // ---------- план на день и серия дней ----------
  // День засчитывается в серию, если выполнен хотя бы один пункт плана. Весь план — бонус.
  const PLAN = [
    { id: "answers", title: "Ответить на 10 вопросов", goal: 10, href: "#/learn", have: (d) => d.answers || 0 },
    { id: "cards", title: "5 карточек или 15 минут фокуса", goal: 5, href: "#/cards",
      have: (d) => Math.max(d.cards || 0, Math.floor((d.minutes || 0) / 3)) },
    { id: "ielts", title: "1 задание IELTS", goal: 1, href: "#/ielts", have: (d) => d.ielts || 0 },
  ];
  const PLAN_REWARD = { xp: 30, coins: 20 };
  function dailyPlan(date = today()) {
    const d = dayStats(date);
    return PLAN.map((p) => ({ ...p, got: Math.min(p.goal, p.have(d)), done: p.have(d) >= p.goal }));
  }
  const planComplete = (d) => !!d && PLAN.every((p) => p.have(d) >= p.goal);
  const dayCounts = (d) => !!d && PLAN.some((p) => p.have(d) >= p.goal);
  /** Серия дней подряд: если сегодня ещё ничего не сделано, считаем до вчера (серия ещё не потеряна). */
  function dayStreak() {
    const all = allStats();
    const d = new Date();
    if (!dayCounts(all[isoDay(d)])) d.setDate(d.getDate() - 1);
    let n = 0;
    while (dayCounts(all[isoDay(d)])) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  const todayCounts = () => dayCounts(allStats()[today()]);
  /** Забрать награду за весь план (один раз в день). */
  // ---------- монеты и магазин ----------
  function addCoins(pet, n) { pet.coins = (pet.coins || 0) + n; savePet(pet); }
  function buyItem(pet, id) {
    const it = Pets.ITEMS[id];
    pet.owned = pet.owned || [];
    if (!it || pet.owned.includes(id)) return { ok: false, text: "Уже куплено." };
    if ((pet.coins || 0) < it.price) return { ok: false, text: `Не хватает монет: нужно ${it.price}, у тебя ${pet.coins || 0}.` };
    pet.coins -= it.price;
    pet.owned.push(id);
    wearItem(pet, id);
    return { ok: true, text: `Куплено: ${it.title}!` };
  }
  function wearItem(pet, id) {
    const it = Pets.ITEMS[id];
    pet.wear = pet.wear || {};
    if (pet.wear[it.slot] === id) delete pet.wear[it.slot];      // повторное нажатие — снять
    else pet.wear[it.slot] = id;
    savePet(pet);
  }

  function claimPlan(pet) {
    const s = dayStats();
    if (!planComplete(s) || s.planClaimed) return null;
    s.planClaimed = 1;
    saveDayStats(s);
    pet.xp += PLAN_REWARD.xp;
    pet.coins = (pet.coins || 0) + PLAN_REWARD.coins;
    pet.fun = limit(pet.fun + 2);
    savePet(pet);
    return PLAN_REWARD;
  }
  /** Насколько активным был день: 0 — ничего, 1–4 — от «чуть-чуть» до «очень много». */
  function activityLevel(d) {
    if (!d) return 0;
    const score = (d.answers || 0) + (d.cards || 0) + (d.ielts || 0) * 5 + Math.round((d.minutes || 0) / 5);
    return score === 0 ? 0 : score < 5 ? 1 : score < 15 ? 2 : score < 30 ? 3 : 4;
  }
  function totalFocusMinutes() {
    return Object.values(allStats()).reduce((sum, d) => sum + (d.minutes || 0), 0);
  }
  function addDistraction() {
    const s = dayStats();
    s.distractions += 1;
    saveDayStats(s);
  }

  // ---------- вопросы ----------
  const loadMyQuestions = () => readJSON(KEY_MY, []);
  const loadQuestions = () => (window.QUESTIONS || []).concat(loadMyQuestions(), loadMistakes());

  function addMyQuestion(topic, question, answerText, wrong) {
    const items = loadMyQuestions();
    items.push({
      id: String(Date.now()),
      topic: topic.trim(),
      level: MY_LEVEL,
      question: question.trim(),
      answer: answerText.trim(),
      wrong: wrong.map((w) => w.trim()).filter(Boolean),
    });
    writeJSON(KEY_MY, items);
  }
  function deleteMyQuestion(id) {
    writeJSON(KEY_MY, loadMyQuestions().filter((q) => q.id !== id));
  }

  function allTopics(questions) {
    const names = Object.keys(TOPICS);
    questions.forEach((q) => { if (!names.includes(q.topic) && q.topic !== MISTAKES) names.push(q.topic); });
    if (questions.some((q) => q.topic === MISTAKES)) names.unshift(MISTAKES);   // ошибки — первыми
    return names;
  }
  function levelsFor(topic, questions) {
    if (topic === MISTAKES) return [];
    if (TOPICS[topic]) {
      const lv = TOPICS[topic].slice();
      if (questions.some((q) => q.topic === topic && q.level === MY_LEVEL)) lv.push(MY_LEVEL);
      return lv;
    }
    return [MY_LEVEL];
  }
  function difficulty(topic, levelName) {
    const lv = TOPICS[topic] || [];
    return lv.includes(levelName) ? lv.indexOf(levelName) : 1;
  }
  function countFor(topic, questions) {
    return questions.filter((q) => q.topic === topic).length;
  }

  const normalize = (t) => t.toLowerCase().replace(/ё/g, "е").split(/\s+/).filter(Boolean).join(" ").replace(/[.!]+$/, "");
  const checkTyped = (q, typed) => normalize(typed) === normalize(q.answer);

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function mathQuestion(levelName) {
    let text, right;
    if (levelName === "Лёгкий") {
      let a = rnd(1, 20), b = rnd(1, 20);
      if (Math.random() < 0.5) { text = `${a} + ${b}`; right = a + b; }
      else { [a, b] = [Math.max(a, b), Math.min(a, b)]; text = `${a} − ${b}`; right = a - b; }
    } else if (levelName === "Средний") {
      const kind = pick(["+", "−", "×", ":"]);
      if (kind === "+") { const a = rnd(10, 99), b = rnd(10, 99); text = `${a} + ${b}`; right = a + b; }
      else if (kind === "−") { const a = rnd(30, 99), b = rnd(10, a); text = `${a} − ${b}`; right = a - b; }
      else if (kind === "×") { const a = rnd(2, 9), b = rnd(2, 9); text = `${a} × ${b}`; right = a * b; }
      else { const b = rnd(2, 9); right = rnd(2, 9); text = `${b * right} : ${b}`; }
    } else {
      const kind = pick(["×", "%", "x", "²"]);
      if (kind === "×") { const a = rnd(11, 29), b = rnd(3, 15); text = `${a} × ${b}`; right = a * b; }
      else if (kind === "%") { const p = pick([10, 20, 25, 50]), n = pick([40, 60, 80, 120, 160, 200, 240, 300, 400]); text = `${p}% от ${n}`; right = (n * p) / 100; }
      else if (kind === "x") { const x = rnd(2, 15), a = rnd(2, 9); text = `x · ${a} = ${x * a}. Чему равен x`; right = x; }
      else { const n = rnd(11, 20); text = `${n}²`; right = n * n; }
    }
    const wrong = new Set();
    while (wrong.size < 3) {
      const g = right + pick([-10, -3, -2, -1, 1, 2, 3, 10]);
      if (g !== right && g >= 0) wrong.add(g);
    }
    return {
      topic: "Математика", level: TRAINER, generated: true,
      question: text.includes("x") ? text + "?" : `Сколько будет ${text}?`,
      answer: String(right), wrong: [...wrong].map(String),
    };
  }

  /** Тренажёр: случайный уровень сложности примеров. */
  const TRAINER_LEVELS = ["Лёгкий", "Средний", "Сложный"];

  /**
   * Выбрать вопрос. Сначала — ещё не решённые вопросы секции; когда они закончатся,
   * вопросы пойдут по кругу (это повторение, опыта за них нет). recent — недавние, чтобы не повторяться подряд.
   */
  function randomQuestion(questions, topic, levelName, recent = [], pet = null) {
    let q;
    if (topic === "Математика" && levelName === TRAINER) {
      q = mathQuestion(pick(TRAINER_LEVELS));
    } else {
      const pool = questions.filter((x) => x.topic === topic && (levelName === ALL || x.level === levelName));
      if (!pool.length) return null;
      const unsolved = pet ? pool.filter((x) => !isSolved(pet, x)) : [];
      const base = unsolved.length ? unsolved : pool;
      const fresh = base.filter((x) => !recent.includes(x.question));
      q = Object.assign({}, pick(fresh.length ? fresh : base));
    }
    q.options = q.wrong && q.wrong.length ? shuffle([q.answer].concat(q.wrong.slice(0, 3))) : null;
    return q;
  }

  // ---------- работа над ошибками ----------
  const loadMistakes = () => readJSON(KEY_MISTAKES, []);
  /** Запомнить вопрос, на который ответили неверно (примеры по математике не храним — они каждый раз новые). */
  function addMistake(q) {
    if (q.topic === MISTAKES || q.generated) return;
    const items = loadMistakes().filter((x) => x.question !== q.question);
    items.push({ topic: MISTAKES, level: ALL, from: q.topic, fromLevel: q.level, question: q.question, answer: q.answer, wrong: q.wrong || [], figure: q.figure });
    writeJSON(KEY_MISTAKES, items.slice(-100));
  }
  /** Ответили верно — убираем вопрос из ошибок. */
  function removeMistake(q) {
    writeJSON(KEY_MISTAKES, loadMistakes().filter((x) => x.question !== q.question));
  }

  // ---------- файл сохранения (.json) ----------
  function exportSave() {
    return JSON.stringify({ pet: readJSON(KEY_PET, null), myQuestions: loadMyQuestions(), mistakes: loadMistakes(), cards: readJSON("petTeacher.cards", []), ielts: readJSON("petTeacher.ielts", null), stats: allStats() }, null, 2);
  }
  function importSave(text) {
    const data = JSON.parse(text);   // если файл сломан — будет ошибка, её ловит app.js
    if (!data.pet || !Pets.SPECIES[data.pet.animal]) throw new Error("В файле нет питомца");
    writeJSON(KEY_PET, data.pet);
    if (Array.isArray(data.myQuestions)) writeJSON(KEY_MY, data.myQuestions);
    if (data.stats && typeof data.stats === "object") writeJSON(KEY_STATS, data.stats);
    if (Array.isArray(data.mistakes)) writeJSON(KEY_MISTAKES, data.mistakes);
    if (Array.isArray(data.cards)) writeJSON("petTeacher.cards", data.cards);
    if (data.ielts && typeof data.ielts === "object") writeJSON("petTeacher.ielts", data.ielts);
  }

  return {
    MAX, XP_PER_LEVEL, TOPICS, TOPIC_META, MY_LEVEL, ALL, MISTAKES, TRAINER, sectionProgress,
    loadMistakes, addMistake, removeMistake, dailyPlan, planComplete, dayStreak, todayCounts, claimPlan, PLAN_REWARD, addCoins, buyItem, wearItem,
    readJSON, writeJSON, newPet, savePet, loadPet, deleteSave, applyTimePassed,
    level, xpInLevel, stage, mood, feeling, answer, play, sleep, restState, finishRest, REST_MS, focusDone, breakDone, cardReviewed,
    dayStats, allStats, track, activityLevel, isoDay, totalFocusMinutes, addDistraction,
    loadQuestions, loadMyQuestions, addMyQuestion, deleteMyQuestion,
    allTopics, levelsFor, difficulty, countFor, checkTyped, randomQuestion,
    exportSave, importSave,
  };
})();
