# Email Service Setup Guide - Advancia Pay Ledger

## Postmark Setup (Primary Email Service)

### Already Configured ✅
- **Server ID**: 17735772
- **API Key**: Securely stored in .env (not exposed in repo)

### Next Steps:

1. **Verify Sender Signature**
   - Go to: https://account.postmarkapp.com/servers/17735772/signatures
   - Add your Zoho email domain
   - Verify DNS records (SPF, DKIM, Return-Path)

2. **Create Email Templates**
   - Go to: https://account.postmarkapp.com/servers/17735772/templates
   - Import templates from \ackend/email-templates/*.html\
   - Set template aliases to match filenames (e.g., "notification", "welcome")

3. **Configure Default From Email**
   - Use your verified Zoho domain email
   - Example: noreply@yourdomain.com

4. **Add Email Signature** (Optional)
   - Go to Server Settings
   - Add professional signature with support contact

---

## Zoho Mail Setup (SMTP Fallback)

### Step 1: Generate App Password
1. Login to Zoho Mail: https://mail.zoho.com
2. Go to Account Settings → Security
3. Click on "App Passwords": https://accounts.zoho.com/home#security/tpass
4. Generate new app password for "Advancia Pay Ledger Backend"
5. Save the password securely

### Step 2: Update .env File
\\\ash
# Already in your .env file - just update these values:
SMTP_HOST="smtp.zoho.com"
SMTP_PORT="587"  
SMTP_USER="your-email@yourdomain.com"  # Your Zoho email
SMTP_PASS="your-app-password-here"     # From Step 1
EMAIL_FROM="noreply@yourdomain.com"    # Verified sender
EMAIL_REPLY_TO="support@yourdomain.com"
\\\

### Step 3: SMTP Settings
- **Host**: smtp.zoho.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Authentication**: Required
- **Encryption**: STARTTLS

---

## Testing Email Service

### Test via Node.js:
\\\javascript
const { emailService } = require('./src/services/emailService');

await emailService.send({
  to: 'test@example.com',
  template: 'notification',
  data: {
    subject: 'Test Email',
    message: 'This is a test email from Advancia Pay Ledger',
    dashboardUrl: process.env.FRONTEND_URL + '/dashboard'
  }
});
\\\

---

## Priority & Fallback Logic

1. **Primary**: Postmark API (best deliverability)
2. **Fallback**: Zoho SMTP (if Postmark fails)
3. **Log Only**: If both fail, logs error to console

Current status: Both services configured ✅

---

## Important Security Notes

⚠️ **NEVER commit these to Git:**
- POSTMARK_API_KEY
- SMTP_PASS (Zoho app password)
- Any email credentials

✅ **Always:**
- Use .env for local development
- Use environment variables in production
- Keep .env in .gitignore
- Use .env.example for documentation (without real values)

---

## Troubleshooting

### Postmark not sending?
- Check API key is valid
- Verify sender signature/domain
- Check server is not in sandbox mode
- Review bounce/spam reports in Postmark dashboard

### Zoho SMTP failing?
- Verify app password (not account password!)
- Check SMTP port (587 for TLS)
- Ensure 2FA is enabled on Zoho account
- Check firewall allows outbound port 587

### Both failing?
- Check internet connectivity
- Review backend logs in \ackend/logs/\
- Verify .env file is loaded correctly
- Test with curl or telnet to SMTP server
