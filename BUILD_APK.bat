@echo off
echo ============================================
echo  School Parent App - Build APK
echo ============================================
echo.
echo This will build a proper APK using Expo cloud servers.
echo NO Android Studio or Android SDK needed!
echo.
echo REQUIREMENT: You need a FREE Expo account.
echo Create one at: https://expo.dev  (takes 1 minute)
echo.

cd /d "%~dp0parent-app"

echo Checking login status...
eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo *** NOT LOGGED IN ***
    echo.
    echo Please enter your Expo account credentials:
    echo (Create free account at https://expo.dev if you don't have one)
    echo.
    eas login
    if %errorlevel% neq 0 (
        echo.
        echo Login failed! Please try again.
        pause
        exit /b 1
    )
)

echo.
echo Logged in successfully!
echo.
echo ============================================
echo Starting APK build on Expo cloud...
echo ============================================
echo.
echo - Your code will be uploaded to Expo servers
echo - APK will be built in the cloud (5-15 minutes)
echo - You will get a DOWNLOAD LINK when done
echo.

eas build --platform android --profile preview

echo.
echo ============================================
echo Build submitted to Expo cloud!
echo.
echo Check your build at: https://expo.dev/accounts/[your-username]/projects
echo Download the APK from there when it finishes.
echo ============================================
echo.
pause
