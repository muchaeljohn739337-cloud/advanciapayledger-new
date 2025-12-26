# 🚀 Advancia Pay Ledger - Launch & Deployment Plan

## Phase 1: Pre-Launch Checklist (IMMEDIATE - 1-2 Days)

### ✅ Completed
- [x] Backend server running (port 5000)
- [x] Frontend server running (port 3000)
- [x] PostgreSQL database connected
- [x] Postmark email service configured
- [x] Zoho SMTP fallback configured
- [x] Email templates created
- [x] Push notification templates documented
- [x] JWT authentication configured
- [x] Prisma ORM setup
- [x] Socket.IO real-time features
- [x] DNS records added to Cloudflare

### 🔄 In Progress - Need Verification (Next 24 Hours)

#### 1. DNS & Domain Configuration (Cloudflare)
**Status**: DNS added, waiting for propagation

**Verify**:
\\\ash
# Check DNS propagation
nslookup advancia.com
nslookup www.advancia.com

# Check Postmark DNS records
nslookup pm._domainkey.advancia.com
nslookup pm-bounces.advancia.com
\\\

**Required Records** (Confirm these are in Cloudflare):
- A record: advancia.com → Your server IP
- A record: www.advancia.com → Your server IP  
- CNAME: api.advancia.com → Your backend domain
- TXT: @ → Postmark verification token
- CNAME: pm._domainkey → Postmark DKIM
- CNAME: pm-bounces → Postmark bounce handling

#### 2. Postmark Account Approval
**Action Required**: https://account.postmarkapp.com/account_approval/apply
- Fill out approval form (5 minutes)
- Wait 1-2 business days for approval
- Verify domain signature after approval

#### 3. SSL/TLS Certificates
**Options**:
- **Option A** (Recommended): Cloudflare SSL (Free)
  - Go to: Cloudflare Dashboard → SSL/TLS
  - Set to "Full (strict)"
  - Auto-provisioned by Cloudflare
  
- **Option B**: Let's Encrypt (Free, manual)
  \\\ash
  sudo certbot certonly --standalone -d advancia.com -d www.advancia.com
  \\\

---

## Phase 2: Critical Fixes (Before Launch - 2-3 Days)

### 🔴 High Priority Issues to Fix

#### 1. Environment Variables
**File**: \ackend/.env\

**Update Production Values**:
\\\ash
# Update these for production:
NODE_ENV=production
FRONTEND_URL=https://advancia.com
BACKEND_URL=https://api.advancia.com

# Generate strong secrets:
JWT_SECRET=<generate-with-openssl-rand-base64-32>
SESSION_SECRET=<generate-with-openssl-rand-base64-32>

# Database (use production PostgreSQL)
DATABASE_URL=<production-postgres-url>

# Set proper CORS
ALLOWED_ORIGINS=https://advancia.com,https://www.advancia.com
\\\

#### 2. Missing Middleware Exports (FIXED ✓)
- authenticateToken ✓
- requireAdmin ✓
- logAdminAction ✓
- pushNotificationService ✓

#### 3. Port Configuration
**Issue**: Frontend tries port 3000 (conflicts)

**Fix**:
\\\ash
# frontend/.env.local
PORT=3000
NEXT_PUBLIC_API_URL=https://api.advancia.com
\\\

#### 4. Database Migrations
**Before launch, ensure all migrations are applied**:
\\\ash
cd backend
npx prisma migrate deploy
npx prisma generate
\\\

#### 5. Security Hardening
**Add to backend/src/index.ts**:
\\\	ypescript
// Rate limiting
import rateLimit from 'express-rate-limit';
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Helmet security headers
import helmet from 'helmet';
app.use(helmet());

// CORS configuration
import cors from 'cors';
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
\\\

---

## Phase 3: Deployment Strategy

### Option A: Digital Ocean (Recommended for Quick Launch)

#### 1. Create Droplet
\\\ash
# Choose:
- Ubuntu 22.04 LTS
- 2 GB RAM / 2 vCPUs (/month)
- Choose datacenter near your users
- Add SSH key
\\\

#### 2. Server Setup Script
\\\ash
# SSH into droplet
ssh root@<your-droplet-ip>

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
\\\

#### 3. Deploy Backend
\\\ash
# Clone repository
git clone <your-repo-url> /var/www/advancia-pay-ledger
cd /var/www/advancia-pay-ledger/backend

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start npm --name "advancia-backend" -- start
pm2 save
pm2 startup
\\\

#### 4. Deploy Frontend
\\\ash
cd /var/www/advancia-pay-ledger/frontend

# Build for production
npm run build

# Start with PM2
pm2 start npm --name "advancia-frontend" -- start
pm2 save
\\\

#### 5. Nginx Configuration
\\\
ginx
# /etc/nginx/sites-available/advancia

# Frontend
server {
    listen 80;
    server_name advancia.com www.advancia.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade ;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
        proxy_cache_bypass ;
    }
}

# Backend API
server {
    listen 80;
    server_name api.advancia.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade ;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host System.Management.Automation.Internal.Host.InternalHost;
        proxy_cache_bypass ;
    }
}
\\\

\\\ash
# Enable site
sudo ln -s /etc/nginx/sites-available/advancia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\\\

#### 6. SSL with Certbot
\\\ash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d advancia.com -d www.advancia.com -d api.advancia.com
\\\

---

### Option B: Render.com (Easiest, No Server Management)

#### 1. Backend Deployment
1. Go to: https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: \cd backend && npm install && npx prisma generate\
   - Start Command: \cd backend && npm start\
   - Environment: Add all .env variables
   - Auto-Deploy: Yes

#### 2. Frontend Deployment
1. New → Static Site
2. Connect GitHub repo
3. Settings:
   - Build Command: \cd frontend && npm install && npm run build\
   - Publish Directory: \rontend/out\

#### 3. Database
1. New → PostgreSQL
2. Copy DATABASE_URL to backend environment

---

### Option C: Vercel (Frontend) + Railway (Backend)

#### Frontend (Vercel)
\\\ash
npm i -g vercel
cd frontend
vercel --prod
\\\

#### Backend (Railway)
1. Go to: https://railway.app
2. New Project → Deploy from GitHub
3. Select backend folder
4. Add environment variables
5. Railway provides PostgreSQL automatically

---

## Phase 4: Post-Launch Monitoring (First Week)

### 1. Setup Monitoring

#### Backend Logging
\\\ash
# View logs
pm2 logs advancia-backend

# Monitor resources
pm2 monit
\\\

#### Error Tracking (Sentry - Already configured)
- Check: https://sentry.io
- Monitor error rates
- Set up alerts

### 2. Performance Monitoring
- Database query performance
- API response times
- Socket.IO connection stability
- Email delivery rates (Postmark dashboard)

### 3. Security Checks
- SSL certificate validity
- Rate limiting effectiveness  
- Failed login attempts
- API authentication logs

---

## Phase 5: Remaining Features (Post-Launch)

### Week 1-2: Core Features
- [ ] Stripe payment integration testing
- [ ] Crypto payment provider integration
- [ ] User registration flow testing
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Admin dashboard testing

### Week 3-4: Enhanced Features
- [ ] Push notifications implementation
- [ ] 2FA/TOTP setup
- [ ] Transaction history optimization
- [ ] Doctor verification workflow
- [ ] Withdrawal processing

### Month 2: Optimization
- [ ] Database indexing optimization
- [ ] Caching strategy (Redis)
- [ ] CDN setup for static assets
- [ ] API rate limiting fine-tuning
- [ ] Load testing and scaling

---

## Critical Commands Reference

### Check DNS Propagation
\\\ash
nslookup advancia.com
dig advancia.com
\\\

### Test Email Sending
\\\ash
cd backend
node -e "const {emailService}=require('./src/services/emailService');emailService.send({to:'test@example.com',template:'notification',data:{subject:'Test',message:'Testing',dashboardUrl:'https://advancia.com'}}).then(console.log)"
\\\

### Database Health Check
\\\ash
cd backend
npx prisma studio  # Visual database browser
\\\

### PM2 Management
\\\ash
pm2 list          # List all processes
pm2 restart all   # Restart all
pm2 logs          # View logs
pm2 monit         # Monitor resources
\\\

---

## Launch Day Checklist

### Morning (Pre-Launch)
- [ ] DNS fully propagated (48 hours after adding)
- [ ] SSL certificates active
- [ ] Database backed up
- [ ] All environment variables set
- [ ] Postmark domain verified
- [ ] Test email sent successfully
- [ ] Test transaction flow (sandbox mode)

### Launch (Go Live)
- [ ] Switch DNS to production servers
- [ ] Monitor logs for errors
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test payment flow (small amount)
- [ ] Verify email notifications working

### Post-Launch (First Hour)
- [ ] Monitor error rates (Sentry)
- [ ] Check API response times
- [ ] Verify database connections stable
- [ ] Test from multiple devices
- [ ] Verify Socket.IO connections

---

## Support & Resources

- **GitHub Repo**: <your-repo-url>
- **Postmark Dashboard**: https://account.postmarkapp.com/servers/17735772
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Database Monitoring**: Prisma Studio or pgAdmin
- **Logs Location**: \ackend/logs/\ or PM2 logs

---

## Estimated Timeline

- **Phase 1** (Pre-Launch): 1-2 days (DNS propagation)
- **Phase 2** (Critical Fixes): 2-3 days
- **Phase 3** (Deployment): 1 day
- **Phase 4** (Monitoring): 1 week
- **Phase 5** (Features): Ongoing

**Total to Launch**: 4-6 days
**Total to Full Feature Set**: 6-8 weeks

---

## Next Immediate Actions (Today)

1. ✅ Verify DNS records in Cloudflare dashboard
2. 🔄 Apply for Postmark account approval
3. 🔄 Choose deployment platform (Digital Ocean vs Render vs Vercel+Railway)
4. 🔄 Generate production JWT secrets
5. 🔄 Setup PostgreSQL production database
6. 🔄 Test email sending with Postmark
7. 🔄 Create deployment repository branch

**Ready to proceed with deployment setup?**

