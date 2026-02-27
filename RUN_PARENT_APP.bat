@echo off
echo ============================================
echo Starting Parent Mobile App
echo ============================================
echo.

cd parent-app

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
    echo This may take several minutes...
    call npm install
)

echo.
echo ============================================
echo IMPORTANT: Update API URL Before Running
echo ============================================
echo.
echo 1. Edit: parent-app/src/services/api.js
echo 2. Replace 'localhost' with your computer's IP address
echo 3. Example: http://192.168.1.100:8080/api
echo.
echo To find your IP:
echo - Run 'ipconfig' in command prompt
echo - Look for IPv4 Address
echo.
echo ============================================
echo.
echo Starting Parent App...
echo.
echo Clearing Metro cache...
if exist "%TEMP%\metro-cache" rmdir /s /q "%TEMP%\metro-cache" 2>nul
echo.
echo Options:
echo - Press 'a' for Android emulator
echo - Scan QR code with Expo Go app
echo.

call npx expo start --lan --port 8081

pause
