@echo off
echo Starting Ikimina Admin Panel Setup...

echo 1. Creating Super Admin user...
cd backend
node createSuperAdmin.js

echo 2. Starting Backend Server...
start cmd /k "cd backend && npm run dev"

echo 3. Admin panel is ready!
echo.
echo Admin Login: http://localhost:5000/admin/auth/login
echo Username: admin@ikimina.com
echo Password: Admin@123456
echo.
echo Please change the default password after first login.
echo.
echo Press any key to exit...
pause > nul 