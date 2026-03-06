@echo off
echo ========================================
echo   BookMyMovie Full Stack Project
echo ========================================
echo.

echo Starting Backend Server...
cd server
start cmd /k "npm run dev"

echo.
echo Starting Frontend...
cd ..\bookmymovie
start cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers should be running now!
echo.
echo Backend:   http://localhost:5000
echo Frontend:  http://localhost:5173 (or 3000)
echo ========================================
pause
