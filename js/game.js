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
  const today = () => new Date().toISOString().slice(0, 10);

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
    return res;
  }
  function play(pet) {
    if (pet.energy < 2) return { ok: false, text: "Энергии не хватает. Сначала отдых." };
    pet.fun = limit(pet.fun + 3);
    pet.energy = limit(pet.energy - 2);
    pet.food = limit(pet.food - 1);
    pet.xp += 2;
    savePet(pet);
    return { ok: true, text: "Перерыв пошёл на пользу. Настроение +3." };
  }
  function sleep(pet) {
    if (pet.energy >= MAX) return { ok: false, text: "Энергия уже на максимуме." };
    pet.energy = limit(pet.energy + 4);
    savePet(pet);
    return { ok: true, text: "Сладких снов. Энергия +4." };
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
    loadMistakes, addMistake, removeMistake,
    readJSON, writeJSON, newPet, savePet, loadPet, deleteSave, applyTimePassed,
    level, xpInLevel, stage, mood, feeling, answer, play, sleep, focusDone, breakDone, cardReviewed,
    dayStats, totalFocusMinutes, addDistraction,
    loadQuestions, loadMyQuestions, addMyQuestion, deleteMyQuestion,
    allTopics, levelsFor, difficulty, countFor, checkTyped, randomQuestion,
    exportSave, importSave,
  };
})();
