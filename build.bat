@echo off
:: ============================================================
:: build.bat — builds production-ready artifacts
::
:: What it produces:
::   - hospital-backend/target/hms-1.0.0.jar   (self-contained server)
::   - hospital-frontend/build/                 (static HTML/JS/CSS)
::
:: To run after building:
::   java -jar hospital-backend\target\hms-1.0.0.jar
::   Then serve the frontend\build folder with any static server,
::   OR deploy it to Nginx/Apache.
:: ============================================================

echo.
echo  ==========================================
echo   Hospital Management System - Build
echo  ==========================================
echo.

:: ---- Check prerequisites ----
where java >nul 2>&1
if errorlevel 1 ( echo [ERROR] Java not found. & pause & exit /b 1 )

where mvn >nul 2>&1
if errorlevel 1 ( echo [ERROR] Maven not found. & pause & exit /b 1 )

where node >nul 2>&1
if errorlevel 1 ( echo [ERROR] Node.js not found. & pause & exit /b 1 )

echo [OK] All tools found
echo.

:: ---- Build Backend ----
echo [1/2] Building Spring Boot backend...
echo       This compiles the Java code and packages it as a JAR file.
echo       -DskipTests skips unit tests to build faster.
cd /d "%~dp0hospital-backend"
call mvn clean package -DskipTests
if errorlevel 1 (
    echo.
    echo [ERROR] Backend build failed. Check the error above.
    pause & exit /b 1
)
echo [OK] Backend built: hospital-backend\target\hms-1.0.0.jar
echo.

:: ---- Build Frontend ----
echo [2/2] Building React frontend...
echo       npm run build creates an optimised static bundle in the build\ folder.
cd /d "%~dp0hospital-frontend"
call npm install
if errorlevel 1 ( echo [ERROR] npm install failed. & pause & exit /b 1 )

call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] Frontend build failed. Check the error above.
    pause & exit /b 1
)
echo [OK] Frontend built: hospital-frontend\build\
echo.

:: ---- Done ----
cd /d "%~dp0"
echo  ==========================================
echo   Build complete!
echo.
echo   To run the backend:
echo     java -jar hospital-backend\target\hms-1.0.0.jar
echo.
echo   To serve the frontend (one-liner using npx):
echo     npx serve -s hospital-frontend\build -l 3000
echo.
echo   OR open hospital-frontend\build\index.html directly
echo   in a browser for quick testing.
echo  ==========================================
echo.
pause
