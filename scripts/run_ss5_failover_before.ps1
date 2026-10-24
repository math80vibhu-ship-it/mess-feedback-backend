Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " RUNNING FAILOVER TEST FOR SCREENSHOT 5 (BEFORE Nginx Fix)" -ForegroundColor Cyan
Write-Host " Setting proxy_next_upstream off, then stopping container mid-test" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

Copy-Item nginx/nginx_unresilient.conf nginx/nginx.conf -Force
docker exec mess_nginx_lb nginx -s reload

Write-Host "Starting background stopper (stops mess_backend_2 at 4 seconds)..." -ForegroundColor Gray
Start-Job -ScriptBlock { Start-Sleep -Seconds 4; docker stop mess_backend_2 } | Out-Null

k6 run tests/failover_test.js

Write-Host "Restarting mess_backend_2..." -ForegroundColor Gray
docker start mess_backend_2 | Out-Null

Write-Host "`n>>> [SCREENSHOT 5 READY!] <<<" -ForegroundColor Red
Write-Host "Notice the red (X status is 200) and failed requests above!" -ForegroundColor Red
Write-Host "Press Win + Shift + S to take a screenshot of this terminal window!" -ForegroundColor Yellow
Write-Host "Paste it in Word under Question 1(c) - Before Configuration." -ForegroundColor Yellow
