/*
  Фокус-таймер (техника «помидора»): 25 минут учёбы → 5 минут перерыва,
  после каждой четвёртой сессии — длинный перерыв.

  Таймер хранит не «сколько осталось», а момент окончания (endAt).
  Поэтому он идёт правильно, даже если переключить страницу или обновить вкладку.
*/
const Timer = (() => {
  const KEY = "petTeacher.timer";
  const MODES = {
    focus: { label: "Фокус", presets: [15, 25, 45, 60] },
    short: { label: "Перерыв", presets: [5, 10] },
    long: { label: "Длинный перерыв", presets: [15, 20, 30] },
  };

  const st = Object.assign({
    mode: "focus",
    minutes: { focus: 25, short: 5, long: 15 },
    running: false,
    endAt: 0,
    left: 25 * 60000,
    task: "",
    sound: true,
    done: 0,            // сколько сессий фокуса закончено подряд
  }, Game.readJSON(KEY, {}));

  const listeners = new Set();
  const emit = (type, data) => listeners.forEach((fn) => fn(type, data));
  const save = () => Game.writeJSON(KEY, st);

  const total = () => st.minutes[st.mode] * 60000;
  const remaining = () => (st.running ? Math.max(0, st.endAt - Date.now()) : st.left);

  function start() {
    if (st.running) return;
    st.endAt = Date.now() + st.left;
    st.running = true;
    save();
    emit("start");
  }
  function pause() {
    if (!st.running) return;
    st.left = remaining();
    st.running = false;
    save();
    emit("pause");
  }
  function reset() {
    st.running = false;
    st.left = total();
    save();
    emit("reset");
  }
  function setMode(mode) {
    st.mode = mode;
    st.running = false;
    st.left = total();
    save();
    emit("mode");
  }
  function setMinutes(min) {
    st.minutes[st.mode] = min;
    if (!st.running) st.left = total();
    save();
    emit("minutes");
  }
  function complete(skipped) {
    const mode = st.mode, minutes = st.minutes[mode];
    let next = "focus";
    if (mode === "focus") {
      if (!skipped) st.done += 1;
      next = st.done > 0 && st.done % 4 === 0 && !skipped ? "long" : "short";
    }
    st.running = false;
    st.mode = next;
    st.left = st.minutes[next] * 60000;
    save();
    emit("complete", { mode, minutes, skipped });
  }

  // Мягкий звук «динь-динь» через Web Audio (без файлов)
  function chime() {
    if (!st.sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [660, 880, 1320].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = f;
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + 1);
      });
    } catch (e) { /* звук недоступен */ }
  }

  setInterval(() => {
    if (st.running && remaining() <= 0) complete(false);
    emit("tick");
  }, 250);

  const fmt = (ms) => {
    const s = Math.ceil(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };

  return {
    MODES, state: () => st, total, remaining, fmt,
    start, pause, reset, setMode, setMinutes, skip: () => complete(true), chime,
    setTask(t) { st.task = t; save(); },
    setSound(on) { st.sound = on; save(); },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();
