@echo off
echo ========================================
echo    DM Screen - Create Release Package
echo ========================================
echo.

REM Get version from package.json (simple approach)
set VERSION=1.0.0

echo Building application...
call build.bat

echo.
echo Creating release zip file...
if exist "DM-Screen-v%VERSION%.zip" del "DM-Screen-v%VERSION%.zip"

REM Use PowerShell to create zip (built into Windows 10+)
powershell -command "Compress-Archive -Path 'bin\*' -DestinationPath 'DM-Screen-v%VERSION%.zip' -Force"

echo.
echo ========================================
echo Release package created!
echo.
echo File: DM-Screen-v%VERSION%.zip
echo.
echo This zip file contains:
echo - Full installer (DM Screen Setup.exe)
echo - Portable version (DM-Screen-Portable.exe)
echo.
echo You can now share this zip file!
echo ========================================
pause
