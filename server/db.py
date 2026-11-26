"""
База данных: пользователи, сессии входа, прогресс, счётчик запросов к ИИ и статистика.

Работает с двумя видами баз:
  • на твоём компьютере — SQLite: база в одном файле server/data/pet_teacher.db, встроена в Python;
  • в интернете — PostgreSQL (например, бесплатная база Neon). Включается, если задана
    переменная окружения DATABASE_URL. На бесплатном хостинге файлы стираются при перезапуске,
    поэтому аккаунты нужно хранить в отдельной облачной базе.
SQL-запросы пишем одинаково для обеих баз, а знаки «?» сами заменяются на «%s» для PostgreSQL.
"""
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time

HERE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.getenv("PET_DB") or os.path.join(HERE, "data", "pet_teacher.db")   # PET_DB — для тестов
DATABASE_URL = os.getenv("DATABASE_URL", "")
PG = DATABASE_URL.startswith(("postgres://", "postgresql://"))


class Conn:
    """Обёртка над соединением: один и тот же код для SQLite и PostgreSQL."""

    def __init__(self):
        if PG:
            import psycopg
            from psycopg.rows import dict_row
            self.con = psycopg.connect(DATABASE_URL, row_factory=dict_row)
        else:
            os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
            self.con = sqlite3.connect(DB_PATH)
            self.con.row_factory = sqlite3.Row

    def execute(self, sql, params=()):
        if PG:
            sql = sql.replace("?", "%s")
        return self.con.execute(sql, params)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, *rest):
        if exc_type is None:
            self.con.commit()
        else:
            self.con.rollback()
        self.con.close()


connect = Conn


def init():
    auto_id = "SERIAL PRIMARY KEY" if PG else "INTEGER PRIMARY KEY AUTOINCREMENT"
    real = "DOUBLE PRECISION" if PG else "REAL"
    schema = f"""
        CREATE TABLE IF NOT EXISTS users (
            id {auto_id},
            username TEXT NOT NULL,
            pass_hash TEXT NOT NULL,          -- пароль хранится только как хэш
            salt TEXT NOT NULL,
            created {real} NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS users_name ON users (lower(username));
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,           -- случайный ключ, который браузер присылает в каждом запросе
            user_id INTEGER NOT NULL REFERENCES users(id),
            created {real} NOT NULL
        );
        CREATE TABLE IF NOT EXISTS progress (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            data TEXT NOT NULL,               -- весь прогресс сайта одним JSON
            updated {real} NOT NULL
        );
        CREATE TABLE IF NOT EXISTS ai_usage (
            user_id INTEGER NOT NULL,
            day TEXT NOT NULL,
            count INTEGER NOT NULL,
            tokens INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (user_id, day)
        );
        CREATE TABLE IF NOT EXISTS visits (     -- сколько раз открывали каждый раздел (без имён)
            day TEXT NOT NULL,
            route TEXT NOT NULL,
            count INTEGER NOT NULL,
            PRIMARY KEY (day, route)
        );
        CREATE TABLE IF NOT EXISTS activity (   -- в какие дни заходил каждый пользователь
            user_id INTEGER NOT NULL,
            day TEXT NOT NULL,
            PRIMARY KEY (user_id, day)
        )"""
    with connect() as con:
        for stmt in schema.split(";"):
            sql = "\n".join(line.split("--")[0] for line in stmt.splitlines()).strip()
            if sql:
                con.execute(sql)
        # старые локальные базы: добавить колонку tokens, если её ещё нет
        if not PG:
            cols = {r["name"] for r in con.execute("PRAGMA table_info(ai_usage)")}
            if "tokens" not in cols:
                con.execute("ALTER TABLE ai_usage ADD COLUMN tokens INTEGER NOT NULL DEFAULT 0")


# ---------- пароли ----------
def hash_password(password, salt=None):
    """PBKDF2: пароль 200 000 раз «перемешивается» с солью. Из хэша пароль не восстановить."""
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
    return digest, salt


def check_password(password, pass_hash, salt):
    return hmac.compare_digest(hash_password(password, salt)[0], pass_hash)


# ---------- пользователи и сессии ----------
def create_user(username, password):
    digest, salt = hash_password(password)
    with connect() as con:
        row = con.execute("INSERT INTO users (username, pass_hash, salt, created) VALUES (?, ?, ?, ?) RETURNING id",
                          (username, digest, salt, time.time())).fetchone()
        return row["id"]


def find_user(username):
    with connect() as con:
        return con.execute("SELECT * FROM users WHERE lower(username) = lower(?)", (username,)).fetchone()


SESSION_DAYS = 60       # через сколько дней без перевхода сессия истекает


def new_session(user_id):
    token = secrets.token_urlsafe(32)
    with connect() as con:
        con.execute("DELETE FROM sessions WHERE created < ?", (time.time() - SESSION_DAYS * 86400,))   # чистим старые
        con.execute("INSERT INTO sessions (token, user_id, created) VALUES (?, ?, ?)", (token, user_id, time.time()))
    return token


def user_by_token(token):
    with connect() as con:
        return con.execute("SELECT u.id, u.username FROM sessions s JOIN users u ON u.id = s.user_id "
                           "WHERE s.token = ? AND s.created > ?", (token, time.time() - SESSION_DAYS * 86400)).fetchone()


def delete_user(user_id):
    """Стереть пользователя и всё, что с ним связано."""
    with connect() as con:
        for table in ("sessions", "progress", "ai_usage", "activity"):
            con.execute(f"DELETE FROM {table} WHERE user_id = ?", (user_id,))
        con.execute("DELETE FROM users WHERE id = ?", (user_id,))


def delete_session(token):
    with connect() as con:
        con.execute("DELETE FROM sessions WHERE token = ?", (token,))


# ---------- прогресс ----------
def get_progress(user_id):
    with connect() as con:
        return con.execute("SELECT data, updated FROM progress WHERE user_id = ?", (user_id,)).fetchone()


def save_progress(user_id, data):
    now = time.time()
    with connect() as con:
        con.execute("INSERT INTO progress (user_id, data, updated) VALUES (?, ?, ?) "
                    "ON CONFLICT (user_id) DO UPDATE SET data = excluded.data, updated = excluded.updated",
                    (user_id, data, now))
    return now


# ---------- лимит запросов к ИИ (чтобы не потратить весь баланс) ----------
def today():
    return time.strftime("%Y-%m-%d")


def ai_used_today(user_id):
    with connect() as con:
        row = con.execute("SELECT count FROM ai_usage WHERE user_id = ? AND day = ?", (user_id, today())).fetchone()
    return row["count"] if row else 0


def ai_count(user_id, tokens=0):
    with connect() as con:
        con.execute("INSERT INTO ai_usage (user_id, day, count, tokens) VALUES (?, ?, 1, ?) "
                    "ON CONFLICT (user_id, day) DO UPDATE SET count = ai_usage.count + 1, tokens = ai_usage.tokens + excluded.tokens",
                    (user_id, today(), tokens))


# ---------- статистика для админа ----------
def mark_active(user_id):
    """Отмечаем, что пользователь сегодня заходил (одна строка на день)."""
    with connect() as con:
        con.execute("INSERT INTO activity (user_id, day) VALUES (?, ?) ON CONFLICT DO NOTHING", (user_id, today()))


def add_visit(route):
    with connect() as con:
        con.execute("INSERT INTO visits (day, route, count) VALUES (?, ?, 1) "
                    "ON CONFLICT (day, route) DO UPDATE SET count = visits.count + 1", (today(), route))


def days_ago(n):
    return time.strftime("%Y-%m-%d", time.localtime(time.time() - n * 86400))


def admin_stats():
    now_day, week = days_ago(0), days_ago(6)
    with connect() as con:
        def q(sql, *a):
            row = con.execute(sql, a).fetchone()
            return (row["v"] if row else 0) or 0

        summary = {
            "users": q("SELECT COUNT(*) AS v FROM users"),
            "new_week": q("SELECT COUNT(*) AS v FROM users WHERE created >= ?", time.time() - 7 * 86400),
            "active_today": q("SELECT COUNT(DISTINCT user_id) AS v FROM activity WHERE day = ?", now_day),
            "active_week": q("SELECT COUNT(DISTINCT user_id) AS v FROM activity WHERE day >= ?", week),
            "ai_today": q("SELECT SUM(count) AS v FROM ai_usage WHERE day = ?", now_day),
            "ai_week": q("SELECT SUM(count) AS v FROM ai_usage WHERE day >= ?", week),
            "tokens_week": q("SELECT SUM(tokens) AS v FROM ai_usage WHERE day >= ?", week),
            "visits_week": q("SELECT SUM(count) AS v FROM visits WHERE day >= ?", week),
        }
        # новые регистрации по дням считаем в Python (дата из времени создания)
        created_days = [time.strftime("%Y-%m-%d", time.localtime(r["created"]))
                        for r in con.execute("SELECT created FROM users")]
        daily = []
        for d in [days_ago(i) for i in range(13, -1, -1)]:
            daily.append({
                "day": d,
                "active": q("SELECT COUNT(*) AS v FROM activity WHERE day = ?", d),
                "new": created_days.count(d),
                "ai": q("SELECT SUM(count) AS v FROM ai_usage WHERE day = ?", d),
            })
        routes = [{"route": r["route"], "count": r["c"]} for r in con.execute(
            "SELECT route, SUM(count) AS c FROM visits WHERE day >= ? GROUP BY route ORDER BY c DESC", (week,))]
        users = []
        for u in con.execute("SELECT id, username, created FROM users ORDER BY created DESC LIMIT 200").fetchall():
            last = con.execute("SELECT MAX(day) AS v FROM activity WHERE user_id = ?", (u["id"],)).fetchone()["v"]
            pet = {}
            row = con.execute("SELECT data FROM progress WHERE user_id = ?", (u["id"],)).fetchone()
            if row:
                try:
                    raw = json.loads(row["data"]).get("petTeacher.pet")
                    p = json.loads(raw) if raw else {}
                    pet = {"name": p.get("name"), "animal": p.get("animal"), "xp": p.get("xp", 0), "correct": p.get("correct", 0)}
                except (ValueError, AttributeError):
                    pass
            users.append({"username": u["username"], "created": u["created"], "last": last,
                          "days_active": q("SELECT COUNT(*) AS v FROM activity WHERE user_id = ?", u["id"]),
                          "ai": q("SELECT SUM(count) AS v FROM ai_usage WHERE user_id = ?", u["id"]), "pet": pet})
    return {"summary": summary, "daily": daily, "routes": routes, "users": users}
