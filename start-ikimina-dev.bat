@echo off
echo ===================================================
echo    Starting Ikimina Platform in Development Mode   
echo ===================================================

rem Check if MongoDB is running
echo Checking if MongoDB is running...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
  echo MongoDB is not installed or not in PATH. Please install MongoDB.
  exit /b 1
)

rem Create .env file if it doesn't exist
if not exist "backend\.env" (
  echo Creating .env file from .env-example...
  copy backend\.env-example backend\.env
  echo Created .env file
)

rem Start MongoDB if not already running
echo Starting MongoDB...
start "MongoDB" cmd /c "mongod --dbpath C:/data/db"
timeout /t 5

rem Start backend
echo Starting backend server...
start "Backend" cmd /c "cd backend && npm install && node index.js"
echo Backend server started at http://localhost:5000
timeout /t 5

rem Start frontend
echo Starting frontend development server...
start "Frontend" cmd /c "cd frontend/web-client-vite && npm install && npm run dev"
echo Frontend server started

echo ===================================================
echo Ikimina Platform is running in development mode
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ===================================================
echo Default users:
echo - Admin: admin@ikimina.com / admin123
echo - User: +250722222222 / password123
echo - Manager: +250733333333 / password123
echo ===================================================
echo Press Ctrl+C in each terminal window to stop the servers
echo =================================================== 