# Postmark Account Setup & Configuration Guide

## 1. Account Approval Application
**URL**: https://account.postmarkapp.com/account_approval/apply

### Information Needed:
- **Company/Product Name**: Advancia Pay Ledger
- **Website**: Your production domain (e.g., advanciapayledger.com)
- **Email Volume**: Estimated monthly emails (start with 10,000/month)
- **Use Case**: Transactional emails for fintech SaaS platform
  - User registration & verification
  - Transaction notifications
  - Payment confirmations
  - Doctor verification emails
  - Security alerts
  - Password resets

### Approval Tips:
✓ Use a real business email (backend@advancia.com)
✓ Mention it's transactional (not marketing)
✓ Provide actual domain ownership
✓ Be specific about email types

---

## 2. Sender Signature Configuration

### Step 1: Add Domain Signature
**URL**: https://account.postmarkapp.com/servers/17735772/signatures

1. Click "Add Domain or Signature"
2. Choose "Domain" (recommended for production)
3. Enter: **advancia.com**
4. Follow DNS verification steps:

### DNS Records to Add:
\\\
Type: TXT
Host: @advancia.com
Value: [Postmark will provide unique value]

Type: CNAME  
Host: pm._domainkey.advancia.com
Value: [Postmark will provide]

Type: CNAME
Host: pm-bounces.advancia.com
Value: [Postmark will provide]
\\\

### Step 2: Verify Domain
- Wait 24-48 hours for DNS propagation
- Click "Verify" in Postmark dashboard
- Set as default sender signature

---

## 3. Email Templates Configuration

### Access Templates
**URL**: https://account.postmarkapp.com/servers/17735772/templates

### Templates to Create:

#### Template 1: Welcome Email
- **Name**: welcome-user
- **Subject**: Welcome to Advancia Pay Ledger! 🎉
- **Template Alias**: welcome
- **Variables**: {{firstName}}, {{email}}, {{dashboardUrl}}

#### Template 2: Email Verification
- **Name**: email-verification
- **Subject**: Verify Your Email Address
- **Template Alias**: email-verification
- **Variables**: {{verificationUrl}}, {{firstName}}

#### Template 3: Password Reset
- **Name**: password-reset
- **Subject**: Reset Your Password
- **Template Alias**: password-reset
- **Variables**: {{resetUrl}}, {{expiresIn}}

#### Template 4: Transaction Notification
- **Name**: transaction-notification
- **Subject**: Transaction {{status}} - {{amount}} {{currency}}
- **Template Alias**: transaction-notification
- **Variables**: {{amount}}, {{currency}}, {{status}}, {{transactionId}}, {{date}}

#### Template 5: Payment Confirmation
- **Name**: payment-confirmation
- **Subject**: Payment Received - {{amount}} {{currency}}
- **Template Alias**: payment-confirmation
- **Variables**: {{amount}}, {{currency}}, {{transactionId}}, {{date}}

#### Template 6: Doctor Verification
- **Name**: doctor-verification
- **Subject**: Your Doctor Account Has Been Verified
- **Template Alias**: doctor-verification
- **Variables**: {{doctorName}}, {{specialization}}, {{dashboardUrl}}

#### Template 7: Generic Notification
- **Name**: notification
- **Subject**: {{subject}}
- **Template Alias**: notification
- **Variables**: {{subject}}, {{message}}, {{dashboardUrl}}

---

## 4. Server Configuration

### Access Server Settings
**URL**: https://account.postmarkapp.com/servers/17735772/settings

### Recommended Settings:

#### Outbound Settings
- **Track Opens**: OFF (privacy)
- **Track Links**: OFF (privacy)
- **Custom Return-Path**: advancia.com
- **DKIM Signature**: Enabled ✓

#### Webhooks (Optional)
**URL**: https://account.postmarkapp.com/servers/17735772/webhooks

Configure webhooks for:
- Bounce notifications → {{BACKEND_URL}}/api/webhooks/postmark/bounce
- Delivery confirmations → {{BACKEND_URL}}/api/webhooks/postmark/delivery
- Open tracking → {{BACKEND_URL}}/api/webhooks/postmark/open
- Click tracking → {{BACKEND_URL}}/api/webhooks/postmark/click

---

## 5. Message Streams

### Default Transactional Stream
**URL**: https://account.postmarkapp.com/servers/17735772/streams

Keep default "Outbound" stream for transactional emails.

Optional: Create separate streams for:
- **User Communications** (welcome, verification)
- **Transaction Alerts** (payments, withdrawals)
- **Security Notifications** (password resets, 2FA)

---

## 6. Testing Setup

### Send Test Email via API:
\\\ash
curl "https://api.postmarkapp.com/email" \\
  -X POST \\
  -H "Accept: application/json" \\
  -H "Content-Type: application/json" \\
  -H "X-Postmark-Server-Token: 0fb515be-5bff-4674-a5e1-f410a01862d6" \\
  -d '{
    "From": "backend@advancia.com",
    "To": "your-test-email@example.com",
    "Subject": "Test Email from Advancia Pay",
    "TextBody": "This is a test email",
    "HtmlBody": "<html><body><h1>Test Email</h1></body></html>",
    "MessageStream": "outbound"
  }'
\\\

---

## 7. Production Checklist

Before going live:

☐ Domain verified with DKIM/SPF/DMARC
☐ Sender signature approved
☐ All email templates created and tested
☐ Sandbox mode disabled
☐ Webhooks configured (if needed)
☐ Rate limits reviewed (default: 10,000/month free)
☐ API key stored securely in .env
☐ Test emails sent successfully
☐ Bounce handling configured
☐ Suppression list reviewed

---

## 8. Monitoring & Analytics

### Activity Dashboard
**URL**: https://account.postmarkapp.com/servers/17735772/streams/outbound/activity

Monitor:
- Delivery rates
- Bounce rates
- Spam complaints
- API errors

### Best Practices:
- Keep bounce rate < 5%
- Monitor spam complaints
- Review rejected emails
- Check DNS health regularly

---

## Quick Links

- **Dashboard**: https://account.postmarkapp.com/servers/17735772
- **Templates**: https://account.postmarkapp.com/servers/17735772/templates
- **Signatures**: https://account.postmarkapp.com/servers/17735772/signatures
- **Settings**: https://account.postmarkapp.com/servers/17735772/settings
- **API Docs**: https://postmarkapp.com/developer
- **Support**: https://postmarkapp.com/support

