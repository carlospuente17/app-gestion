@echo off
REM ============================================
REM Menu Rápido - Gestor de Tareas PWA
REM ============================================

:menu
cls
color 0A
echo.
echo  ╔════════════════════════════════════════╗
echo  ║   GESTOR DE TAREAS - Menu Rapido      ║
echo  ╚════════════════════════════════════════╝
echo.
echo  1 - Iniciar Servidor Local (localhost:8000)
echo  2 - Ver README (Documentacion)
echo  3 - Ver QUICKSTART (Pruebas Rapidas)
echo  4 - Limpiar Cache del Navegador
echo  5 - Subir a GitHub (Git)
echo  6 - Abrir Carpeta en Explorador
echo  7 - Salir
echo.
set /p choice="Selecciona una opcion (1-7): "

if "%choice%"=="1" goto server
if "%choice%"=="2" goto readme
if "%choice%"=="3" goto quickstart
if "%choice%"=="4" goto cache
if "%choice%"=="5" goto git
if "%choice%"=="6" goto explorer
if "%choice%"=="7" exit /b 0

echo Invalid choice. Intentalo de nuevo.
timeout /t 2 >nul
goto menu

:server
cls
echo.
echo Iniciando servidor local en http://localhost:8000
echo.
python -m http.server 8000
pause
goto menu

:readme
cls
echo Abriendo README.md...
start notepad README.md
timeout /t 2 >nul
goto menu

:quickstart
cls
echo Abriendo QUICKSTART.md...
start notepad QUICKSTART.md
timeout /t 2 >nul
goto menu

:cache
cls
echo Para limpiar cache del navegador:
echo.
echo Chrome: Ctrl + Shift + Delete
echo Firefox: Ctrl + Shift + Delete
echo Safari: Cmd + Shift + Delete (Mac)
echo.
pause
goto menu

:git
cls
echo Comandos para subir a GitHub:
echo.
echo git add .
echo git commit -m "Initial commit: PWA Task Manager"
echo git push
echo.
pause
goto menu

:explorer
explorer .
timeout /t 1 >nul
goto menu
