@echo off
chcp 65001 >nul
title 时光日记 - 本地预览服务
cd /d "%~dp0"

start "" cmd /c "timeout /t 3 >nul & start http://localhost:5173"

echo.
echo   时光日记正在启动
echo   浏览器地址：http://localhost:5173
echo   关闭此窗口即可停止服务
echo.

call pnpm dev -- --host 0.0.0.0

echo.
echo 服务已停止，按任意键关闭窗口。
pause >nul
