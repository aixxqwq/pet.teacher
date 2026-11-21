"""
Логика питомца: создание, сохранение в JSON, загрузка, действия.
Здесь нет окна и кнопок — только "мозг" игры. Окно лежит в main.py.
"""
import json
import os
import random
import time
from datetime import datetime

# Папка, где лежит этот файл. Сохранение и вопросы ищем рядом с ним,
# чтобы игра работала, откуда бы её ни запустили.
FOLDER = os.path.dirname(os.path.abspath(__file__))
SAVE_FILE = os.path.join(FOLDER, "save.json")
QUESTIONS_FILE = os.path.join(FOLDER, "questions.json")

MAX = 10              # максимум для каждой шкалы
HOURS_PER_POINT = 2   # пока игра закрыта, каждые 2 часа шкалы меняются на 1
XP_PER_LEVEL = 30     # сколько опыта нужно на один уровень

ANIMALS = {
    "unicorn": {
        "title": "Единорог",
        "emoji": "🦄",
        "food": "радужное яблоко",
        "phrases": ["Иго-го-сверк! ✨", "Я верю в тебя!", "Ещё одну радугу!", "Мой рог светится от гордости"],
    },
    "sheep": {
        "title": "Овечка",
        "emoji": "🐑",
        "food": "клевер",
        "phrases": ["Бееее!", "Мягко и уютно", "Ты умничка, беее", "Пойдём на лужайку?"],
    },
    "dragon": {
        "title": "Дракончик",
        "emoji": "🐉",
        "food": "огненный перчик",
        "phrases": ["Р-р-р! 🔥", "Я почти научился летать!", "Знания — моё сокровище", "Хочу ещё задачку!"],
    },
    "worm": {
        "title": "Червяк",
        "emoji": "🪱",
        "food": "сочный листик",
        "phrases": ["Шур-шур...", "Я книжный червь!", "Ползу к знаниям", "Ещё листочек, пожалуйста"],
    },
    "penguin": {
        "title": "Пингвин",
        "emoji": "🐧",
        "food": "рыбка",
        "phrases": ["Ква... то есть, привет!", "Скользим дальше!", "Холодно, но весело", "Рыбку за ответ?"],
    },
    "panda": {
        "title": "Панда",
        "emoji": "🐼",
        "food": "бамбук",
        "phrases": ["Ням-ням бамбук", "Обнимашки!", "Я ленивая, но умная", "Ещё вопросик?"],
    },
}


def limit(value):
    """Не даём шкале уйти ниже 0 или выше MAX (это твоя функция из program.py)."""
    if value > MAX:
        return MAX
    if value < 0:
        return 0
    return value


# ---------- создание, сохранение, загрузка ----------

def new_pet(name, animal):
    """Создаём нового питомца — обычный словарь, как в program.py."""
    return {
        "name": name,
        "animal": animal,
        "food": 5,
        "fun": 5,
        "energy": 5,
        "xp": 0,
        "correct": 0,
        "wrong": 0,
        "streak": 0,
        "best_streak": 0,
        "born": datetime.now().strftime("%Y-%m-%d"),
        "last_update": time.time(),  # когда последний раз считали время
    }


def save_pet(pet):
    """Записываем словарь питомца в файл save.json."""
    with open(SAVE_FILE, "w", encoding="utf-8") as f:
        # ensure_ascii=False — чтобы русские буквы остались буквами, а не А...
        # indent=2 — чтобы файл был красивый, с отступами
        json.dump(pet, f, ensure_ascii=False, indent=2)


def load_pet():
    """Читаем питомца из save.json. Если файла нет или он сломан — возвращаем None."""
    if not os.path.exists(SAVE_FILE):
        return None
    try:
        with open(SAVE_FILE, "r", encoding="utf-8") as f:
            pet = json.load(f)
    except (json.JSONDecodeError, OSError):
        return None
    if pet.get("animal") not in ANIMALS:
        return None
    # Если в старом сохранении нет какого-то нового поля — добавим его.
    for key, value in new_pet(pet.get("name", "Питомец"), pet["animal"]).items():
        pet.setdefault(key, value)
    return pet


def delete_save():
    if os.path.exists(SAVE_FILE):
        os.remove(SAVE_FILE)


# ---------- время ----------

def apply_time_passed(pet):
    """
    Пока игра была закрыта, питомец проголодался и соскучился, зато отдохнул.
    Возвращает, сколько "шагов времени" прошло.
    """
    now = time.time()
    hours = (now - pet["last_update"]) / 3600
    steps = int(hours // HOURS_PER_POINT)
    if steps > 0:
        pet["food"] = limit(pet["food"] - steps)
        pet["fun"] = limit(pet["fun"] - steps)
        pet["energy"] = limit(pet["energy"] + steps)
        # двигаем время ровно на прошедшие шаги, чтобы "остаток" не потерялся
        pet["last_update"] += steps * HOURS_PER_POINT * 3600
    return steps


# ---------- уровень и настроение ----------

def level(pet):
    return 1 + pet["xp"] // XP_PER_LEVEL


def xp_in_level(pet):
    """Сколько опыта набрано внутри текущего уровня (для полоски)."""
    return pet["xp"] % XP_PER_LEVEL


def stage(pet):
    lvl = level(pet)
    if lvl <= 2:
        return "малыш"
    if lvl <= 5:
        return "подросток"
    if lvl <= 9:
        return "взрослый"
    return "мудрец"


def mood(pet):
    """Что питомец сейчас "говорит" о себе."""
    if pet["food"] == 0:
        return "Я ужасно голодный... ответь на вопрос, покорми меня!"
    if pet["food"] <= 3:
        return "Хочу кушать! Давай поучимся?"
    if pet["energy"] <= 2:
        return "Глазки закрываются... уложи меня спать"
    if pet["fun"] <= 3:
        return "Мне скучно, поиграй со мной!"
    return random.choice(ANIMALS[pet["animal"]]["phrases"])


# ---------- действия ----------

def answer(pet, is_correct):
    """Питомца кормят ответом на вопрос. Возвращает текст-реакцию."""
    food_name = ANIMALS[pet["animal"]]["food"]
    if is_correct:
        old_level = level(pet)
        pet["correct"] += 1
        pet["streak"] += 1
        pet["best_streak"] = max(pet["best_streak"], pet["streak"])
        pet["food"] = limit(pet["food"] + 3)
        pet["xp"] += 10
        text = f"Верно! {pet['name']} получает {food_name} 😋"
        if pet["streak"] % 5 == 0:
            pet["fun"] = limit(pet["fun"] + 2)
            pet["xp"] += 10
            text += f"\nСерия {pet['streak']} подряд! Бонус +10 опыта 🎉"
        if level(pet) > old_level:
            text += f"\nНовый уровень: {level(pet)}! Теперь {pet['name']} — {stage(pet)} ⭐"
    else:
        pet["wrong"] += 1
        pet["streak"] = 0
        pet["fun"] = limit(pet["fun"] - 1)
        text = f"Не совсем... {pet['name']} всё равно тебя любит 💛"
    return text


def play(pet):
    if pet["energy"] < 2:
        return f"{pet['name']} слишком устал(а) для игр. Сначала поспать!"
    pet["fun"] = limit(pet["fun"] + 3)
    pet["energy"] = limit(pet["energy"] - 2)
    pet["food"] = limit(pet["food"] - 1)
    pet["xp"] += 2
    return f"{pet['name']} говорит: {random.choice(ANIMALS[pet['animal']]['phrases'])}"


def sleep(pet):
    if pet["energy"] >= MAX:
        return f"{pet['name']} бодр(а) и не хочет спать!"
    pet["energy"] = limit(pet["energy"] + 4)
    return f"{pet['name']} спит... zzz 💤"


# ---------- вопросы ----------

def load_questions():
    """Вопросы лежат в questions.json — его можно открыть и дописать свои."""
    try:
        with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def math_question():
    """Примеры по математике придумываются сами, их бесконечно много."""
    op = random.choice(["+", "-", "×"])
    if op == "×":
        a, b = random.randint(2, 9), random.randint(2, 9)
        right = a * b
    elif op == "+":
        a, b = random.randint(10, 99), random.randint(10, 99)
        right = a + b
    else:
        a = random.randint(20, 99)
        b = random.randint(1, a)
        right = a - b
    options = {right}
    while len(options) < 4:
        options.add(right + random.choice([-10, -2, -1, 1, 2, 10]))
    options = list(options)
    random.shuffle(options)
    return {
        "category": "Математика",
        "question": f"Сколько будет {a} {op} {b}?",
        "answers": [str(x) for x in options],
        "correct": options.index(right),
    }


def categories(questions):
    names = sorted({q["category"] for q in questions})
    return ["Все"] + names + ["Математика"]


def random_question(questions, category="Все"):
    if category == "Математика":
        return math_question()
    pool = [q for q in questions if category == "Все" or q["category"] == category]
    if category == "Все" and random.random() < 0.25:
        return math_question()
    if not pool:
        return math_question()
    q = dict(random.choice(pool))
    # перемешиваем варианты, чтобы правильный ответ не был всегда на одном месте
    right_text = q["answers"][q["correct"]]
    answers = list(q["answers"])
    random.shuffle(answers)
    q["answers"] = answers
    q["correct"] = answers.index(right_text)
    return q
