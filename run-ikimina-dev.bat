@echo off
title Ikimina Development Runner
echo Starting Ikimina in development mode...
echo.

REM Check for MongoDB
echo Checking MongoDB connection...
echo.
mongosh --eval "db.adminCommand('ping')" --quiet
if %errorlevel% neq 0 (
  echo Error: MongoDB does not appear to be running.
  echo Please start MongoDB before running this script.
  echo.
  pause
  exit /b 1
)

REM Start the backend server in a new terminal
echo Starting backend server...
start "Ikimina Backend" cmd /c "cd backend && node run-dev.js"

REM Wait for the backend to initialize
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

REM Start the frontend in a new terminal
echo Starting frontend...
start "Ikimina Frontend" cmd /c "cd frontend/web-client-vite && npm run dev"

echo.
echo Ikimina development environment is starting up!
echo.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
echo ⚠️ This is a development setup with authentication bypass enabled.
echo ⚠️ DO NOT USE THIS IN PRODUCTION.
echo.

pause 