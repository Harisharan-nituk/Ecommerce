@echo off
REM Windows batch file to start the E-Commerce System
REM This file is for development use only
REM For production, use the packaged executable: ecommerce-system.exe

echo Starting E-Commerce System Server...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Please create a .env file with your configuration.
    echo See .env.example for reference.
    echo.
    pause
)

REM Start the server
echo Starting server...
node src/server.js

pause

