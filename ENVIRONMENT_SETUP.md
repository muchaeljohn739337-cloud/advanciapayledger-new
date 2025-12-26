# Advancia Pay Ledger v2.0 - Environment Setup Guide

## ✅ Setup Complete

The project has been successfully cleaned up and optimized:

### 🗂️ Changes Made

1. **Removed Old Project**: The `personal-website` folder has been marked for deletion
2. **Eliminated Supabase**: All Supabase references have been removed
3. **Environment Differentiation**: Added proper development/production separation

### 📁 Environment Structure

```
backend/
├── .env.example          # Template file
├── .env.development      # Development settings
├── .env.production       # Production settings  
├── .env                  # Active config (links to development)
└── src/config/
    └── environment.ts    # Environment loader
```

### 🚀 Quick Start

#### Development Mode
```bash
npm run dev:local         # Uses .env.development
npm run docker:up         # Start dev databases
```

#### Production Mode  
```bash
npm run prod             # Uses .env.production
npm run docker:up:prod   # Start production databases
```

### 🔧 Environment Configuration

#### Development (.env.development)
- Local PostgreSQL on port 5432
- Local Redis on port 6379
- Debug logging enabled
- Test payment keys
- Relaxed security settings

#### Production (.env.production)
- Secure database connections
- Production payment keys
- Cloudflare protection enabled
- Strict security settings
- VPN access controls

### 🛡️ Security Features

#### Development
- Rate limiting: 1000 requests/window
- Debug logging enabled
- Admin bypasses enabled
- Local-only access

#### Production
- Rate limiting: 100 requests/window
- Minimal logging (warn level)
- IP whitelisting enforced
- Cloudflare DDoS protection
- Tailscale VPN requirement

### 📊 Database Configuration

#### Development
```
PostgreSQL: localhost:5432/advancia_payledger_dev
MongoDB:    localhost:27017/advancia_ledger_dev
Redis:      localhost:6379
```

#### Production
```
PostgreSQL: prod-host:5432/advancia_payledger_prod
MongoDB:    cluster.xxxxx.mongodb.net/advancia_ledger
Redis:      prod-redis:6379 (secured)
```

### 🔌 API Integrations

All integrations support environment-based configuration:

- **Stripe**: Test keys for dev, live keys for prod
- **Crypto.com Pay**: Sandbox vs live environment
- **Alchemy Pay**: Test vs production endpoints
- **Web3**: Testnet vs mainnet providers
- **Email**: Console output (dev) vs live delivery (prod)

### 📋 Next Steps

1. **Update Environment Files**:
   ```bash
   # Edit development settings
   code backend/.env.development
   
   # Edit production settings  
   code backend/.env.production
   ```

2. **Start Development**:
   ```bash
   npm run setup          # Install dependencies
   npm run docker:up      # Start databases
   npm run dev:local      # Start development
   ```

3. **Deploy Production**:
   ```bash
   npm run build:prod     # Build for production
   npm run docker:up:prod # Start production databases
   npm run prod           # Start production mode
   ```

### 🌐 URLs

#### Development
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health Check: http://localhost:4000/api/health
- Database: http://localhost:4000/prisma-studio

#### Production
- Frontend: https://advanciapayledger.com
- Backend: https://api.advanciapayledger.com  
- Health Check: https://api.advanciapayledger.com/api/health

### ⚡ Features Ready

- ✅ 20+ AI Agents & RPA System
- ✅ Multi-Currency Transactions  
- ✅ Real-time Socket.IO Events
- ✅ Web3 & Crypto Integration
- ✅ Advanced Security & Auth
- ✅ Payment Gateway APIs
- ✅ Enterprise Analytics
- ✅ Environment-based Configuration
- ✅ Production-ready Docker Setup

The enterprise fintech platform is now optimized and ready for both development and production deployment!
