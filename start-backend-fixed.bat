@echo off
echo ===================================================
echo    Starting Ikimina Backend Server (Fixed Version)   
echo ===================================================

cd backend
echo Starting backend server...
start /min cmd /c "node index-debug.js"
echo Backend server started in background

echo ===================================================
echo Backend is running at: http://localhost:5000
echo Health check: http://localhost:5000/health
echo ===================================================
echo The server is running in a minimized window.
echo To stop it, close the minimized cmd window or use Task Manager.
pause