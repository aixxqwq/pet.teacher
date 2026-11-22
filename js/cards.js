/*
  Карточки для заучивания с интервальным повторением (как в Anki).

  Идея: мозг лучше запоминает, если повторять не всё подряд каждый день,
  а возвращаться к карточке прямо перед тем, как она начнёт забываться.
  После каждого ответа ты оцениваешь, насколько легко вспомнила:
    «Не помню» → карточка вернётся через пару минут, всё сначала;
    «Трудно»   → интервал растёт чуть-чуть;
    «Помню»    → интервал растёт: 1 день → 3 дня → неделя → …;
    «Легко»    → интервал растёт ещё сильнее.
  Это упрощённый алгоритм SM-2 — тот же принцип, что в Anki.

  Каждая карточка хранится в localStorage как JSON:
    {id, deck, front, back, ease, interval, reps, due}
  ease — «лёгкость» (во сколько раз растёт интервал), interval — дни, due — когда показать снова.
*/
const Cards = (() => {
  const KEY = "petTeacher.cards";
  const DAY = 86400000;

  const load = () => Game.readJSON(KEY, []);
  const save = (cards) => Game.writeJSON(KEY, cards);

  function add(deck, front, back) {
    const cards = load();
    cards.push({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      deck: deck.trim() || "Без колоды", front: front.trim(), back: back.trim(),
      ease: 2.5, interval: 0, reps: 0, due: Date.now(),
    });
    save(cards);
  }
  function remove(id) { save(load().filter((c) => c.id !== id)); }

  const decks = (cards = load()) => [...new Set(cards.map((c) => c.deck))];
  const due = (deck, cards = load()) => cards.filter((c) => c.due <= Date.now() && (!deck || c.deck === deck));

  /** Что будет с карточкой при оценке grade (0 — не помню, 1 — трудно, 2 — помню, 3 — легко). */
  function schedule(c, grade) {
    let { ease, interval, reps } = c;
    let wait;                                 // через сколько миллисекунд показать снова
    if (grade === 0) {
      reps = 0;
      interval = 0;
      ease = Math.max(1.3, ease - 0.2);
      wait = 60 * 1000;                       // через минуту, в этой же сессии
    } else {
      if (grade === 1) {
        interval = Math.max(1, interval * 1.2);
        ease = Math.max(1.3, ease - 0.15);
      } else if (grade === 2) {
        interval = reps === 0 ? 1 : reps === 1 ? 3 : interval * ease;
      } else {
        interval = reps === 0 ? 4 : interval * ease * 1.3;
        ease += 0.15;
      }
      interval = Math.round(interval * 10) / 10;
      reps += 1;
      wait = interval * DAY;
    }
    return { ease, interval, reps, due: Date.now() + wait, wait };
  }

  function rate(id, grade) {
    const cards = load();
    const c = cards.find((x) => x.id === id);
    if (!c) return null;
    Object.assign(c, schedule(c, grade));
    delete c.wait;
    save(cards);
    return c;
  }

  /** Подпись для кнопки: «1 мин», «3 дн», «2 нед», «1 мес». */
  function human(ms) {
    const min = ms / 60000;
    if (min < 60) return `${Math.max(1, Math.round(min))} мин`;
    const d = ms / DAY;
    if (d < 7) return `${Math.round(d)} дн`;
    if (d < 30) return `${Math.round(d / 7)} нед`;
    if (d < 365) return `${Math.round(d / 30)} мес`;
    return `${Math.round(d / 365)} г`;
  }
  /** Когда карточка будет снова: «сейчас», «завтра», «через 5 дн». */
  function whenText(c) {
    const ms = c.due - Date.now();
    if (ms <= 0) return "сейчас";
    if (ms < DAY) return "сегодня";
    if (ms < 2 * DAY) return "завтра";
    return "через " + human(ms);
  }

  // Готовые колоды, чтобы было с чего начать
  const STARTER = {
    "Английский: базовые слова": [
      ["apple", "яблоко"], ["house", "дом"], ["friend", "друг"], ["water", "вода"], ["book", "книга"],
      ["teacher", "учитель"], ["beautiful", "красивый"], ["to learn", "учить, изучать"], ["always", "всегда"], ["tomorrow", "завтра"],
      ["to remember", "помнить"], ["to forget", "забывать"], ["question", "вопрос"], ["answer", "ответ"], ["hungry", "голодный"],
      ["weather", "погода"], ["to understand", "понимать"], ["important", "важный"], ["enough", "достаточно"], ["although", "хотя"],
    ],
    "Столицы": [
      ["Франция", "Париж"], ["Германия", "Берлин"], ["Япония", "Токио"], ["Канада", "Оттава"], ["Австралия", "Канберра"],
      ["Турция", "Анкара"], ["Бразилия", "Бразилиа"], ["Италия", "Рим"], ["Испания", "Мадрид"], ["Казахстан", "Астана"],
    ],
    "Химические элементы": [
      ["H", "водород"], ["O", "кислород"], ["C", "углерод"], ["N", "азот"], ["Fe", "железо"],
      ["Au", "золото"], ["Ag", "серебро"], ["Na", "натрий"], ["Cu", "медь"], ["Hg", "ртуть"],
    ],
  };
  function addStarter(name) {
    const have = new Set(load().filter((c) => c.deck === name).map((c) => c.front));
    STARTER[name].forEach(([f, b]) => { if (!have.has(f)) add(name, f, b); });
  }

  return { load, save, add, remove, decks, due, schedule, rate, human, whenText, STARTER, addStarter };
})();
