# 🚀 Quick Start: Postmark & Notifications Setup

## Step 1: Apply for Account Approval (5 min)
**URL**: https://account.postmarkapp.com/account_approval/apply

Fill in:
- Company: Advancia Pay Ledger
- Website: advanciapayledger.com (or your domain)
- Volume: 10,000/month
- Use Case: "Transactional emails for fintech SaaS - payment confirmations, user verification, security alerts"

## Step 2: Verify Domain (30 min + DNS wait)
**URL**: https://account.postmarkapp.com/servers/17735772/signatures

1. Click "Add Domain"
2. Enter: advancia.com
3. Add DNS records (provided by Postmark):
   - TXT record for @advancia.com
   - CNAME for pm._domainkey
   - CNAME for pm-bounces
4. Wait 24-48hrs for propagation
5. Click "Verify"

## Step 3: Create Email Templates (15 min)
**URL**: https://account.postmarkapp.com/servers/17735772/templates

Import these templates from \ackend/email-templates/\:
- ✓ welcome.html
- ✓ notification.html

Create more templates as needed:
- Email verification
- Password reset
- Transaction notifications
- Doctor approval

## Step 4: Configure Server Settings (5 min)
**URL**: https://account.postmarkapp.com/servers/17735772/settings

Recommended:
- Track Opens: OFF (privacy)
- Track Links: OFF (privacy)  
- DKIM Signature: ON ✓

## Step 5: Test Email Sending (2 min)

### Via Backend API:
\\\ash
cd backend
npm run dev
\\\

### Via Node REPL:
\\\javascript
const { emailService } = require('./src/services/emailService');

await emailService.send({
  to: 'test@example.com',
  template: 'notification',
  data: {
    subject: 'Test from Postmark',
    message: 'If you see this, Postmark is working!',
    dashboardUrl: 'http://localhost:3000/dashboard'
  }
});
\\\

## Step 6: Push Notifications Setup (Optional - 30 min)

### Option A: Firebase Cloud Messaging
1. Go to: https://console.firebase.google.com
2. Create project
3. Add web app
4. Get Server Key
5. Add to .env:
\\\
FCM_SERVER_KEY=your-key
FCM_SENDER_ID=your-id
\\\

### Option B: Web Push API (VAPID)
\\\ash
npm install web-push -g
web-push generate-vapid-keys
\\\
Add keys to .env

### Option C: OneSignal (Easiest)
1. Go to: https://onesignal.com
2. Create free account
3. Add web push
4. Copy App ID to .env

---

## Current Status ✓

✅ Postmark API Key configured
✅ Zoho SMTP fallback configured
✅ Email templates created
✅ Backend running on port 5000
✅ Push notification templates documented

---

## Next Steps

☐ Apply for Postmark approval
☐ Verify domain (advancia.com)
☐ Upload email templates
☐ Test email sending
☐ Choose push notification provider
☐ Implement push notifications in frontend

---

## Quick Links

- **Postmark Dashboard**: https://account.postmarkapp.com/servers/17735772
- **Templates**: https://account.postmarkapp.com/servers/17735772/templates
- **API Docs**: https://postmarkapp.com/developer
- **Setup Guide**: backend/email-templates/POSTMARK-SETUP.md
- **Push Templates**: backend/email-templates/PUSH-NOTIFICATION-TEMPLATES.md

---

## Need Help?

- Email: backend@advancia.com
- Postmark Support: https://postmarkapp.com/support
- Backend logs: \ackend/logs/\

