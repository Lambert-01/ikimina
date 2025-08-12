@echo off
echo Starting Ikimina Backend Server...
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Starting Node.js server...
node index-debug.js
pause