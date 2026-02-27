@echo off
SETLOCAL EnableDelayedExpansion

echo ============================================================
echo    SCHOOL MANAGEMENT SYSTEM - COMPLETE STARTUP
echo ============================================================
echo.
echo This script will start all components:
echo 1. Backend API (Spring Boot)
echo 2. Admin Web (React)
echo 3. Teacher App (React Native)
echo 4. Parent App (React Native)
echo.
echo ============================================================
echo.

:: Check Prerequisites
echo [1/4] Checking Prerequisites...
echo.

:: Check Java
echo Checking Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found! Install JDK 17 from:
    echo https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)
echo [OK] Java found

:: Check Maven (optional - using Maven Wrapper)
echo Checking Maven...
if exist "backend\mvnw.cmd" (
    echo [OK] Using Maven Wrapper (Maven installation not required)
) else (
    mvn --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] Maven not found, but Maven Wrapper will be used
    ) else (
        echo [OK] Maven found
    )
)

:: Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Install from:
    echo https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

:: Check npm
echo Checking npm...
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
echo [OK] npm found

:: Check Oracle Database
echo Checking Oracle Database...
sqlplus -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Oracle SQL*Plus not found
    echo Make sure Oracle Database is installed and running
    echo Download Oracle XE from: https://www.oracle.com/database/technologies/xe-downloads.html
    echo.
    echo Press any key to continue anyway...
    pause >nul
) else (
    echo [OK] Oracle Database found
)

echo.
echo ============================================================
echo [2/4] Installing Dependencies...
echo ============================================================
echo.

:: Install Admin Web Dependencies
if not exist "admin-web\node_modules\" (
    echo Installing Admin Web dependencies...
    cd admin-web
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install admin-web dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Admin Web dependencies installed
) else (
    echo [OK] Admin Web dependencies already installed
)

:: Install Teacher App Dependencies
if not exist "teacher-app\node_modules\" (
    echo Installing Teacher App dependencies...
    cd teacher-app
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install teacher-app dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Teacher App dependencies installed
) else (
    echo [OK] Teacher App dependencies already installed
)

:: Install Parent App Dependencies
if not exist "parent-app\node_modules\" (
    echo Installing Parent App dependencies...
    cd parent-app
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install parent-app dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Parent App dependencies installed
) else (
    echo [OK] Parent App dependencies already installed
)

echo.
echo ============================================================
echo [3/4] Database Setup
echo ============================================================
echo.
echo IMPORTANT: Make sure you have:
echo 1. Run the Oracle setup script: backend/oracle_setup.sql
echo 2. Created Oracle user 'school_admin' with password 'school_admin'
echo 3. Oracle Database (XE/Standard) is running on port 1521
echo.
echo To setup Oracle database, run as SYSTEM user:
echo    sqlplus system/password@localhost:1521/XE
echo    @backend/oracle_setup.sql
echo.
echo Press any key when database is ready...
pause >nul

echo.
echo ============================================================
echo [4/4] Starting All Services...
echo ============================================================
echo.

echo Starting services in new windows...
echo.

:: Start Backend
echo [1] Starting Backend API on port 8080...
start "Backend API" cmd /k "cd /d "%~dp0backend" && echo Starting Backend... && mvnw.cmd spring-boot:run"
timeout /t 3 >nul

:: Start Admin Web
echo [2] Starting Admin Web on port 3000...
start "Admin Web" cmd /k "cd /d "%~dp0admin-web" && echo Starting Admin Web... && npm start"
timeout /t 3 >nul

:: Start Teacher App
echo [3] Starting Teacher App...
start "Teacher App" cmd /k "cd /d "%~dp0teacher-app" && echo Starting Teacher App... && npm start"
timeout /t 3 >nul

:: Start Parent App
echo [4] Starting Parent App...
start "Parent App" cmd /k "cd /d "%~dp0parent-app" && echo Starting Parent App... && npm start"

echo.
echo ============================================================
echo    ALL SERVICES STARTED SUCCESSFULLY!
echo ============================================================
echo.
echo Services running in separate windows:
echo.
echo [1] Backend API:    http://localhost:8080/api
echo [2] Admin Web:      http://localhost:3000
echo [3] Teacher App:    Check Expo window for QR code
echo [4] Parent App:     Check Expo window for QR code
echo.
echo DEFAULT LOGIN CREDENTIALS:
echo Username: admin
echo Password: admin123
echo.
echo ============================================================
echo.
echo NOTES:
echo - Backend takes 30-60 seconds to start
echo - Admin web will open automatically in browser
echo - For mobile apps: Scan QR code with Expo Go app
echo - To stop: Close all opened windows
echo.
echo ============================================================
echo.
echo Press any key to exit this window...
pause >nul
