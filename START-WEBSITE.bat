@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Make sure Node.js 20+ is installed and try again.
    pause
    exit /b 1
  )
)
call npm run dev
pause
