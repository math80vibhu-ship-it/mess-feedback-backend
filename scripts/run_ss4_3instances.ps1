Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " RUNNING LOAD TEST FOR SCREENSHOT 4 (3 Backend Instances)" -ForegroundColor Cyan
Write-Host " Target: http://localhost/api/menu (1,000 requests, 20 VUs via Nginx)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

k6 run tests/load_test_1000.js

Write-Host "`n>>> [SCREENSHOT 4 READY!] <<<" -ForegroundColor Green
Write-Host "Press Win + Shift + S to take a screenshot of this terminal window!" -ForegroundColor Yellow
Write-Host "Paste it in Word under Question 1(b) - 3 Instances Benchmark." -ForegroundColor Yellow
