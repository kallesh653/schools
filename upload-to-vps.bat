@echo off
echo ============================================================
echo    Upload School Management System to VPS
echo ============================================================
echo.
echo This script will upload your files to the VPS server
echo.
echo REQUIREMENTS:
echo 1. Install PuTTY/PSCP from: https://www.putty.org/
echo 2. Add PSCP to your PATH or place in this folder
echo.
echo ============================================================
echo.

set VPS_IP=194.164.149.8
set VPS_USER=root
set TARGET_DIR=/root/school-management

echo VPS Server: %VPS_IP%
echo User: %VPS_USER%
echo Target Directory: %TARGET_DIR%
echo.
echo WARNING: You will be prompted for your VPS password
echo          (Use your NEW password, not the old one!)
echo.
pause

echo.
echo Uploading files to VPS...
echo This may take 5-10 minutes depending on your connection...
echo.

:: Upload entire directory
pscp -r "%~dp0\*" %VPS_USER%@%VPS_IP%:%TARGET_DIR%

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo    Files uploaded successfully!
    echo ============================================================
    echo.
    echo Next steps:
    echo 1. Connect to VPS: ssh root@194.164.149.8
    echo 2. Run: cd /root/school-management
    echo 3. Run: bash deploy-vps.sh
    echo.
) else (
    echo.
    echo ============================================================
    echo    Upload failed!
    echo ============================================================
    echo.
    echo Troubleshooting:
    echo 1. Install PuTTY/PSCP: https://www.putty.org/
    echo 2. Make sure PSCP is in your PATH
    echo 3. Check VPS IP and credentials
    echo.
    echo Alternative: Use WinSCP or FileZilla GUI tools
    echo   WinSCP: https://winscp.net/
    echo   FileZilla: https://filezilla-project.org/
    echo.
)

pause
