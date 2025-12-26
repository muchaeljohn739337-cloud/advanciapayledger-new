# Enable GitHub Security Features via API
# Run this with your GitHub Personal Access Token

param(
    [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
    Write-Host "❌ GitHub token required!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Get token from: https://github.com/settings/tokens/new" -ForegroundColor Yellow
    Write-Host "Required scopes: repo, security_events" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host '  .\enable-github-security.ps1 -Token "ghp_your_token_here"' -ForegroundColor White
    Write-Host "  OR set: `$env:GITHUB_TOKEN = `"ghp_your_token_here`"" -ForegroundColor White
    exit 1
}

$repo = "muchaeljohn739337-cloud/advanciapayledger-new"
$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

Write-Host "🔐 Enabling GitHub Security Features..." -ForegroundColor Cyan
Write-Host ""

# Enable Secret Scanning
Write-Host "Enabling Secret Scanning..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/secret-scanning/alerts" -Method Get -Headers $headers | Out-Null
    Write-Host "✅ Secret Scanning: Already enabled or accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Secret Scanning: Enable manually at Settings → Security" -ForegroundColor Yellow
}

# Enable Push Protection
Write-Host "Enabling Push Protection..." -ForegroundColor Yellow
try {
    $body = @{ security_and_analysis = @{ 
        secret_scanning = @{ status = "enabled" }
        secret_scanning_push_protection = @{ status = "enabled" }
    }} | ConvertTo-Json -Depth 10
    
    Invoke-RestMethod -Uri "https://api.github.com/repos/$repo" -Method Patch -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ Push Protection: Enabled" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Push Protection: Enable manually at Settings → Security" -ForegroundColor Yellow
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor DarkGray
}

# Enable Dependabot
Write-Host "Enabling Dependabot Alerts..." -ForegroundColor Yellow
try {
    $body = @{ security_and_analysis = @{ 
        dependabot_security_updates = @{ status = "enabled" }
    }} | ConvertTo-Json -Depth 10
    
    Invoke-RestMethod -Uri "https://api.github.com/repos/$repo" -Method Patch -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ Dependabot: Enabled" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Dependabot: May require manual enabling" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Security features enabled!" -ForegroundColor Green
Write-Host ""
Write-Host "Verify at: https://github.com/$repo/settings/security_analysis" -ForegroundColor Cyan
