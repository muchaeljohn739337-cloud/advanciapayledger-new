# ============================================
# RAILWAY DEPLOYMENT GUIDE
# ============================================

## Backend Deployment (Railway)

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### 2. Link Project
```bash
cd backend
railway link
```

### 3. Set Environment Variables
```bash
railway variables set DATABASE_URL="your-postgres-url"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set NODE_ENV="production"
```

### 4. Deploy
```bash
railway up
```

## Frontend Deployment (Vercel)

### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 2. Deploy Frontend
```bash
cd frontend
vercel --prod
```

### 3. Set Environment Variables in Vercel Dashboard
- NEXT_PUBLIC_API_URL: Your Railway backend URL
- NEXT_PUBLIC_APP_NAME: Advancia Pay Ledger

## GitHub/GitLab Sync

### Setup GitLab Token
1. Go to GitLab → Settings → Access Tokens
2. Create token with `write_repository` scope
3. Add to GitHub Secrets:
   - Go to GitHub repo → Settings → Secrets
   - Add `GITLAB_TOKEN`

### Auto-Sync Enabled
- Every push to `main` syncs to GitLab automatically
- Manual sync: Go to Actions → Sync GitHub to GitLab → Run workflow

## Database Setup (Railway PostgreSQL)

1. In Railway dashboard, add PostgreSQL service
2. Copy DATABASE_URL from Railway
3. Run migrations:
```bash
railway run npx prisma migrate deploy
```

## Monitoring

- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard
- GitHub Actions: Check sync status

## Contact
Email: advanciapayledger@gmail.com
