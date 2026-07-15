@echo off
echo Building frontend...
cd frontend
call npm run build
cd ..
echo Done! Restart uvicorn to apply changes.
pause