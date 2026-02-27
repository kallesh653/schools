@echo off
echo ============================================
echo Starting School Management System Backend
echo ============================================
echo.

cd backend

echo Checking if Maven is installed...
mvn --version
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

echo.
echo Building and starting the backend...
echo This may take a few minutes on first run...
echo.

mvn spring-boot:run

pause
