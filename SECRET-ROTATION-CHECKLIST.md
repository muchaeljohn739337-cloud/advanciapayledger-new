# 🔐 SECRET ROTATION CHECKLIST

## ⚠️ URGENT: All these secrets were exposed in Git history

### 🗄️ Database Credentials
- [ ] PostgreSQL password
- [ ] MongoDB connection string and password
- [ ] Redis password

### 🔑 Authentication
- [ ] JWT_SECRET (regenerate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] SESSION_SECRET (regenerate similar to JWT)
- [ ] Google OAuth Client Secret (regenerate at console.cloud.google.com)

### 💳 Payment Gateways
- [ ] Stripe Secret Key (rotate at dashboard.stripe.com)
- [ ] Stripe Webhook Secret
- [ ] Crypto.com Pay API credentials
- [ ] Alchemy Pay API credentials

### 📧 Email Services
- [ ] Resend API Key (rotate at resend.com/api-keys)
- [ ] SendGrid API Key (if used)
- [ ] SMTP password

### 🌐 Web3/Blockchain
- [ ] Treasury Private Key (create new wallet!)
- [ ] ETH Provider API Key (Infura/Alchemy)

### 🛡️ Security Services
- [ ] Cloudflare API Token
- [ ] Turnstile Secret Key
- [ ] VAPID Keys (regenerate with web-push CLI)

## 📝 Next Steps

1. **Rotate ALL secrets above**
2. **Update production environment variables**
3. **Force push cleaned Git history**: `git push origin main --force`
4. **Notify team members** to pull fresh history
5. **Monitor** for any unauthorized access attempts
6. **Enable 2FA** on all service accounts

## 🚀 After Rotation

```powershell
# Copy template and add real values
cp backend/.env.template backend/.env

# Never commit .env files
git status  # Should show .env files as untracked/ignored
```
