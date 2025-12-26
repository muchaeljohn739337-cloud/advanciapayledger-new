# Port Manager Script - Enforces port restrictions
$ALLOWED_PORTS = @(3000, 4000, 8545)
$PROJECT_ROOT = "C:\Users\mucha.DESKTOP-H7T9NPM\Projects\advancia-pay-ledger-new"

Write-Host "🔒 Enforcing port restrictions..." -ForegroundColor Cyan

# Kill any unauthorized processes on our ports
foreach($port in $ALLOWED_PORTS) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if($connections) {
        foreach($conn in $connections) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if($proc -and $proc.Path -notlike "*node*" -and $proc.Path -notlike "*hardhat*") {
                Write-Host "❌ Killing unauthorized process on port $port (PID: $($conn.OwningProcess))" -ForegroundColor Red
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "✅ Port restrictions enforced" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Port Allocation:" -ForegroundColor Yellow
Write-Host "   Port 3000 → Frontend (Next.js)"
Write-Host "   Port 4000 → Backend (Express API)"
Write-Host "   Port 8545 → Hardhat (Local Blockchain)"
