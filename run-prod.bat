@echo off
:: ============================================================
:: run-prod.bat — runs the production build
::
:: Run build.bat FIRST to generate the artifacts, then run this.
::
:: What it starts:
::   1. Spring Boot backend JAR on port 8080
::   2. React frontend static server on port 3000
:: ============================================================

echo.
echo  ==========================================
echo   Hospital Management System - Production
echo  ==========================================
echo.

:: ---- Check JAR exists ----
if not exist "%~dp0hospital-backend\target\hms-1.0.0.jar" (
    echo [ERROR] Backend JAR not found.
    echo         Run build.bat first to build the project.
    pause & exit /b 1
)

:: ---- Check frontend build exists ----
if not exist "%~dp0hospital-frontend\build\index.html" (
    echo [ERROR] Frontend build not found.
    echo         Run build.bat first to build the project.
    pause & exit /b 1
)

echo [OK] Build artifacts found
echo.

:: ---- Start Backend JAR ----
echo [1/2] Starting backend server (port 8080)...
start "HMS Backend (prod)" cmd /k "cd /d "%~dp0" && java -jar hospital-backend\target\hms-1.0.0.jar"

timeout /t 3 /nobreak >nul

:: ---- Serve Frontend ----
echo [2/2] Serving frontend (port 3000)...
echo       Uses 'npx serve' — will auto-download if not cached.
start "HMS Frontend (prod)" cmd /k "cd /d "%~dp0" && npx serve -s hospital-frontend\build -l 3000"

echo.
echo  ==========================================
echo   Production servers are starting.
echo.
echo   Backend API:  http://localhost:8080
echo   Swagger UI:   http://localhost:8080/swagger-ui/index.html
echo   Frontend:     http://localhost:3000
echo.
echo   Close the two server windows to stop.
echo  ==========================================
echo.
pause
