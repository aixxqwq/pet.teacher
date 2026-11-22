"""
Собирает js/questions.js: старые вопросы + новые из bank_stem.py и bank_hum.py.
Запуск из папки pet-teacher:  python tools/build_questions.py
Повторный запуск не создаёт дублей (вопросы сравниваются по теме, уровню и тексту).
"""
import collections
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bank_hum  # noqa: E402
import bank_stem  # noqa: E402

PATH = os.path.join(HERE, "..", "js", "questions.js")
js = open(PATH, encoding="utf-8").read()
marker = "window.QUESTIONS = "
head = js[: js.index(marker)]
old = json.loads(js[js.index(marker) + len(marker):].rstrip().rstrip(";"))

index = {(q["topic"], q["level"], q["question"]): i for i, q in enumerate(old)}
seen = set(index)
added = 0
for q in bank_stem.Q + bank_hum.Q:
    key = (q["topic"], q["level"], q["question"])
    if key in seen:
        if key in index:
            old[index[key]] = q          # вопрос уже есть — обновляем (например, перерисованный график)
        continue
    assert q["answer"] not in q["wrong"], q
    seen.add(key)
    old.append(q)
    added += 1

body = ",\n".join("  " + json.dumps(x, ensure_ascii=False) for x in old)
open(PATH, "w", encoding="utf-8").write(head + marker + "[\n" + body + "\n];\n")

print("добавлено:", added, "всего:", len(old))
c = collections.Counter((q["topic"], q["level"]) for q in old)
for (t, l), n in sorted(c.items()):
    print(f"  {t} · {l}: {n}")
