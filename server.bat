@echo off
REM Script para ejecutar servidor local en Windows
REM Requiere Python 3 instalado

color 0A
cls
echo.
echo   ============================================
echo   Servidor Local - Gestor de Tareas
echo   ============================================
echo.

REM Verifica si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no está instalado o no está en PATH
    echo Descargalo desde: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [INFO] Iniciando servidor local...
echo.
echo   Abre en tu navegador:
echo   --> http://localhost:8000
echo.
echo   Para detener: Presiona Ctrl+C
echo.
echo   ============================================
echo.

python -m http.server 8000 --directory .

pause
