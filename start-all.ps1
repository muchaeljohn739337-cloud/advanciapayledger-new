# Startup Script with Port Protection
$ErrorActionPreference = "Stop"
$PROJECT_ROOT = "C:\Users\mucha.DESKTOP-H7T9NPM\Projects\advancia-pay-ledger-new"

# Run port manager first
& "$PROJECT_ROOT\port-manager.ps1"

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start Hardhat in new PowerShell window
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_ROOT\backend'; npx hardhat node" -WindowStyle Minimized

Start-Sleep -Seconds 3

# Start Backend in new PowerShell window
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_ROOT\backend'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 5

# Start Frontend in new PowerShell window  
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_ROOT\frontend'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 10

Write-Host "✅ All services started in separate windows" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access points:" -ForegroundColor Yellow
Write-Host "   Frontend:  http://localhost:3000"
Write-Host "   Backend:   http://localhost:4000"
Write-Host "   Hardhat:   http://127.0.0.1:8545"
Write-Host ""
Write-Host "📝 To stop services, close the PowerShell windows or run:" -ForegroundColor Cyan
Write-Host "   Get-Process pwsh | Where-Object {`$_.MainWindowTitle -like '*hardhat*' -or `$_.MainWindowTitle -like '*npm*'} | Stop-Process"
