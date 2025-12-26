# ============================================
# ADVANCIA PAY LEDGER v2.0 - SETUP SCRIPT
# ============================================

Write-Host "🚀 Setting up Advancia Pay Ledger v2.0..." -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "🔍 Checking system requirements..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found! Please install Node.js 18.x" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Install cross-env globally if not exists
Write-Host "🔧 Installing cross-env globally..." -ForegroundColor Yellow
npm install -g cross-env 2>$null
Write-Host "✅ cross-env installed" -ForegroundColor Green

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green

# Setup backend
Write-Host "🔧 Setting up backend..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Check for environment files
Write-Host "🌍 Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.development")) {
    Write-Host "📋 Creating development environment file..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env.development"
    Write-Host "✅ Created .env.development from template" -ForegroundColor Green
}

if (-not (Test-Path ".env")) {
    Write-Host "📋 Creating default .env file..." -ForegroundColor Cyan  
    Copy-Item ".env.development" ".env"
    Write-Host "✅ Created .env from development template" -ForegroundColor Green
}

# Generate Prisma client
Write-Host "🔨 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green

# Setup frontend
Write-Host "🎨 Setting up frontend..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Return to root
Set-Location ..

Write-Host ""
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🛠️  Environment Configuration:" -ForegroundColor Cyan
Write-Host "   Development: backend/.env.development" -ForegroundColor White
Write-Host "   Production:  backend/.env.production" -ForegroundColor White
Write-Host "   Active:      backend/.env (development)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Quick Start Commands:" -ForegroundColor Cyan
Write-Host "   npm run dev:local        # Development mode" -ForegroundColor White
Write-Host "   npm run prod             # Production mode" -ForegroundColor White
Write-Host "   npm run docker:up        # Start databases" -ForegroundColor White
Write-Host "   npm run prisma:studio    # Database viewer" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "   Health:   http://localhost:4000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "✨ Enterprise Features Ready:" -ForegroundColor Cyan
Write-Host "   🤖 20+ AI Agents & RPA System" -ForegroundColor Green
Write-Host "   💰 Multi-Currency Transactions" -ForegroundColor Green  
Write-Host "   ⚡ Real-time Socket.IO Events" -ForegroundColor Green
Write-Host "   🌐 Web3 & Crypto Integration" -ForegroundColor Green
Write-Host "   🔒 Advanced Security & Auth" -ForegroundColor Green
Write-Host "   💳 Payment Gateway APIs" -ForegroundColor Green
Write-Host "   📊 Enterprise Analytics" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update backend/.env.development with your API keys" -ForegroundColor White
Write-Host "2. Run 'npm run docker:up' to start databases" -ForegroundColor White
Write-Host "3. Run 'npm run dev:local' to start development" -ForegroundColor White
Write-Host ""
