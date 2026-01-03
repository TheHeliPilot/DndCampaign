@echo off
echo ========================================
echo    DM Screen - Build Script
echo ========================================
echo.

echo Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist bin rmdir /s /q bin

echo.
echo Building application...
call npm run build:win

echo.
echo Creating bin folder structure...
mkdir bin

echo.
echo Copying installer and portable exe to bin folder...
copy "dist\DM Screen Setup *.exe" "bin\" >nul 2>&1
copy "dist\DM-Screen-Portable.exe" "bin\" >nul 2>&1

echo.
echo ========================================
echo Build complete!
echo.
echo Output files are in the 'bin' folder:
dir /b bin
echo.
echo You can now zip the 'bin' folder and share it!
echo ========================================
pause
