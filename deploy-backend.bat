@echo off
echo ============================================================
echo    Deploy Backend to VPS - School Management System
echo ============================================================
echo.
echo This will upload the new backend JAR to VPS and restart it.
echo.
echo STEP 1: Upload JAR to VPS
echo -------------------------
echo Password will be requested...
echo.

scp "backend\target\school-management-system-1.0.0.jar" root@194.164.149.8:/root/school-management/backend/

if %errorlevel% neq 0 (
    echo.
    echo SCP failed. Trying with pscp...
    pscp "backend\target\school-management-system-1.0.0.jar" root@194.164.149.8:/root/school-management/backend/ 2>nul
    if %errorlevel% neq 0 (
        echo.
        echo Upload failed. Please upload manually using WinSCP or FileZilla:
        echo   File: backend\target\school-management-system-1.0.0.jar
        echo   Destination: root@194.164.149.8:/root/school-management/backend/
        echo.
        pause
        exit /b 1
    )
)

echo.
echo STEP 2: Restart backend service on VPS
echo ---------------------------------------
echo.

ssh root@194.164.149.8 "systemctl restart school-backend || (pkill -f school-management && cd /root/school-management/backend && nohup java -jar school-management-system-1.0.0.jar > /var/log/school-backend.log 2>&1 &) && echo Backend restarted successfully"

echo.
echo ============================================================
echo    Deployment Complete!
echo ============================================================
echo.
pause
