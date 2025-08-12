@echo off
echo ===================================================
echo    Starting Ikimina Frontend in Production Mode   
echo ===================================================

rem Navigate to frontend directory
cd frontend\web-client-vite

rem Create .env.production-like file if it doesn't exist
if not exist ".env.production-like" (
  echo Creating .env.production-like file...
  (
    echo VITE_API_URL=http://localhost:5000
    echo VITE_APP_NAME=Ikimina
    echo VITE_APP_ENV=production-like
    echo VITE_AUTH_COOKIE_NAME=ikimina_auth_token
    echo VITE_BYPASS_AUTH=false
  ) > .env.production-like
  echo Created .env.production-like file
)

rem Install dependencies if needed
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  echo Dependencies installed
)

rem Build the application in production-like mode
echo Building the application in production-like mode...
call npm run build --mode production-like
echo Build complete

rem Start the preview server
echo Starting the preview server...
call npm run preview

echo ===================================================
echo Ikimina Frontend is running in production mode
echo Access the application at http://localhost:4173
echo =================================================== 