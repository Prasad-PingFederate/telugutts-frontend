@echo off
echo ========================================
echo Telugu TTS - Manual Deployment Helper
echo ========================================
echo.
echo Your fixed files are in this folder.
echo.
echo NEXT STEPS:
echo.
echo 1. Go to: https://vercel.com/new
echo.
echo 2. Choose one of these options:
echo    - Import from Git (if you have a GitHub repo)
echo    - Or drag and drop this entire folder
echo.
echo 3. After deployment, ADD ENVIRONMENT VARIABLE:
echo    Name: RUNPOD_API_KEY
echo    Value: [Your RunPod API Key]
echo.
echo 4. Redeploy after adding the API key
echo.
echo ========================================
echo.
echo Press any key to open Vercel in browser...
pause
start https://vercel.com/new
