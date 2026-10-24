Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " RUNNING FAILOVER TEST FOR SCREENSHOT 6 (AFTER Nginx Fix)" -ForegroundColor Cyan
Write-Host " Enabling resilient retry, then stopping container mid-test" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

Copy-Item nginx/nginx_resilient.conf nginx/nginx.conf -Force
docker exec mess_nginx_lb nginx -s reload

Write-Host "Starting background stopper (stops mess_backend_2 at 4 seconds)..." -ForegroundColor Gray
Start-Job -ScriptBlock { Start-Sleep -Seconds 4; docker stop mess_backend_2 } | Out-Null

k6 run tests/failover_test.js

Write-Host "Restarting mess_backend_2..." -ForegroundColor Gray
docker start mess_backend_2 | Out-Null

