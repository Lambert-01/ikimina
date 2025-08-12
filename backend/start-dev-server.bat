@echo off
echo ===============================================
echo      IKIMINA BACKEND DEVELOPMENT SERVER
echo ===============================================
echo.

REM Kill any existing Node.js processes
echo Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1

REM Wait a moment
timeout /t 2 >nul

echo.
echo Environment Configuration:
echo   - Port: 5000
echo   - MongoDB: mongodb://127.0.0.1:27017/ikimina
echo   - Mode: Development with verbose logging
echo.
echo Starting server with npm run dev...
echo ===============================================
echo.

REM Start the development server
npm run dev

echo.
echo Server stopped.
pause