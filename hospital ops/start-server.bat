@echo off
title HospitalOps Intelligence - Node Server
cd /d "%~dp0"
echo Starting HospitalOps Local Web & API Server on http://localhost:3000 ...
start "" "http://localhost:3000"
node server.js
pause

