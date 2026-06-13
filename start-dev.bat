@echo off
:: ============================================================
:: start-dev.bat — starts the full HMS stack for development
::
:: What it does:
::   1. Opens a new window running the Spring Boot backend
::   2. Opens a new window running the React dev server
::
:: Prerequisites (must already be installed and in PATH):
::   - Java 19+       (check: java -version)
::   - Maven 3.8+     (check: mvn -version)
::   - Node.js 18+    (check: node -version)
::   - PostgreSQL     must already be running on port 5432
::
:: Usage: double-click this file, or run it from a terminal
:: ============================================================

echo.
echo  ==========================================
echo   Hospital Management System - Dev Start
echo  ==========================================
echo.

:: ---- Check prerequisites ----
where java >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java not found in PATH.
    echo         Install Java 19+ and add it to your system PATH.
    pause & exit /b 1
)

where mvn >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Maven not found in PATH.
    echo         Option 1: Install Maven from https://maven.apache.org/download.cgi
    echo                   and add the 'bin' folder to your system PATH.
    echo         Option 2: Run the backend directly from IntelliJ instead.
    pause & exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found in PATH.
    echo         Install Node.js from https://nodejs.org
    pause & exit /b 1
)

echo [OK] Java found
echo [OK] Maven found
echo [OK] Node.js found
echo.

:: ---- Start Backend ----
echo [1/2] Starting Spring Boot backend (port 8080)...
echo       Logs will appear in the "HMS Backend" window.
start "HMS Backend" cmd /k "cd /d "%~dp0hospital-backend" && echo Starting backend... && mvn spring-boot:run"

:: Small wait so backend window opens first
timeout /t 2 /nobreak >nul

:: ---- Start Frontend ----
echo [2/2] Starting React frontend (port 3000)...
echo       Logs will appear in the "HMS Frontend" window.
start "HMS Frontend" cmd /k "cd /d "%~dp0hospital-frontend" && echo Installing packages if needed... && npm install && echo Starting React dev server... && npm start"

echo.
echo  ==========================================
echo   Both servers are starting up.
echo.
echo   Backend API:  http://localhost:8080
echo   Swagger UI:   http://localhost:8080/swagger-ui/index.html
echo   Frontend:     http://localhost:3000
echo.
echo   Wait about 30 seconds for the backend to fully start.
echo   Close the two new windows to stop the servers.
echo  ==========================================
echo.
pause
