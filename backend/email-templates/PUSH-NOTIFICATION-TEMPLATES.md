# Push Notification Templates for Advancia Pay Ledger

## Firebase Cloud Messaging (FCM) Configuration

### 1. Transaction Notifications

#### Payment Received
\\\json
{
  "notification": {
    "title": "Payment Received",
    "body": "You received {{amount}} {{currency}}",
    "icon": "/icons/payment-success.png",
    "badge": "/icons/badge.png",
    "tag": "transaction-{{transactionId}}",
    "requireInteraction": true
  },
  "data": {
    "type": "PAYMENT_RECEIVED",
    "transactionId": "{{transactionId}}",
    "amount": "{{amount}}",
    "currency": "{{currency}}",
    "clickAction": "/transactions/{{transactionId}}"
  }
}
\\\

#### Payment Failed
\\\json
{
  "notification": {
    "title": "Payment Failed",
    "body": "Payment of {{amount}} {{currency}} failed",
    "icon": "/icons/payment-failed.png",
    "badge": "/icons/badge.png",
    "tag": "transaction-{{transactionId}}"
  },
  "data": {
    "type": "PAYMENT_FAILED",
    "transactionId": "{{transactionId}}",
    "amount": "{{amount}}",
    "currency": "{{currency}}",
    "reason": "{{reason}}",
    "clickAction": "/transactions/retry/{{transactionId}}"
  }
}
\\\

#### Withdrawal Processed
\\\json
{
  "notification": {
    "title": "Withdrawal Processed",
    "body": "{{amount}} {{currency}} withdrawal completed",
    "icon": "/icons/withdrawal.png",
    "badge": "/icons/badge.png"
  },
  "data": {
    "type": "WITHDRAWAL_PROCESSED",
    "withdrawalId": "{{withdrawalId}}",
    "amount": "{{amount}}",
    "currency": "{{currency}}",
    "clickAction": "/withdrawals/{{withdrawalId}}"
  }
}
\\\

---

### 2. Security Notifications

#### Login from New Device
\\\json
{
  "notification": {
    "title": "New Device Login",
    "body": "Login detected from {{deviceName}} in {{location}}",
    "icon": "/icons/security-alert.png",
    "badge": "/icons/badge.png",
    "requireInteraction": true
  },
  "data": {
    "type": "SECURITY_ALERT",
    "alertType": "NEW_DEVICE",
    "deviceName": "{{deviceName}}",
    "location": "{{location}}",
    "timestamp": "{{timestamp}}",
    "clickAction": "/security/devices"
  }
}
\\\

#### 2FA Enabled
\\\json
{
  "notification": {
    "title": "Two-Factor Authentication Enabled",
    "body": "Your account is now more secure",
    "icon": "/icons/2fa-enabled.png",
    "badge": "/icons/badge.png"
  },
  "data": {
    "type": "SECURITY_UPDATE",
    "feature": "2FA_ENABLED",
    "clickAction": "/settings/security"
  }
}
\\\

---

### 3. Account Notifications

#### Email Verified
\\\json
{
  "notification": {
    "title": "Email Verified Successfully",
    "body": "Your email {{email}} has been verified",
    "icon": "/icons/verified.png",
    "badge": "/icons/badge.png"
  },
  "data": {
    "type": "ACCOUNT_UPDATE",
    "updateType": "EMAIL_VERIFIED",
    "clickAction": "/dashboard"
  }
}
\\\

#### Doctor Account Approved
\\\json
{
  "notification": {
    "title": "Doctor Account Approved",
    "body": "Welcome Dr. {{lastName}}! Your account is now active",
    "icon": "/icons/doctor-approved.png",
    "badge": "/icons/badge.png",
    "requireInteraction": true
  },
  "data": {
    "type": "ACCOUNT_STATUS",
    "status": "APPROVED",
    "role": "DOCTOR",
    "clickAction": "/doctor/dashboard"
  }
}
\\\

---

## Web Push API Configuration

### Service Worker Registration
\\\javascript
// Register service worker
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    })
    .then(subscription => {
      // Send subscription to backend
      fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    });
}
\\\

### Service Worker (sw.js)
\\\javascript
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.notification.body,
    icon: data.notification.icon,
    badge: data.notification.badge,
    tag: data.notification.tag,
    data: data.data,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.notification.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    clients.openWindow(event.notification.data.clickAction);
  }
});
\\\

---

## OneSignal Configuration (Alternative)

### Installation
\\\ash
npm install react-onesignal
\\\

### Initialization
\\\javascript
import OneSignal from 'react-onesignal';

OneSignal.init({
  appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
  safari_web_id: process.env.NEXT_PUBLIC_SAFARI_WEB_ID,
  notificationClickHandlerMatch: 'origin',
  notificationClickHandlerAction: 'navigate'
});
\\\

---

## Environment Variables

Add to \.env\:
\\\ash
# Web Push (VAPID Keys)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:backend@advancia.com

# Firebase Cloud Messaging
FCM_SERVER_KEY=your-fcm-server-key
FCM_SENDER_ID=your-sender-id

# OneSignal (Alternative)
ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_API_KEY=your-api-key
\\\

---

## Testing Push Notifications

### Test via cURL:
\\\ash
curl -X POST https://fcm.googleapis.com/fcm/send \\
  -H "Authorization: key=YOUR_SERVER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "DEVICE_TOKEN",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test from Advancia Pay",
      "icon": "/icons/logo.png"
    },
    "data": {
      "clickAction": "/dashboard"
    }
  }'
\\\

---

## Best Practices

✓ Request permission at appropriate time (after user action)
✓ Provide clear opt-out mechanism
✓ Don't spam - limit frequency
✓ Personalize notifications with user data
✓ Include actionable CTAs
✓ Test on multiple devices/browsers
✓ Handle permission denial gracefully
✓ Respect user notification preferences
✓ Track engagement metrics
✓ Fallback to email if push unavailable

