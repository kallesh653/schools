@echo off
echo ============================================
echo Starting School Management Admin Web App
echo ============================================
echo.

cd admin-web

echo Checking if Node.js is installed...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking if dependencies are installed...
if not exist "node_modules\" (
    echo Installing dependencies...
    echo This may take a few minutes...
    call npm install
)

echo.
echo Starting Admin Web Application...
echo The app will open automatically in your browser
echo URL: http://localhost:3000
echo.
echo Default Login:
echo Username: admin
echo Password: admin123
echo.

call npm start

pause
