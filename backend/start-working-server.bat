@echo off
echo ========================================
echo     IKIMINA BACKEND SERVER STARTER
echo ========================================
echo.

REM Kill any existing Node.js processes
echo Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1

REM Wait a moment
timeout /t 2 >nul

echo Starting Ikimina Backend Server...
echo.
echo Server will be available at: http://localhost:5000
echo Health check: http://localhost:5000/health
echo Login endpoint: http://localhost:5000/auth/login
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
node working-server.js

echo.
echo Server stopped.
pause