@echo off
rem Запуск Bilim Buddy с сервером: аккаунты и ИИ-учитель
cd /d "%~dp0"
python -m pip install -q -r server\requirements.txt
start "" http://localhost:8000
python -m uvicorn server.main:app --port 8000
