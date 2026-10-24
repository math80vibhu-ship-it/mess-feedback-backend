Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " RUNNING LOAD TEST FOR SCREENSHOT 3 (1 Backend Instance)" -ForegroundColor Cyan
Write-Host " Target: http://localhost:5001/api/menu (1,000 requests, 20 VUs)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

k6 run -e TARGET_URL=http://localhost:5001/api/menu tests/load_test_1000.js

Write-Host "`n>>> [SCREENSHOT 3 READY!] <<<" -ForegroundColor Green
Write-Host "Press Win + Shift + S to take a screenshot of this terminal window!" -ForegroundColor Yellow
Write-Host "Paste it in Word under Question 1(b) - 1 Instance Benchmark." -ForegroundColor Yellow
