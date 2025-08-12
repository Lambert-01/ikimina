@echo off
echo ===================================================
echo    Starting Ikimina Backend Server
echo ===================================================

rem Check if MongoDB is installed
echo Checking if MongoDB is installed...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
  echo MongoDB is not installed or not in PATH. Please install MongoDB.
  exit /b 1
)

rem Create data directory if it doesn't exist
if not exist "C:\data\db" (
  echo Creating MongoDB data directory...
  mkdir "C:\data\db"
)

rem Create .env file if it doesn't exist
cd backend
if not exist ".env" (
  echo Creating .env file from .env-example...
  copy .env-example .env
  echo Created .env file
)

rem Update NODE_ENV to development
echo Setting NODE_ENV to development...
powershell -Command "(Get-Content -path .env) -replace 'NODE_ENV=production', 'NODE_ENV=development' | Set-Content -Path .env"

rem Start MongoDB in a separate window
echo Starting MongoDB...
start "MongoDB" cmd /c "mongod --dbpath C:\data\db"
timeout /t 5

rem Install dependencies if needed
if not exist "node_modules" (
  echo Installing dependencies...
  npm install
)

rem Create test users
echo Creating test users...
node createSuperAdmin.js
node createTestUser.js

rem Start the backend server
echo Starting backend server...
node index.js

echo ===================================================
echo Backend server is running at http://localhost:5000
echo ===================================================