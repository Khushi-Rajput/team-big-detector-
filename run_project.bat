@echo off
title AI Resume Checker - Full Stack Server
echo ========================================================
echo   Launching AI Resume Checker (Production Mode)
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/2] Checking Client build...
if not exist "Client\dist\index.html" (
    echo Building React Client frontend...
    cd Client
    call npm run build
    cd ..
)

echo [2/2] Starting Unified Python Flask Server on http://127.0.0.1:5000...
echo Both the React UI and the AI Backend will be available at:
echo http://127.0.0.1:5000
echo.

if exist "Server\venv\Scripts\python.exe" (
    Server\venv\Scripts\python.exe Server\app.py
) else (
    python Server\app.py
)

pause
