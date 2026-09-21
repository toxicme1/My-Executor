@echo off
setlocal
cd /d "%~dp0"

echo Installing dependencies...
call npm install
if errorlevel 1 exit /b 1

echo Building My Executor installer...
call npm run dist
if errorlevel 1 exit /b 1

echo.
echo Build complete. Check the release folder for the installer.
pause
