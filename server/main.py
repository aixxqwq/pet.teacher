"""
Сервер Bilim Buddy (FastAPI).

Что делает:
  • отдаёт сам сайт (index.html, css, js);
  • аккаунты: регистрация, вход, выход;
  • хранит прогресс каждого пользователя в базе SQLite;
  • ИИ-учитель: чат и проверка эссе IELTS через DeepSeek.

Запуск (из папки pet-teacher):
  pip install -r server/requirements.txt
  python -m uvicorn server.main:app --port 8000
и открыть http://localhost:8000
"""
import json
import os
import re
import time

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)


def load_env():
    """Читаем server/.env: строки вида КЛЮЧ=значение (как в проекте CQA)."""
    path = os.path.join(HERE, ".env")
    if not os.path.exists(path):
        return
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env()
from . import db, tutor  # noqa: E402  (tutor читает переменные окружения при импорте)

AI_DAILY_LIMIT = int(os.getenv("AI_DAILY_LIMIT", "60"))   # сколько запросов к ИИ в день на одного ученика
# логины админов через запятую: ADMIN_USERS=aisha
ADMINS = {u.strip().lower() for u in os.getenv("ADMIN_USERS", "").split(",") if u.strip()}

db.init()
app = FastAPI(title="Bilim Buddy")


# ---------- кто делает запрос ----------
def current_user(authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ").strip()
    user = db.user_by_token(token) if token else None
    if not user:
        raise HTTPException(401, "Нужно войти в аккаунт")
    db.mark_active(user["id"])          # для статистики: «заходил сегодня»
    return user


def is_admin(user):
    return user["username"].lower() in ADMINS


def admin_user(user=Depends(current_user)):
    if not is_admin(user):
        raise HTTPException(403, "Эта страница только для админа")
    return user


# ---------- служебное ----------
@app.get("/api/health")
def health():
    return {"ok": True, "ai": tutor.has_key(), "model": tutor.DEEPSEEK_MODEL if tutor.has_key() else None}


# ---------- защита от перебора паролей ----------
# Храним в памяти время неудачных попыток. 8 ошибок за 15 минут — вход для этого логина/адреса закрыт на 15 минут.
FAILS: dict[str, list[float]] = {}
FAIL_LIMIT, FAIL_WINDOW = 8, 15 * 60


def client_ip(request: Request):
    return (request.headers.get("cf-connecting-ip") or request.headers.get("x-forwarded-for", "").split(",")[0]
            or (request.client.host if request.client else "?")).strip()


def recent(key, window=FAIL_WINDOW):
    now = time.time()
    FAILS[key] = [t for t in FAILS.get(key, []) if now - t < window]
    return FAILS[key]


def check_throttle(*keys, limit=FAIL_LIMIT, window=FAIL_WINDOW):
    for k in keys:
        if len(recent(k, window)) >= limit:
            raise HTTPException(429, "Слишком много попыток. Подожди 15 минут и попробуй снова.")


def note_fail(*keys):
    for k in keys:
        recent(k).append(time.time())
    if len(FAILS) > 10000:          # чтобы память не росла бесконечно
        for k in [k for k, v in FAILS.items() if not v]:
            FAILS.pop(k, None)


# ---------- аккаунты ----------
class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=24)
    password: str = Field(min_length=6, max_length=100)


@app.post("/api/register")
def register(c: Credentials, request: Request):
    ip = "reg:" + client_ip(request)
    check_throttle(ip, limit=10, window=3600)     # не больше 10 новых аккаунтов в час с одного адреса
    name = c.username.strip()
    if not re.fullmatch(r"[A-Za-zА-Яа-яЁё0-9_.-]{3,24}", name):
        raise HTTPException(400, "Логин: 3–24 символа, буквы, цифры, точка, _ или -")
    if db.find_user(name):
        raise HTTPException(409, "Такой логин уже занят")
    uid = db.create_user(name, c.password)
    recent(ip, 3600).append(time.time())
    return {"token": db.new_session(uid), "username": name}


@app.post("/api/login")
def login(c: Credentials, request: Request):
    keys = ("user:" + c.username.strip().lower(), "ip:" + client_ip(request))
    check_throttle(*keys)
    user = db.find_user(c.username.strip())
    if not user or not db.check_password(c.password, user["pass_hash"], user["salt"]):
        note_fail(*keys)
        raise HTTPException(401, "Неверный логин или пароль")
    return {"token": db.new_session(user["id"]), "username": user["username"]}


@app.post("/api/logout")
def logout(authorization: str = Header(default="")):
    db.delete_session(authorization.removeprefix("Bearer ").strip())
    return {"ok": True}


class DeleteIn(BaseModel):
    password: str


@app.post("/api/account/delete")
def delete_account(body: DeleteIn, request: Request, user=Depends(current_user)):
    keys = ("user:" + user["username"].lower(), "ip:" + client_ip(request))
    check_throttle(*keys)
    full = db.find_user(user["username"])
    if not db.check_password(body.password, full["pass_hash"], full["salt"]):
        note_fail(*keys)
        raise HTTPException(401, "Неверный пароль")
    db.delete_user(user["id"])
    return {"ok": True}


@app.get("/api/me")
def me(user=Depends(current_user)):
    return {"username": user["username"], "ai_left": max(0, AI_DAILY_LIMIT - db.ai_used_today(user["id"])),
            "is_admin": is_admin(user)}


# ---------- прогресс ----------
class Progress(BaseModel):
    data: dict


@app.get("/api/progress")
def get_progress(user=Depends(current_user)):
    row = db.get_progress(user["id"])
    return {"data": json.loads(row["data"]) if row else None, "updated": row["updated"] if row else 0}


@app.put("/api/progress")
def put_progress(p: Progress, user=Depends(current_user)):
    raw = json.dumps(p.data, ensure_ascii=False)
    if len(raw) > 5_000_000:
        raise HTTPException(413, "Слишком большой прогресс")
    return {"updated": db.save_progress(user["id"], raw)}


# ---------- ИИ-учитель ----------
def check_ai_limit(user):
    if db.ai_used_today(user["id"]) >= AI_DAILY_LIMIT:
        raise HTTPException(429, f"На сегодня лимит {AI_DAILY_LIMIT} вопросов учителю исчерпан. Завтра можно снова!")


class ChatIn(BaseModel):
    messages: list[dict]
    context: str = ""
    pet_name: str = "Питомец"
    species: str = "питомец"


@app.post("/api/tutor/chat")
def tutor_chat(body: ChatIn, user=Depends(current_user)):
    check_ai_limit(user)
    try:
        reply, tokens = tutor.chat(body.messages, body.context, body.pet_name[:30], body.species[:30])
        db.ai_count(user["id"], tokens)    # считаем только успешные ответы
        return {"reply": reply, "ai_left": max(0, AI_DAILY_LIMIT - db.ai_used_today(user["id"]))}
    except tutor.TutorError as e:
        raise HTTPException(503, str(e))


class EssayIn(BaseModel):
    kind: str
    prompt: str
    text: str = Field(min_length=20)


@app.post("/api/tutor/essay")
def tutor_essay(body: EssayIn, user=Depends(current_user)):
    check_ai_limit(user)
    try:
        result, tokens = tutor.check_essay(body.kind[:60], body.prompt[:2000], body.text)
        db.ai_count(user["id"], tokens)
        return result
    except tutor.TutorError as e:
        raise HTTPException(503, str(e))


# ---------- статистика ----------
ROUTES = {"home", "learn", "quiz", "cards", "review", "ielts", "tutor", "focus", "my", "new", "account", "admin"}


class Visit(BaseModel):
    route: str


@app.post("/api/visit")
def visit(v: Visit):
    """Анонимный счётчик: какой раздел открыли (без имени и без IP)."""
    if v.route in ROUTES:
        db.add_visit(v.route)
    return {"ok": True}


@app.get("/api/admin/stats")
def admin_stats(user=Depends(admin_user)):
    return db.admin_stats()


# ---------- сам сайт ----------
# Отдаём только папки сайта. Папку server/ (там .env с ключом и база) наружу не показываем!
for folder in ("css", "js", "fonts", "img", "audio"):
    app.mount(f"/{folder}", StaticFiles(directory=os.path.join(SITE, folder)), name=folder)


@app.get("/")
@app.get("/index.html")
def index():
    # no-cache: браузер каждый раз сверяется с сервером, поэтому после обновления сайта сразу видна новая версия
    return FileResponse(os.path.join(SITE, "index.html"), headers={"Cache-Control": "no-cache"})
