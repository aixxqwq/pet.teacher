/*
  Связь с сервером: аккаунт и синхронизация прогресса.

  Сайт работает и без сервера (прогресс в localStorage). Если сайт открыт через сервер
  (run.bat → http://localhost:8000) и ты вошла в аккаунт, весь прогресс раз в 10 секунд
  отправляется на сервер в базу данных — и на другом компьютере его можно загрузить, войдя в аккаунт.
*/
const Api = (() => {
  const KEY = "petTeacher.auth";        // {token, username} — этот ключ на сервер не отправляем
  let health = null;
  let lastSent = "";
  let lastSync = 0;

  const auth = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };

  async function req(method, path, body) {
    const a = auth();
    const headers = { "Content-Type": "application/json" };
    if (a) headers.Authorization = "Bearer " + a.token;
    // ИИ отвечает на языке сайта
    if (body && /^\/api\/(tutor|ai)\//.test(path) && typeof I18N !== "undefined") body = Object.assign({ lang: I18N.lang() }, body);
    let r;
    try {
      r = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch (e) {
      throw new Error("Нет связи с сервером. Проверь интернет и попробуй ещё раз.");
    }
    let data = {};
    try { data = await r.json(); } catch (e) { /* пустой ответ */ }
    if (!r.ok) {
      const msg = typeof data.detail === "string" ? data.detail : r.status === 422 ? "Проверь логин (от 3 символов) и пароль (от 6 символов)" : "Ошибка сервера";
      if (r.status === 401 && a && !path.endsWith("/login")) localStorage.removeItem(KEY);   // сессия устарела
      const err = new Error(msg);
      err.status = r.status;
      throw err;
    }
    return data;
  }

  /** Есть ли сервер (сайт может быть открыт и просто как файл). */
  async function checkServer() {
    if (location.protocol === "file:") return (health = { ok: false });
    try {
      const r = await fetch("/api/health");
      health = r.ok ? await r.json() : { ok: false };
    } catch (e) {
      health = { ok: false };
    }
    return health;
  }

  // ---------- синхронизация ----------
  function snapshot() {
    const o = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith("petTeacher.") && k !== KEY) o[k] = localStorage.getItem(k);
    }
    return o;
  }
  async function push(force) {
    if (!auth() || !health || !health.ok) return;
    const s = JSON.stringify(snapshot());
    if (!force && s === lastSent) return;
    await req("PUT", "/api/progress", { data: JSON.parse(s) });
    lastSent = s;
    lastSync = Date.now();
  }
  function apply(data) {
    Object.keys(snapshot()).forEach((k) => localStorage.removeItem(k));
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
    lastSent = JSON.stringify(snapshot());
    lastSync = Date.now();
  }

  /** После входа: если в аккаунте уже есть прогресс — загружаем его, иначе сохраняем текущий. */
  async function afterLogin() {
    const r = await req("GET", "/api/progress");
    if (r.data && Object.keys(r.data).length) { apply(r.data); return "pulled"; }
    await push(true);
    return "pushed";
  }

  async function login(username, password, isNew) {
    const r = await req("POST", isNew ? "/api/register" : "/api/login", { username, password });
    localStorage.setItem(KEY, JSON.stringify({ token: r.token, username: r.username }));
    return afterLogin();
  }

  async function logout() {
    try { await push(true); } catch (e) { /* не страшно */ }
    try { await req("POST", "/api/logout"); } catch (e) { /* уже вышли */ }
    localStorage.removeItem(KEY);
    // данные остаются в аккаунте, а с этого компьютера стираем — вдруг он общий
    Object.keys(snapshot()).forEach((k) => localStorage.removeItem(k));
  }

  /** Удалить аккаунт навсегда (нужен пароль) и стереть данные с этого компьютера. */
  async function deleteAccount(password) {
    await req("POST", "/api/account/delete", { password });
    localStorage.removeItem(KEY);
    Object.keys(snapshot()).forEach((k) => localStorage.removeItem(k));
  }

  /** Анонимный счётчик открытых разделов (для статистики админа). */
  function visit(route) {
    if (!health || !health.ok) return;
    fetch("/api/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ route }) }).catch(() => {});
  }

  setInterval(() => push().catch(() => {}), 10000);
  document.addEventListener("visibilitychange", () => { if (document.hidden) push().catch(() => {}); });

  return { auth, req, checkServer, health: () => health, login, logout, deleteAccount, push, visit, lastSync: () => lastSync };
})();
