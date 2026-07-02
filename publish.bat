@echo off
cd /d "%~dp0"

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  Git is not installed or not found.
    echo  Install it from: https://git-scm.com/download/win
    echo  Then run this file again.
    echo.
    pause
    exit /b 1
)

echo.
echo  Checking for changes...
git add -A
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo.
    echo  No changes to publish — your live site is already up to date.
    echo.
    pause
    exit /b 0
)

echo.
echo  Publishing your portfolio...
echo.
git commit -m "update portfolio"
git push
echo.
echo  Done! Your changes will appear on the live site in about 1 minute.
echo.
pause
