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
    return {"ok": True, "ai": tutor.has_key()}


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
    lang: str = Field(default="ru", max_length=5)
    messages: list[dict]
    context: str = ""
    pet_name: str = "Питомец"
    species: str = "питомец"


@app.post("/api/tutor/chat")
def tutor_chat(body: ChatIn, user=Depends(current_user)):
    tutor.use_lang(body.lang)
    check_ai_limit(user)
    try:
        reply, tokens = tutor.chat(body.messages, body.context, body.pet_name[:30], body.species[:30])
        db.ai_count(user["id"], tokens)    # считаем только успешные ответы
        return {"reply": reply, "ai_left": max(0, AI_DAILY_LIMIT - db.ai_used_today(user["id"]))}
    except tutor.TutorError as e:
        raise HTTPException(503, str(e))


class GenIn(BaseModel):
    lang: str = Field(default="ru", max_length=5)
    topic: str = Field(max_length=60)
    level: str = Field(max_length=40)
    count: int = Field(default=10, ge=3, le=12)
    examples: list[list[str]] = []
    avoid: list[str] = []


@app.post("/api/ai/questions")
def ai_questions(body: GenIn, user=Depends(current_user)):
    tutor.use_lang(body.lang)
    check_ai_limit(user)
    try:
        ex = [(str(e[0])[:200], str(e[1])[:80]) for e in body.examples[:6] if len(e) >= 2]
        qs, tokens = tutor.gen_questions(body.topic, body.level, body.count, ex, [str(a)[:200] for a in body.avoid[:80]])
        db.ai_count(user["id"], tokens)
        return {"questions": qs, "ai_left": max(0, AI_DAILY_LIMIT - db.ai_used_today(user["id"]))}
    except tutor.TutorError as e:
        raise HTTPException(503, str(e))


class ExplainIn(BaseModel):
    lang: str = Field(default="ru", max_length=5)
    question: str = Field(max_length=400)
    answer: str = Field(max_length=200)
    chosen: str = Field(default="", max_length=200)


@app.post("/api/ai/explain")
def ai_explain(body: ExplainIn, user=Depends(current_user)):
    tutor.use_lang(body.lang)
    check_ai_limit(user)
    try:
        text, tokens = tutor.explain(body.question, body.answer, body.chosen)
        db.ai_count(user["id"], tokens)
        return {"text": text, "ai_left": max(0, AI_DAILY_LIMIT - db.ai_used_today(user["id"]))}
    except tutor.TutorError as e:
        raise HTTPException(503, str(e))


# ---------- классы: учитель видит прогресс учеников ----------
class ClassIn(BaseModel):
    name: str = Field(min_length=1, max_length=40)


class JoinIn(BaseModel):
    code: str = Field(min_length=4, max_length=10)


def _load(data, key, default):
    """Прогресс хранится как словарь «ключ localStorage → строка JSON»."""
    try:
        v = (data or {}).get(key)
        return json.loads(v) if isinstance(v, str) else (v if v is not None else default)
    except (ValueError, TypeError):
        return default


def student_summary(m):
    data = {}
    try:
        data = json.loads(m["data"]) if m["data"] else {}
    except ValueError:
        pass
    pet = _load(data, "petTeacher.pet", {}) or {}
    stats = _load(data, "petTeacher.stats", {}) or {}
    ielts = _load(data, "petTeacher.ielts", {}) or {}
    week = [db.days_ago(i) for i in range(7)]
    wk = [stats.get(d, {}) for d in week]
    streak = 0
    for i in range(0, 365):
        d = stats.get(db.days_ago(i), {})
        ok = (d.get("answers", 0) >= 10 or max(d.get("cards", 0), d.get("minutes", 0) // 3) >= 5 or d.get("ielts", 0) >= 1)
        if ok:
            streak += 1
        elif i > 0:
            break
    xp = pet.get("xp", 0) or 0
    return {
        "id": m["id"], "username": m["username"],
        "pet": pet.get("name"), "animal": pet.get("animal"), "level": xp // 30 + 1,
        "week_xp": sum(int(d.get("xp", 0) or 0) for d in wk),
        "week_answers": sum(int(d.get("answers", 0) or 0) for d in wk),
        "week_correct": sum(int(d.get("correct", 0) or 0) for d in wk),
        "week_days": sum(1 for d in week if d in m["days"]),
        "streak": streak, "last": m["days"][-1] if m["days"] else None,
        "correct": pet.get("correct", 0), "wrong": pet.get("wrong", 0),
        "ielts_done": len(ielts.get("done", [])) if isinstance(ielts, dict) else 0,
        "mock": (ielts.get("mock") or {}).get("overall") if isinstance(ielts, dict) else None,
        "placement": (pet.get("placement") or {}).get("level"),
    }


@app.get("/api/classes")
def my_classes(user=Depends(current_user)):
    return {"teaching": db.teacher_classes(user["id"]), "joined": db.joined_classes(user["id"])}


@app.post("/api/classes")
def new_class(body: ClassIn, user=Depends(current_user)):
    if len(db.teacher_classes(user["id"])) >= 20:
        raise HTTPException(400, "Можно создать не больше 20 классов")
    return db.create_class(user["id"], body.name.strip())


@app.post("/api/classes/join")
def join(body: JoinIn, request: Request, user=Depends(current_user)):
    keys = ("join:" + str(user["id"]),)
    check_throttle(*keys)
    c = db.class_by_code(body.code)
    if not c:
        note_fail(*keys)
        raise HTTPException(404, "Класс с таким кодом не найден. Проверь код у учителя.")
    if c["teacher_id"] == user["id"]:
        raise HTTPException(400, "Это твой собственный класс")
    db.join_class(c["id"], user["id"])
    return {"id": c["id"], "name": c["name"]}


@app.post("/api/classes/{class_id}/leave")
def leave(class_id: int, user=Depends(current_user)):
    db.leave_class(class_id, user["id"])
    return {"ok": True}


def own_class(class_id, user):
    c = db.class_by_id(class_id)
    if not c or c["teacher_id"] != user["id"]:
        raise HTTPException(404, "Класс не найден")
    return c


@app.get("/api/classes/{class_id}")
def class_detail(class_id: int, user=Depends(current_user)):
    c = own_class(class_id, user)
    return {"id": c["id"], "name": c["name"], "code": c["code"],
            "students": [student_summary(m) for m in db.class_members(class_id)]}


@app.post("/api/classes/{class_id}/remove/{student_id}")
def remove_student(class_id: int, student_id: int, user=Depends(current_user)):
    own_class(class_id, user)
    db.leave_class(class_id, student_id)
    return {"ok": True}


@app.post("/api/classes/{class_id}/delete")
def remove_class(class_id: int, user=Depends(current_user)):
    own_class(class_id, user)
    db.delete_class(class_id)
    return {"ok": True}


@app.get("/api/classes/{class_id}/board")
def class_board(class_id: int, user=Depends(current_user)):
    """Рейтинг недели для учеников класса: только имя, питомец и опыт за неделю."""
    c = db.class_by_id(class_id)
    if not c or not (db.is_member(class_id, user["id"]) or c["teacher_id"] == user["id"]):
        raise HTTPException(404, "Класс не найден")
    rows = [student_summary(m) for m in db.class_members(class_id)]
    rows.sort(key=lambda r: -r["week_xp"])
    return {"name": c["name"], "board": [{"username": r["username"], "pet": r["pet"], "animal": r["animal"],
                                          "week_xp": r["week_xp"], "streak": r["streak"], "me": r["id"] == user["id"]} for r in rows]}


class EssayIn(BaseModel):
    lang: str = Field(default="ru", max_length=5)
    kind: str
    prompt: str
    text: str = Field(min_length=20)


@app.post("/api/tutor/essay")
def tutor_essay(body: EssayIn, user=Depends(current_user)):
    tutor.use_lang(body.lang)
    check_ai_limit(user)
    try:
        result, tokens = tutor.check_essay(body.kind[:60], body.prompt[:2000], body.text)
        db.ai_count(user["id"], tokens)
        return result
    except tutor.TutorError as e:
        raise HTTPException(503, str(e))


class SpeakIn(BaseModel):
    lang: str = Field(default="ru", max_length=5)
    part: int = Field(ge=0, le=3)      # 0 — весь Speaking пробного экзамена
    question: str = Field(max_length=2000)
    transcript: str = Field(min_length=3, max_length=12000)
    seconds: int = Field(default=0, ge=0, le=3600)
    pauses: int = Field(default=0, ge=0, le=500)


@app.post("/api/tutor/speaking")
def tutor_speaking(body: SpeakIn, user=Depends(current_user)):
    tutor.use_lang(body.lang)
    check_ai_limit(user)
    try:
        result, tokens = tutor.check_speaking(body.part, body.question, body.transcript, body.seconds, body.pauses)
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
