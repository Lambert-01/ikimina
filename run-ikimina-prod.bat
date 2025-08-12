@echo off
echo ===================================================
echo    Starting Ikimina Platform in Production Mode   
echo ===================================================

rem Check if .env file exists
if not exist ".\backend\.env" (
  echo Creating .env file from .env-example
  copy .\backend\.env-example .\backend\.env
  echo Created .env file
) else (
  echo Using existing .env file
)

rem Create admin user if needed
echo Creating admin user if needed...
cd backend
node createSuperAdmin.js
echo Admin user setup complete

rem Create test user if needed
echo Creating test user if needed...
node createTestUser.js
echo Test user setup complete

rem Start backend in production mode
echo Starting backend in production mode...
start cmd /k "set NODE_ENV=production && set PORT=5000 && node index.js"
echo Backend started

rem Wait for backend to start
echo Waiting for backend to start...
timeout /t 5

rem Build and start frontend in production mode
echo Building and starting frontend...
cd ..\frontend\web-client-vite
call npm run build
echo Frontend built successfully
start cmd /k "npm run preview -- --port 4173"
echo Frontend started

echo ===================================================
echo Ikimina Platform is running in production mode
echo Backend URL: http://localhost:5000
echo Frontend URL: http://localhost:4173
echo ===================================================
echo Admin Login:
echo   Email: admin@ikimina.com
echo   Password: admin123
echo Test User Login:
echo   Phone: +250722222222
echo   Password: password123
echo ===================================================
echo Press Ctrl+C in each command window to stop the servers
echo ===================================================

cd ..\..