@ECHO OFF
SETLOCAL
SET "DIR=%~dp0"
IF EXIST "%DIR%..\dist\index.js" (
  node "%DIR%..\dist\index.js" %*
) ELSE (
  node "%DIR%..\src\index.ts" %*
)
