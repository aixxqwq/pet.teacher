"""
Делает аудиозаписи для IELTS Listening из текстов в js/ielts-lr.js.
Голоса — нейросетевые голоса Microsoft (пакет edge-tts): британский, австралийский и американский акценты.

Запуск (нужен интернет):
    python -m pip install edge-tts
    python tools/make_listening_audio.py
Файлы появятся в audio/ielts/  (например L1-GB.mp3), а список — в js/ielts-audio.js.
"""
import asyncio
import json
import os
import re
import sys

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "audio", "ielts")

# роль в тексте -> голос для каждого акцента
VOICES = {
    "GB": {"female": "en-GB-SoniaNeural", "female2": "en-GB-LibbyNeural", "male": "en-GB-RyanNeural"},
    "AU": {"female": "en-AU-NatashaNeural", "female2": "en-GB-LibbyNeural", "male": "en-AU-WilliamMultilingualNeural"},
    "US": {"female": "en-US-AvaNeural", "female2": "en-US-EmmaNeural", "male": "en-US-AndrewNeural"},
}
PAUSE_NEW_SPEAKER = 0.55     # секунды тишины, когда говорит другой человек
PAUSE_SAME = 0.25            # между абзацами одного человека


def read_tests():
    src = open(os.path.join(ROOT, "js", "ielts-lr.js"), encoding="utf-8").read()
    part = src[src.index("const LISTENING"):src.index("const READING")]
    tests = []
    for chunk in re.split(r'\n\s*\{\s*\n\s*id: "', part)[1:]:
        tid = chunk[:chunk.index('"')]
        voices = dict(re.findall(r'(\w+): "(\w+)"', re.search(r"voices: \{([^}]*)\}", chunk).group(1)))
        script = re.search(r"script: \[(.*?)\n\s*\],", chunk, re.S).group(1)
        lines = re.findall(r'\["(\w+)", "((?:[^"\\]|\\.)*)"\]', script)
        tests.append((tid, voices, lines))
    return tests


def silence(header, seconds):
    """Тихие MP3-кадры того же формата (24 кГц, 48 кбит/с, моно: кадр 144 байта = 24 мс)."""
    frame = header + bytes(144 - 4)
    return frame * round(seconds / 0.024)


async def say(text, voice, tries=4):
    for k in range(tries):
        try:
            data = b""
            async for c in edge_tts.Communicate(text, voice).stream():
                if c["type"] == "audio":
                    data += c["data"]
            if data:
                return data
        except Exception as e:      # сеть иногда обрывается — пробуем ещё раз
            print("  retry", voice, e)
        await asyncio.sleep(1 + k)
    raise RuntimeError(f"не получилось озвучить: {text[:40]}")


async def make(tid, voices, lines, accent):
    path = os.path.join(OUT, f"{tid}-{accent}.mp3")
    if os.path.exists(path) and "--force" not in sys.argv:
        return
    sem = asyncio.Semaphore(4)

    async def one(who, text):
        async with sem:
            return await say(text, VOICES[accent][voices[who]])

    parts = await asyncio.gather(*(one(w, t) for w, t in lines))
    header = parts[0][:4]
    audio = silence(header, 0.6)
    for i, data in enumerate(parts):
        audio += data
        if i + 1 < len(lines):
            audio += silence(header, PAUSE_NEW_SPEAKER if lines[i + 1][0] != lines[i][0] else PAUSE_SAME)
    audio += silence(header, 1.0)
    open(path, "wb").write(audio)
    print(f"{tid}-{accent}.mp3  {len(audio) // 1024} КБ  ~{len(audio) * 8 // 48000 // 60}:{len(audio) * 8 // 48000 % 60:02d}")


async def main():
    os.makedirs(OUT, exist_ok=True)
    tests = read_tests()
    for tid, voices, lines in tests:
        for accent in VOICES:
            await make(tid, voices, lines, accent)
    index = {tid: {a: f"audio/ielts/{tid}-{a}.mp3" for a in VOICES} for tid, _, _ in tests}
    with open(os.path.join(ROOT, "js", "ielts-audio.js"), "w", encoding="utf-8") as f:
        f.write("// Сделано tools/make_listening_audio.py — аудиозаписи Listening (голоса Microsoft Neural).\n")
        f.write("IELTS_LR.AUDIO = " + json.dumps(index, indent=2) + ";\n")
    print("готово")


asyncio.run(main())
