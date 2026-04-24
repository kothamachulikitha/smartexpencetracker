@echo off
title Smart Expense Tracker - Launcher
color 0A

echo ============================================
echo    Smart Expense Tracker - Starting...
echo ============================================
echo.

:: Ensure Node.js is in PATH
set PATH=%PATH%;C:\Program Files\nodejs

:: Start MongoDB service if not running
echo [1/4] Checking MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel%==0 (
    echo       MongoDB started successfully.
) else (
    echo       MongoDB is already running.
)
echo.

:: Start Backend Server
echo [2/4] Starting Backend Server...
cd /d "C:\Users\kotha\.gemini\antigravity\scratch\smart-expense-tracker\backend"
start "ExpenseTracker-Backend" /min cmd /c "title ExpenseTracker Backend & node server.js"
echo       Backend started on port 5000.
echo.

:: Wait for backend to initialize
echo [3/4] Waiting for backend to be ready...
timeout /t 3 /nobreak >nul
echo       Backend is ready.
echo.

:: Start Frontend Server
echo [4/4] Starting Frontend Server...
cd /d "C:\Users\kotha\.gemini\antigravity\scratch\smart-expense-tracker\frontend"
start "ExpenseTracker-Frontend" /min cmd /c "title ExpenseTracker Frontend & npx vite --port 3000"
echo       Frontend starting on port 3000...
echo.

:: Wait for Vite to be ready
timeout /t 4 /nobreak >nul

:: Open browser
echo ============================================
echo    Opening in browser...
echo ============================================
start http://localhost:3000

echo.
echo  App is running! Close this window anytime.
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo.
echo  To stop: close the Backend and Frontend
echo  terminal windows (minimized in taskbar).
echo ============================================
echo.
pause
