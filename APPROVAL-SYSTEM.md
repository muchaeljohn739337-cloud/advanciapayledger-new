# 🔐 Admin Approval & Password Recovery System

## ✅ Implementation Complete

### Overview
Comprehensive user registration workflow requiring admin approval before users can access their dashboard, plus secure password recovery system.

---

## Backend Features

### 1. Database Schema Changes (`prisma/schema.prisma`)
**New Fields Added to `users` model:**
```prisma
passwordResetToken     String?   @unique
passwordResetExpires   DateTime?
approvedByAdmin        Boolean   @default(false)
approvedAt             DateTime?
approvedBy             String?   // Admin user ID
```

### 2. Password Recovery Routes (`backend/src/routes/password.ts`)
- **POST /api/password/forgot** - Request password reset
  - Generates secure token (SHA-256 hashed)
  - Sends reset email with link
  - Token expires in 1 hour
  - Prevents email enumeration

- **POST /api/password/reset** - Reset password with token
  - Validates token and expiration
  - Hashes new password (bcrypt)
  - Clears reset token
  - Sends confirmation email

- **GET /api/password/verify-token/:token** - Verify token validity
  - Returns email if valid
  - Shows expiration status

### 3. Admin Approval Routes (`backend/src/routes/approvals.ts`)
- **GET /api/approvals/pending** - Get pending user approvals
  - Paginated list
  - Requires `MANAGE_USERS` permission
  - Shows unapproved users only

- **POST /api/approvals/approve/:userId** - Approve user
  - Sets `approvedByAdmin = true`
  - Records approver ID and timestamp
  - Sends approval email
  - Allows role assignment during approval

- **POST /api/approvals/reject/:userId** - Reject user
  - Deactivates account
  - Records rejection reason
  - Sends rejection email

- **POST /api/approvals/bulk-approve** - Bulk approve users
  - Approves multiple users at once
  - Efficient for batch processing

### 4. Enhanced Login Flow (`backend/src/routes/auth.ts`)
**Login now checks:**
1. ✓ User exists
2. ✓ Account is active
3. ✓ **Admin approval** (NEW)
4. ✓ Not suspended
5. ✓ Password matches
6. ✓ Activity logging

**Response on Pending Approval:**
```json
{
  "error": "Your account is pending admin approval...",
  "pending": true
}
```

---

## Frontend Features

### 1. Forgot Password Page (`frontend/src/app/forgot-password/page.tsx`)
**Features:**
- Email input with validation
- Success/error message display
- Prevents email enumeration
- Links back to login

**User Flow:**
1. User enters email
2. Backend sends reset email
3. User receives link
4. Redirect to reset page

### 2. Reset Password Page (`frontend/src/app/reset-password/page.tsx`)
**Features:**
- Token verification on load
- Password confirmation
- Strength validation (min 8 chars)
- Auto-redirect to login after success
- Shows user email

**User Flow:**
1. Click link from email
2. Token verified automatically
3. Enter new password
4. Confirm password
5. Submit and redirect

### 3. Pending Approval Page (`frontend/src/app/pending-approval/page.tsx`)
**Features:**
- Clear status indicators
- Expected timeline (1-2 business days)
- Contact support link
- Back to login link

**When Shown:**
- After successful registration
- When attempting login before approval

### 4. Enhanced Login Page (`frontend/src/app/login/page.tsx`)
**Updated to handle:**
- Pending approval redirect
- 403 + `pending: true` → `/pending-approval`
- Regular errors shown normally
- Forgot password link

---

## Email Templates

### Password Reset Email (`backend/email-templates/password-reset.html`)
**Features:**
- Professional gradient design
- Clear reset button
- Copy-paste link fallback
- Security warning
- Expiration notice (1 hour)

**Variables:**
- `{{firstName}}` - User's name
- `{{resetUrl}}` - Reset link with token
- `{{expiresIn}}` - "1 hour"

---

## API Endpoints

### Password Recovery
```
POST   /api/password/forgot         # Request reset
POST   /api/password/reset          # Reset with token
GET    /api/password/verify-token/:token
```

### Admin Approvals
```
GET    /api/approvals/pending       # List pending users
POST   /api/approvals/approve/:userId
POST   /api/approvals/reject/:userId
POST   /api/approvals/bulk-approve
```

---

## User Registration & Login Flow

### New User Journey

1. **Register** → Account created (`approvedByAdmin = false`)
2. **Redirect** → `/pending-approval` page
3. **Wait** → Admin reviews application
4. **Admin Approves** → User receives email notification
5. **Login** → Access granted to dashboard

### Login Behavior

#### Approved User ✓
```
Login → Dashboard (immediate access)
```

#### Pending User ⏳
```
Login → 403 Response → Redirect to /pending-approval
```

#### Rejected User ✗
```
Login → "Account inactive" error
```

---

## Security Features

### Password Reset
✓ **Secure token generation** - 32-byte random hex  
✓ **SHA-256 hashing** - Token stored hashed in DB  
✓ **1-hour expiration** - Automatic token invalidation  
✓ **Single use** - Token cleared after reset  
✓ **Email enumeration prevention** - Same response for all emails  
✓ **Confirmation emails** - Notify on password change  

### Admin Approval
✓ **Role-based access** - Only admins can approve  
✓ **Activity logging** - All approvals/rejections tracked  
✓ **Audit trail** - WHO approved WHOM and WHEN  
✓ **Email notifications** - Users notified of approval status  
✓ **Bulk operations** - Efficient batch processing  

---

## Testing

### Test Password Reset
```bash
# 1. Request reset
curl -X POST http://localhost:5000/api/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# 2. Check email for token, then reset
curl -X POST http://localhost:5000/api/password/reset \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN","password":"newpassword123"}'
```

### Test Admin Approval
```bash
# 1. Get pending users (as admin)
curl -X GET http://localhost:5000/api/approvals/pending \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# 2. Approve user
curl -X POST http://localhost:5000/api/approvals/approve/USER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"USER"}'
```

### Test Registration Flow
```bash
# 1. Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","username":"newuser","password":"password123"}'

# 2. Try to login (should fail with pending approval)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123"}'

# Expected: 403 with {"error":"...pending approval...","pending":true}
```

---

## Admin Dashboard Integration

### Pending Approvals Widget
```tsx
import { authService } from '@/lib/auth';

async function PendingApprovals() {
  const response = await authService.fetchWithAuth('/api/approvals/pending');
  const { users, pagination } = await response.json();

  return (
    <div>
      <h2>Pending Approvals ({pagination.total})</h2>
      {users.map(user => (
        <div key={user.id}>
          <span>{user.email}</span>
          <button onClick={() => approveUser(user.id)}>Approve</button>
          <button onClick={() => rejectUser(user.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
```

---

## Configuration

### Environment Variables
```bash
# Backend .env
FRONTEND_URL=https://advanciapayledger.com

# Frontend .env.local
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
```

---

## Migration Applied

```sql
-- Migration: 20251225070628_add_approval_password_reset
ALTER TABLE "users" ADD COLUMN "passwordResetToken" TEXT UNIQUE;
ALTER TABLE "users" ADD COLUMN "passwordResetExpires" TIMESTAMP;
ALTER TABLE "users" ADD COLUMN "approvedByAdmin" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN "approvedAt" TIMESTAMP;
ALTER TABLE "users" ADD COLUMN "approvedBy" TEXT;
```

---

## Files Created/Modified

### Backend
- ✅ `backend/src/routes/password.ts` - Password recovery
- ✅ `backend/src/routes/approvals.ts` - Admin approvals
- ✅ `backend/src/routes/auth.ts` - Enhanced login check
- ✅ `backend/src/index.ts` - Route registration
- ✅ `backend/prisma/schema.prisma` - Schema changes
- ✅ `backend/email-templates/password-reset.html` - Email template

### Frontend
- ✅ `frontend/src/app/forgot-password/page.tsx` - Forgot password page
- ✅ `frontend/src/app/reset-password/page.tsx` - Reset password page
- ✅ `frontend/src/app/pending-approval/page.tsx` - Pending approval page
- ✅ `frontend/src/app/login/page.tsx` - Enhanced login handling

---

## Next Steps

### Immediate
1. ✓ Test password reset flow end-to-end
2. ✓ Test admin approval workflow
3. 🔄 Create admin dashboard page for approvals
4. 🔄 Add email verification requirement (optional)
5. 🔄 Create landing page (if doesn't exist)

### Future Enhancements
- [ ] Auto-approval for verified email domains
- [ ] Approval workflow with multiple reviewers
- [ ] Rejection with custom message templates
- [ ] User tier-based auto-approval
- [ ] 2FA requirement before approval
- [ ] Scheduled bulk approvals
- [ ] Approval analytics dashboard

---

## Security Best Practices Implemented

✅ Secure token generation with crypto.randomBytes  
✅ SHA-256 hashing for stored tokens  
✅ Time-based token expiration  
✅ Single-use tokens (cleared after use)  
✅ Email enumeration prevention  
✅ Activity logging for audit trails  
✅ Role-based access control for admin actions  
✅ Password hashing with bcrypt (12 rounds)  
✅ Input validation with Zod  
✅ CORS protection  
✅ Rate limiting ready  

---

## Support

For issues or questions:
- Check [LOGIN-SYSTEM.md](LOGIN-SYSTEM.md) for authentication docs
- Review backend logs at `backend/logs/`
- Check activity logs in database
- Contact: support@advanciapayledger.com

