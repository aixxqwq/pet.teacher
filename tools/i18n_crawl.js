// Вставляется в консоль браузера на сайте с включённым казахским (petTeacher.lang = "kk").
// Обходит страницы и собирает фразы, которые остались по-русски (нет казахских букв).
(async () => {
  const KZ = /[әғқңөұүһіӘҒҚҢӨҰҮҺІ]/;
  const RU = /[а-яё]/i;
  const SKIP = ".q-text, .opt, .lr-passage, .lr-q, .msg, .model, .cue, textarea, script, style, [data-noi18n], .lr-script, .lr-list, .lr-instr, .lr-title, .lr-ex";
  const found = new Map();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const grab = (where) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode, p = n.parentElement;
      if (!p || p.closest(SKIP) || p.closest("#pet-defs")) continue;
      const t = n.nodeValue.trim();
      if (t && RU.test(t) && !KZ.test(t)) found.set(t, where);
    }
    document.querySelectorAll("[placeholder],[title],[aria-label]").forEach((el) => {
      if (el.closest(SKIP)) return;
      ["placeholder", "title", "aria-label"].forEach((a) => { const t = (el.getAttribute(a) || "").trim(); if (t && RU.test(t) && !KZ.test(t)) found.set(t, where + " @" + a); });
    });
  };
  const go = async (h, ms = 700) => { location.hash = h; await wait(ms); grab(h); };
  const click = async (sel, ms = 400, tag = sel) => { const el = document.querySelector(sel); if (el) { el.click(); await wait(ms); grab(tag); } };
  for (const h of ["#/", "#/learn", "#/cards", "#/tutor", "#/focus", "#/my", "#/account", "#/class", "#/shop", "#/privacy", "#/new"]) await go(h);
  await go("#/quiz");
  const q = document.querySelector(".opt"); if (q) { q.click(); await wait(300); grab("quiz-answer"); await click("#whyBtn", 400, "why"); }
  await go("#/ielts");
  for (const t of ["listening", "reading", "speaking", "writing", "models", "mock"]) await click(`#ieltsTabs [data-tab=${t}]`, 500, "ielts-" + t);
  await click("#mStart", 500, "mock-listening");
  await go("#/test"); await click(".opt", 300, "test");
  await go("#/");
  await click("#actPlay", 900, "rest-break");
  for (const id of ["breath", "stretch", "pairs", "pet"]) await click(`.idea[data-id=${id}]`, 300, "idea-" + id);
  await click("#restStop", 700, "after-break");
  await click("#actSleep", 900, "rest-sleep");
  await click("#restStop", 700, "after-sleep");
  document.querySelectorAll(".toast").forEach((t) => { const s = t.innerText.trim(); if (s && !KZ.test(s)) found.set(s, "toast"); });
  window.__ru = [...found.entries()];
  return window.__ru.length;
})();
