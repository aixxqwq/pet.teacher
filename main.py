"""
Питомец-учитель — окно игры на tkinter.
Запуск:  python main.py
"""
import tkinter as tk
from tkinter import messagebox

import pet as logic

# ---------- цвета и шрифты ----------
BG = "#fdf6ff"
CARD = "#ffffff"
TEXT = "#3b2a4a"
MUTED = "#8a7a99"
ACCENT = "#a66cff"
GOOD = "#5cc98a"
BAD = "#ff7a8a"
BAR_COLORS = {"food": "#ffb347", "fun": "#ff7ab8", "energy": "#5ab0ff", "xp": "#a66cff"}

FONT = "Segoe UI"
EMOJI_FONT = "Segoe UI Emoji"


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Питомец-учитель")
        # размер окна подстраиваем под масштаб экрана (100%, 125%, 150%...)
        zoom = self.winfo_fpixels("1i") / 96
        self.geometry(f"{int(520 * zoom)}x{int(700 * zoom)}")
        self.minsize(int(460 * zoom), int(640 * zoom))
        self.configure(bg=BG)

        self.questions = logic.load_questions()
        self.category = tk.StringVar(value="Все")
        self.pet = logic.load_pet()

        self.screen = tk.Frame(self, bg=BG)
        self.screen.pack(fill="both", expand=True, padx=20, pady=16)

        self.protocol("WM_DELETE_WINDOW", self.on_close)

        if self.pet:
            steps = logic.apply_time_passed(self.pet)
            note = None
            if steps:
                note = f"Пока тебя не было, {self.pet['name']} немного проголодался(ась) и соскучился(ась)."
            self.show_home(note)
        else:
            self.show_choose()

        self.after(60_000, self.tick)

    # ---------- общее ----------

    def clear(self):
        for widget in self.screen.winfo_children():
            widget.destroy()

    def save(self):
        if self.pet:
            logic.save_pet(self.pet)

    def on_close(self):
        self.save()
        self.destroy()

    def tick(self):
        """Раз в минуту проверяем время: вдруг питомец проголодался, пока окно открыто."""
        if self.pet and logic.apply_time_passed(self.pet):
            self.save()
            if getattr(self, "on_home", False):
                self.show_home()
        self.after(60_000, self.tick)

    def button(self, parent, text, command, color=ACCENT, **kw):
        return tk.Button(
            parent, text=text, command=command, bg=color, fg="white",
            activebackground=color, activeforeground="white",
            font=(FONT, 12, "bold"), relief="flat", bd=0, cursor="hand2",
            padx=12, pady=8, **kw,
        )

    def bar(self, parent, label, value, maximum, color):
        row = tk.Frame(parent, bg=CARD)
        row.pack(fill="x", pady=3)
        tk.Label(row, text=label, bg=CARD, fg=TEXT, font=(FONT, 11), width=14, anchor="w").pack(side="left")
        canvas = tk.Canvas(row, height=16, bg="#f0e8f7", highlightthickness=0)
        canvas.pack(side="left", fill="x", expand=True, padx=(4, 8))
        tk.Label(row, text=f"{value}/{maximum}", bg=CARD, fg=MUTED, font=(FONT, 10), width=6).pack(side="left")

        def draw(_event=None):
            canvas.delete("all")
            width = canvas.winfo_width()
            filled = int(width * value / maximum) if maximum else 0
            if filled:
                canvas.create_rectangle(0, 0, filled, 16, fill=color, width=0)
        canvas.bind("<Configure>", draw)

    # ---------- экран 1: выбор питомца ----------

    def show_choose(self):
        self.clear()
        self.on_home = False
        self.chosen = tk.StringVar(value="")
        self.choice_buttons = {}

        tk.Label(self.screen, text="Выбери питомца", bg=BG, fg=TEXT, font=(FONT, 20, "bold")).pack(pady=(4, 2))
        tk.Label(self.screen, text="Он будет учиться вместе с тобой", bg=BG, fg=MUTED, font=(FONT, 11)).pack(pady=(0, 12))

        grid = tk.Frame(self.screen, bg=BG)
        grid.pack()
        for i, (key, animal) in enumerate(logic.ANIMALS.items()):
            # карточка = рамка + большая картинка + подпись; клик по любой части выбирает животное
            card = tk.Frame(grid, bg=CARD, width=130, height=110, cursor="hand2")
            card.grid(row=i // 3, column=i % 3, padx=6, pady=6)
            card.pack_propagate(False)
            pic = tk.Label(card, text=animal["emoji"], bg=CARD, font=(EMOJI_FONT, 30))
            pic.pack(pady=(10, 0))
            title = tk.Label(card, text=animal["title"], bg=CARD, fg=TEXT, font=(FONT, 12))
            title.pack()
            for widget in (card, pic, title):
                widget.bind("<Button-1>", lambda e, k=key: self.pick(k))
            self.choice_buttons[key] = (card, pic, title)

        tk.Label(self.screen, text="Как его зовут?", bg=BG, fg=TEXT, font=(FONT, 12)).pack(pady=(18, 4))
        self.name_entry = tk.Entry(self.screen, font=(FONT, 14), justify="center", relief="flat", bd=6)
        self.name_entry.pack(ipady=4)
        self.name_entry.bind("<Return>", lambda e: self.start())

        self.choose_error = tk.Label(self.screen, text="", bg=BG, fg=BAD, font=(FONT, 10))
        self.choose_error.pack(pady=4)
        self.button(self.screen, "Начать ✨", self.start).pack(pady=8)

    def pick(self, key):
        self.chosen.set(key)
        for k, widgets in self.choice_buttons.items():
            for widget in widgets:
                widget.configure(bg="#e3ccff" if k == key else CARD)

    def start(self):
        animal = self.chosen.get()
        name = self.name_entry.get().strip()
        if not animal:
            self.choose_error.configure(text="Сначала выбери животное")
            return
        if not name:
            self.choose_error.configure(text="Придумай имя")
            return
        self.pet = logic.new_pet(name[:20], animal)
        self.save()
        self.show_home(f"Привет! Я {name}. Отвечай на вопросы — так ты меня кормишь!")

    # ---------- экран 2: дом питомца ----------

    def show_home(self, message=None):
        self.clear()
        self.on_home = True
        p = self.pet
        animal = logic.ANIMALS[p["animal"]]

        tk.Label(self.screen, text=animal["emoji"], bg=BG, font=(EMOJI_FONT, 72)).pack()
        tk.Label(
            self.screen, text=f"{p['name']}  ·  {animal['title']}", bg=BG, fg=TEXT, font=(FONT, 18, "bold"),
        ).pack()
        tk.Label(
            self.screen, text=f"Уровень {logic.level(p)} — {logic.stage(p)}", bg=BG, fg=MUTED, font=(FONT, 11),
        ).pack(pady=(0, 6))

        bubble = tk.Label(
            self.screen, text=message or logic.mood(p), bg="#efe2ff", fg=TEXT,
            font=(FONT, 11), wraplength=420, justify="center", padx=12, pady=8,
        )
        bubble.pack(fill="x", pady=(0, 10))

        stats = tk.Frame(self.screen, bg=CARD, padx=14, pady=10)
        stats.pack(fill="x")
        self.bar(stats, "🍎 Сытость", p["food"], logic.MAX, BAR_COLORS["food"])
        self.bar(stats, "🎈 Настроение", p["fun"], logic.MAX, BAR_COLORS["fun"])
        self.bar(stats, "⚡ Энергия", p["energy"], logic.MAX, BAR_COLORS["energy"])
        self.bar(stats, "⭐ Опыт", logic.xp_in_level(p), logic.XP_PER_LEVEL, BAR_COLORS["xp"])

        tk.Label(
            self.screen,
            text=f"Верных ответов: {p['correct']}   ·   Серия: {p['streak']}   ·   Рекорд серии: {p['best_streak']}",
            bg=BG, fg=MUTED, font=(FONT, 10),
        ).pack(pady=8)

        topic = tk.Frame(self.screen, bg=BG)
        topic.pack()
        tk.Label(topic, text="Тема вопросов:", bg=BG, fg=TEXT, font=(FONT, 11)).pack(side="left", padx=4)
        menu = tk.OptionMenu(topic, self.category, *logic.categories(self.questions))
        menu.configure(font=(FONT, 11), bg=CARD, relief="flat", highlightthickness=0)
        menu.pack(side="left")

        actions = tk.Frame(self.screen, bg=BG)
        actions.pack(fill="x", pady=10)
        self.button(actions, "📚 Учиться и покормить", self.show_question).pack(fill="x", pady=3)
        row = tk.Frame(actions, bg=BG)
        row.pack(fill="x")
        self.button(row, "🎾 Поиграть", self.do_play, color="#ff7ab8").pack(side="left", fill="x", expand=True, padx=(0, 3), pady=3)
        self.button(row, "😴 Спать", self.do_sleep, color="#5ab0ff").pack(side="left", fill="x", expand=True, padx=(3, 0), pady=3)

        tk.Button(
            self.screen, text="Завести другого питомца", command=self.reset, bg=BG, fg=MUTED,
            relief="flat", bd=0, font=(FONT, 9, "underline"), cursor="hand2", activebackground=BG,
        ).pack(side="bottom", pady=4)

    def do_play(self):
        text = logic.play(self.pet)
        self.save()
        self.show_home(text)

    def do_sleep(self):
        text = logic.sleep(self.pet)
        self.save()
        self.show_home(text)

    def reset(self):
        if messagebox.askyesno("Новый питомец", f"Точно попрощаться с {self.pet['name']}? Сохранение удалится."):
            logic.delete_save()
            self.pet = None
            self.show_choose()

    # ---------- экран 3: вопрос ----------

    def show_question(self):
        self.clear()
        self.on_home = False
        q = logic.random_question(self.questions, self.category.get())
        animal = logic.ANIMALS[self.pet["animal"]]

        tk.Label(self.screen, text=animal["emoji"], bg=BG, font=(EMOJI_FONT, 48)).pack()
        tk.Label(self.screen, text=q["category"], bg=BG, fg=ACCENT, font=(FONT, 11, "bold")).pack()
        tk.Label(
            self.screen, text=q["question"], bg=CARD, fg=TEXT, font=(FONT, 15, "bold"),
            wraplength=420, justify="center", padx=14, pady=18,
        ).pack(fill="x", pady=10)

        self.answer_buttons = []
        for i, text in enumerate(q["answers"]):
            btn = tk.Button(
                self.screen, text=text, font=(FONT, 13), bg=CARD, fg=TEXT, relief="flat", bd=0,
                activebackground="#efe2ff", cursor="hand2", pady=8,
                command=lambda i=i: self.check(q, i),
            )
            btn.pack(fill="x", pady=3)
            self.answer_buttons.append(btn)

        self.result = tk.Label(self.screen, text="", bg=BG, fg=TEXT, font=(FONT, 12), wraplength=420)
        self.result.pack(pady=8)

        self.after_buttons = tk.Frame(self.screen, bg=BG)
        self.after_buttons.pack(fill="x")
        tk.Button(
            self.screen, text="← Домой", command=self.show_home, bg=BG, fg=MUTED,
            relief="flat", bd=0, font=(FONT, 10), cursor="hand2", activebackground=BG,
        ).pack(side="bottom", pady=4)

    def check(self, q, chosen):
        right = q["correct"]
        is_correct = chosen == right
        for i, btn in enumerate(self.answer_buttons):
            btn.configure(state="disabled", disabledforeground=TEXT)
            if i == right:
                btn.configure(bg=GOOD, disabledforeground="white")
            elif i == chosen:
                btn.configure(bg=BAD, disabledforeground="white")

        text = logic.answer(self.pet, is_correct)
        if not is_correct:
            text += f"\nПравильный ответ: {q['answers'][right]}"
        self.save()
        self.result.configure(text=text, fg=GOOD if is_correct else BAD)

        self.button(self.after_buttons, "Ещё вопрос →", self.show_question).pack(fill="x", pady=3)


if __name__ == "__main__":
    # На Windows без этой строчки окно и буквы получаются размытыми
    try:
        import ctypes
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except Exception:
        pass
    App().mainloop()
