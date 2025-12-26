# Medbed Booking & Withdrawal Approval System

## ✅ Complete Implementation

### 1. Medbed Chamber Booking (`backend/src/routes/medbedBooking.ts`)

#### Chamber Management
- **GET `/api/medbeds/chambers`** - Get all active medbed chambers
- **GET `/api/medbeds/chambers/:chamberId/slots?date=2025-12-26`** - Get available time slots for specific date

#### Booking System
- **POST `/api/medbeds/bookings`** - Create new booking with payment
- **GET `/api/medbeds/bookings?page=1&limit=10`** - Get user's bookings (paginated)
- **PUT `/api/medbeds/bookings/:bookingId/cancel`** - Cancel booking with automatic refund

### 2. Withdrawal Approval System (`backend/src/routes/withdrawalApproval.ts`)

#### User Endpoints
- **POST `/api/withdrawals/request`** - Create withdrawal request
- **GET `/api/withdrawals/my-requests?page=1`** - Get user's withdrawal history

#### Admin Endpoints (ADMIN role required)
- **GET `/api/withdrawals/admin/pending?page=1`** - View all pending withdrawals
- **POST `/api/withdrawals/admin/approve/:withdrawalId`** - Approve withdrawal
- **POST `/api/withdrawals/admin/reject/:withdrawalId`** - Reject withdrawal with reason

## Payment Flow

### Deposit Flow (NOWPayments/Alchemy/Stripe)

1. **User clicks payment method** (e.g., NOWPayments)
2. **KYC verification** (if required by provider)
3. **Payment processed** → Provider webhook triggered
4. **Backend receives webhook** → Verifies signature
5. **User balance credited** → Database updated
6. **Real-time notification** → Socket.IO broadcasts to user
7. **User dashboard updates** → Balance shown instantly

### Booking Flow

1. **User selects chamber** → GET `/api/medbeds/chambers`
2. **Check available slots** → GET `/api/medbeds/chambers/:id/slots?date=...`
3. **User books session** → POST `/api/medbeds/bookings`
   ```json
   {
     "chamberId": "chamber_123",
     "sessionDate": "2025-12-26T10:00:00Z",
     "duration": 60,
     "paymentMethod": "balance",
     "notes": "First session"
   }
   ```
4. **System checks balance** → Insufficient? Return error
5. **Deduct from balance** → Hold funds
6. **Create booking record** → Status: PENDING
7. **Send notifications** → User + Admin notified
8. **Booking confirmed** → User receives confirmation

**Pricing**: $150 per hour

### Withdrawal Flow

1. **User requests withdrawal**
   ```
   POST /api/withdrawals/request
   {
     "amount": 500,
     "currency": "USD",
     "withdrawalAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
     "notes": "Monthly withdrawal"
   }
   ```

2. **System validates**
   - Check sufficient balance
   - Validate withdrawal address
   - Verify amount > 0

3. **Funds held**
   - Deducted from user balance immediately
   - Status: PENDING (user sees "Processing")
   - Transaction created with PENDING status

4. **Admin notification sent**
   - All admins receive real-time notification
   - Shows user details, amount, address
   - Includes trust score for risk assessment

5. **Admin reviews request**
   - GET `/api/withdrawals/admin/pending`
   - Reviews user trust score
   - Checks transaction history

6. **Admin approves OR rejects**

   **If Approved:**
   ```
   POST /api/withdrawals/admin/approve/:withdrawalId
   {
     "txHash": "0x123abc...",
     "notes": "Processed via bank transfer"
   }
   ```
   - Status changed to COMPLETED
   - User notified with tx hash
   - Real-time Socket.IO update
   - Transaction marked COMPLETED

   **If Rejected:**
   ```
   POST /api/withdrawals/admin/reject/:withdrawalId
   {
     "reason": "Suspicious activity detected"
   }
   ```
   - Status changed to REJECTED
   - **Funds automatically refunded** to user balance
   - User notified with rejection reason
   - Real-time Socket.IO update
   - Transaction marked FAILED

## API Examples

### 1. Book Medbed Session

**Request:**
```bash
curl -X POST https://api.advanciapayledger.com/api/medbeds/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chamberId": "chamber_123",
    "sessionDate": "2025-12-26T14:00:00Z",
    "duration": 120,
    "paymentMethod": "balance",
    "notes": "Wellness session"
  }'
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking_abc123",
    "userId": "user_xyz",
    "chamberId": "chamber_123",
    "sessionDate": "2025-12-26T14:00:00.000Z",
    "duration": 120,
    "cost": "300.00",
    "status": "PENDING",
    "paymentMethod": "balance",
    "paymentStatus": "PENDING"
  },
  "message": "Booking created successfully"
}
```

### 2. Request Withdrawal

**Request:**
```bash
curl -X POST https://api.advanciapayledger.com/api/withdrawals/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "withdrawalAddress": "user@bank.com",
    "notes": "December payout"
  }'
```

**Response:**
```json
{
  "success": true,
  "withdrawal": {
    "id": "withdrawal_xyz789",
    "userId": "user_abc",
    "amount": "1000.00",
    "currency": "USD",
    "status": "PENDING",
    "walletAddress": "user@bank.com",
    "requestedAt": "2025-12-25T15:30:00.000Z"
  },
  "message": "Withdrawal request submitted. Waiting for admin approval."
}
```

### 3. Admin Approve Withdrawal

**Request:**
```bash
curl -X POST https://api.advanciapayledger.com/api/withdrawals/admin/approve/withdrawal_xyz789 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x123abc456def...",
    "notes": "Wire transfer completed"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal approved successfully"
}
```

### 4. Admin Reject Withdrawal

**Request:**
```bash
curl -X POST https://api.advanciapayledger.com/api/withdrawals/admin/reject/withdrawal_xyz789 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Insufficient verification documents"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal rejected and funds refunded"
}
```

## Database Tables

### medbed_chambers
```prisma
model medbed_chambers {
  id        String   @id
  name      String
  type      String
  location  String?
  capacity  Int      @default(1)
  pricePerHour Decimal @default(150)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime
}
```

### medbed_bookings
```prisma
model medbed_bookings {
  id            String    @id
  userId        String
  chamberId     String
  sessionDate   DateTime
  duration      Int
  cost          Decimal
  status        String    @default("PENDING")
  paymentMethod String
  paymentStatus String    @default("PENDING")
  notes         String?
  cancelledAt   DateTime?
  createdAt     DateTime  @default(now())
}
```

### crypto_withdrawals
```prisma
model crypto_withdrawals {
  id            String    @id
  userId        String
  amount        Decimal
  currency      String
  status        String    @default("PENDING")
  walletAddress String
  txHash        String?
  notes         String?
  adminNotes    String?
  requestedAt   DateTime  @default(now())
  processedAt   DateTime?
  processedBy   String?
}
```

## Notification Flow

### User Notifications
- ✅ Booking confirmed
- ✅ Booking cancelled (with refund)
- ✅ Withdrawal request submitted
- ✅ Withdrawal approved (with tx hash)
- ❌ Withdrawal rejected (with reason)

### Admin Notifications
- ⚠️ New withdrawal request
- ⚠️ New booking requiring review
- 📊 Daily withdrawal summary

## Real-time Updates (Socket.IO)

### Events Emitted to Users
```typescript
// Balance update after deposit
socket.on('balance_update', {
  newBalance: 5500.00,
  change: 500.00,
  reason: "NOWPayments deposit completed"
});

// Withdrawal status update
socket.on('transaction', {
  transactionId: "withdrawal_xyz",
  type: "WITHDRAWAL",
  amount: 1000,
  status: "COMPLETED"
});

// New notification
socket.on('new_notification', {
  id: "notif_123",
  title: "Withdrawal Approved",
  message: "Your withdrawal of $1000 USD has been approved...",
  type: "SUCCESS"
});
```

## Security Features

### Withdrawal Protection
- ✅ Funds held immediately on request
- ✅ Admin approval required for all withdrawals
- ✅ Automatic refund on rejection
- ✅ Trust score evaluation
- ✅ Transaction history review
- ✅ Dual notification (user + admin)
- ✅ Audit trail with timestamps

### Booking Protection
- ✅ Balance check before booking
- ✅ Slot availability verification
- ✅ Automatic refund on cancellation
- ✅ Payment confirmation before slot lock
- ✅ Duplicate booking prevention

## Testing

### Test Booking Flow
```bash
# 1. Get chambers
curl -X GET https://api.advanciapayledger.com/api/medbeds/chambers \
  -H "Authorization: Bearer $TOKEN"

# 2. Check available slots
curl -X GET "https://api.advanciapayledger.com/api/medbeds/chambers/chamber_123/slots?date=2025-12-26" \
  -H "Authorization: Bearer $TOKEN"

# 3. Create booking
curl -X POST https://api.advanciapayledger.com/api/medbeds/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chamberId":"chamber_123","sessionDate":"2025-12-26T10:00:00Z","duration":60,"paymentMethod":"balance"}'
```

### Test Withdrawal Flow
```bash
# 1. Request withdrawal
curl -X POST https://api.advanciapayledger.com/api/withdrawals/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"currency":"USD","withdrawalAddress":"user@bank.com"}'

# 2. Check pending (as admin)
curl -X GET https://api.advanciapayledger.com/api/withdrawals/admin/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Approve withdrawal (as admin)
curl -X POST https://api.advanciapayledger.com/api/withdrawals/admin/approve/withdrawal_xyz \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"txHash":"0x123...","notes":"Processed"}'
```

## Files Created

### New Routes
- `backend/src/routes/medbedBooking.ts` - Chamber booking system
- `backend/src/routes/withdrawalApproval.ts` - Withdrawal approval workflow

### Modified Files
- `backend/src/index.ts` - Registered new routes
- `backend/src/services/webhookNotificationService.ts` - Already supports notifications

### Existing Integration
- `backend/src/routes/webhooks.ts` - Stripe/NOWPayments/Alchemy webhooks
- `backend/src/routes/dashboard.ts` - Dashboard API endpoints
- `backend/src/services/alchemyPayService.ts` - Alchemy Pay integration

## Next Steps

### Priority 1: Frontend Pages
- [ ] Medbed chamber listing page
- [ ] Booking calendar/scheduler
- [ ] User withdrawal request form
- [ ] Admin withdrawal approval dashboard
- [ ] Real-time notification bell with dropdown

### Priority 2: Enhanced Features
- [ ] Email notifications for withdrawals
- [ ] SMS alerts for large withdrawals
- [ ] Withdrawal limits based on trust score
- [ ] Automated small withdrawal approval (<$100)
- [ ] Batch withdrawal processing
- [ ] Chamber availability calendar UI

### Priority 3: Reporting
- [ ] Monthly booking reports
- [ ] Withdrawal analytics dashboard
- [ ] Revenue tracking by chamber
- [ ] User spending patterns
- [ ] Admin action logs

