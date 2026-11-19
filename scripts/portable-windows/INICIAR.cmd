@echo off
setlocal
set "NODE_OPTIONS="
set "NODE_PATH="
if not exist "%~dp0runtime\node.exe" (
  echo ERROR: Falta runtime\node.exe. Extrae todo el ZIP en una carpeta.
  pause
  exit /b 1
)
"%~dp0runtime\node.exe" "%~dp0portable.cjs" start
if errorlevel 1 (
  pause
  exit /b 1
)
