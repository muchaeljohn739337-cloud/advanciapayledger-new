# User Management System

## ✅ Complete Implementation

### Overview
The user management system implements **strict data access control** where:
- **Users** can only access and modify their own profile data
- **Admins** can manage all users in the system
- All routes enforce authentication and authorization

---

## 🔒 Security Model

### User Self-Management
✅ Users can ONLY access their own data  
✅ All queries filtered by `req.user!.id`  
✅ No cross-user data access possible  
✅ Password verification required for sensitive operations

### Admin Management
✅ Requires `ADMIN` or `SUPER_ADMIN` role  
✅ Can view/modify all user accounts  
✅ Activity logged for audit trail  
✅ Notifications sent to users on admin actions

---

## 📍 API Endpoints

### User Self-Management Routes

#### 1. **GET `/api/user/profile`** - Get Own Profile
```bash
curl -X GET https://api.advanciapayledger.com/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johnsmith",
    "firstName": "John",
    "lastName": "Smith",
    "role": "USER",
    "usdBalance": "1500.00",
    "btcBalance": "0.05",
    "ethBalance": "1.25",
    "usdtBalance": "500.00",
    "trustScore": 85,
    "active": true,
    "blocked": false,
    "approvedByAdmin": true,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

#### 2. **PUT `/api/user/profile`** - Update Own Profile
**Allowed fields:** firstName, lastName, username, profilePicture

```bash
curl -X PUT https://api.advanciapayledger.com/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe2025"
  }'
```

---

#### 3. **PUT `/api/user/password`** - Change Own Password
```bash
curl -X PUT https://api.advanciapayledger.com/api/user/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpass123",
    "newPassword": "newSecurePass456"
  }'
```

**Security:**
- Validates current password before allowing change
- Requires minimum 8 characters
- Bcrypt hashing applied

---

#### 4. **GET `/api/user/balances`** - Get Own Balances
```bash
curl -X GET https://api.advanciapayledger.com/api/user/balances \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "balances": {
    "usdBalance": "1500.00",
    "btcBalance": "0.05",
    "ethBalance": "1.25",
    "usdtBalance": "500.00"
  }
}
```

---

#### 5. **GET `/api/user/permissions`** - Get Own Permissions
```bash
curl -X GET https://api.advanciapayledger.com/api/user/permissions \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "role": "USER",
  "roleLevel": 10,
  "permissions": {
    "VIEW_BALANCE": true,
    "MAKE_PAYMENT": true,
    "WITHDRAW_FUNDS": true,
    "VIEW_TRANSACTIONS": true,
    "CRYPTO_WALLET": true,
    "MANAGE_USERS": false,
    "VIEW_ANALYTICS": false
  }
}
```

---

#### 6. **GET `/api/user/transactions?page=1&type=DEPOSIT&status=COMPLETED`** - Get Own Transactions
```bash
curl -X GET "https://api.advanciapayledger.com/api/user/transactions?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)
- `type` - Filter by type (DEPOSIT, WITHDRAWAL, PAYMENT, etc.)
- `status` - Filter by status (COMPLETED, PENDING, FAILED)

---

#### 7. **GET `/api/user/notifications?unreadOnly=true`** - Get Own Notifications
```bash
curl -X GET "https://api.advanciapayledger.com/api/user/notifications?unreadOnly=true" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "title": "Payment Received",
      "message": "You received $100 USD",
      "type": "SUCCESS",
      "read": false,
      "createdAt": "2025-12-25T10:00:00Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

#### 8. **PUT `/api/user/notifications/:id/read`** - Mark Notification as Read
```bash
curl -X PUT https://api.advanciapayledger.com/api/user/notifications/notif_123/read \
  -H "Authorization: Bearer $TOKEN"
```

**Security:** Can only mark own notifications as read

---

#### 9. **GET `/api/user/activity?page=1`** - Get Own Activity Logs
```bash
curl -X GET "https://api.advanciapayledger.com/api/user/activity?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

#### 10. **GET `/api/user/sessions`** - Get Own Login Sessions
```bash
curl -X GET https://api.advanciapayledger.com/api/user/sessions \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "log_123",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-12-25T09:00:00Z"
    }
  ]
}
```

---

#### 11. **DELETE `/api/user/account`** - Delete Own Account (Soft Delete)
```bash
curl -X DELETE https://api.advanciapayledger.com/api/user/account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "currentPassword123"
  }'
```

**Result:** Account marked as inactive and blocked (soft delete)

---

## 👨‍💼 Admin User Management Routes

### 1. **GET `/api/user/admin/users`** - Get All Users (ADMIN only)
```bash
curl -X GET "https://api.advanciapayledger.com/api/user/admin/users?search=john&role=USER&status=active&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Query Parameters:**
- `search` - Search by email, username, firstName, lastName
- `role` - Filter by role (USER, DOCTOR, ADMIN, etc.)
- `status` - Filter by status (active, blocked, pending)
- `page` - Page number
- `limit` - Results per page (max: 100)

**Response:**
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "username": "johnsmith",
      "firstName": "John",
      "lastName": "Smith",
      "role": "USER",
      "usdBalance": "1500.00",
      "trustScore": 85,
      "active": true,
      "blocked": false,
      "approvedByAdmin": true,
      "createdAt": "2025-01-15T10:00:00Z",
      "lastLogin": "2025-12-25T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### 2. **GET `/api/user/admin/users/:id`** - Get Specific User Details (ADMIN only)
```bash
curl -X GET https://api.advanciapayledger.com/api/user/admin/users/user_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johnsmith",
    "firstName": "John",
    "lastName": "Smith",
    "role": "USER",
    "usdBalance": "1500.00",
    "btcBalance": "0.05",
    "trustScore": 85,
    "invitationTier": 2,
    "active": true,
    "blocked": false,
    "approvedByAdmin": true,
    "emailVerified": true,
    "totpEnabled": false,
    "ethWalletAddress": "0x742d35Cc...",
    "createdAt": "2025-01-15T10:00:00Z",
    "lastLogin": "2025-12-25T09:00:00Z"
  },
  "stats": {
    "transactionCount": 45,
    "notificationCount": 23
  }
}
```

---

### 3. **PUT `/api/user/admin/users/:id`** - Update User (ADMIN only)
```bash
curl -X PUT https://api.advanciapayledger.com/api/user/admin/users/user_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "DOCTOR",
    "trustScore": 95,
    "approvedByAdmin": true,
    "active": true,
    "blocked": false,
    "emailVerified": true
  }'
```

**Allowed Updates:**
- `role` - Change user role
- `active` - Activate/deactivate account
- `blocked` - Block/unblock user
- `approvedByAdmin` - Approve user registration
- `trustScore` - Update trust score
- `emailVerified` - Verify email manually
- `firstName`, `lastName`, `username` - Update profile

---

### 4. **PUT `/api/user/admin/users/:id/block`** - Block/Unblock User (ADMIN only)
```bash
curl -X PUT https://api.advanciapayledger.com/api/user/admin/users/user_123/block \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "blocked": true,
    "reason": "Suspicious activity detected"
  }'
```

**Result:**
- User account blocked/unblocked
- User receives notification with reason
- Real-time Socket.IO notification sent

---

### 5. **PUT `/api/user/admin/users/:id/approve`** - Approve User (ADMIN only)
```bash
curl -X PUT https://api.advanciapayledger.com/api/user/admin/users/user_123/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Result:**
- `approvedByAdmin` set to `true`
- Account activated
- User receives approval notification

---

### 6. **DELETE `/api/user/admin/users/:id`** - Permanently Delete User (SUPER_ADMIN only)
```bash
curl -X DELETE https://api.advanciapayledger.com/api/user/admin/users/user_123 \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"
```

⚠️ **Warning:** This is a hard delete. All user data is permanently removed.

---

### 7. **GET `/api/user/admin/users/:id/transactions`** - Get User Transactions (ADMIN only)
```bash
curl -X GET "https://api.advanciapayledger.com/api/user/admin/users/user_123/transactions?page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 8. **GET `/api/user/admin/users/:id/activity`** - Get User Activity Logs (ADMIN only)
```bash
curl -X GET "https://api.advanciapayledger.com/api/user/admin/users/user_123/activity?page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🔐 Security Features

### User Self-Management Security
✅ **ID-based filtering** - All queries filtered by authenticated user ID  
✅ **No cross-user access** - Users cannot access other users' data  
✅ **Password verification** - Required for sensitive operations  
✅ **Limited field updates** - Users can only update specific profile fields  
✅ **Activity tracking** - All actions logged for audit  

### Admin Management Security
✅ **Role-based access control** - `requireRole('ADMIN')` middleware  
✅ **Activity logging** - All admin actions tracked  
✅ **User notifications** - Users notified of admin actions  
✅ **SUPER_ADMIN gate** - Hard delete requires highest permission  
✅ **Audit trail** - Comprehensive logging of all changes  

---

## 📊 Data Access Matrix

| Action | User (Self) | Admin | Super Admin |
|--------|-------------|-------|-------------|
| View own profile | ✅ | ✅ | ✅ |
| Update own profile | ✅ (limited) | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ |
| View own transactions | ✅ | ✅ | ✅ |
| View own notifications | ✅ | ✅ | ✅ |
| Delete own account | ✅ (soft) | ✅ | ✅ |
| View all users | ❌ | ✅ | ✅ |
| View other user details | ❌ | ✅ | ✅ |
| Update other users | ❌ | ✅ | ✅ |
| Block/Unblock users | ❌ | ✅ | ✅ |
| Approve users | ❌ | ✅ | ✅ |
| Hard delete users | ❌ | ❌ | ✅ |

---

## 🧪 Testing

### Test User Self-Management

**1. Get own profile:**
```bash
curl -X GET https://api.advanciapayledger.com/api/user/profile \
  -H "Authorization: Bearer $USER_TOKEN"
```

**2. Update own profile:**
```bash
curl -X PUT https://api.advanciapayledger.com/api/user/profile \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Updated"}'
```

**3. Change password:**
```bash
curl -X PUT https://api.advanciapayledger.com/api/user/password \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"old123","newPassword":"new456secure"}'
```

### Test Admin Management

**1. Get all users:**
```bash
curl -X GET "https://api.advanciapayledger.com/api/user/admin/users?search=john" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**2. Block a user:**
```bash
curl -X PUT https://api.advanciapayledger.com/api/user/admin/users/user_123/block \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"blocked":true,"reason":"Suspicious activity"}'
```

**3. Approve a user:**
```bash
curl -X PUT https://api.advanciapayledger.com/api/user/admin/users/user_123/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📁 Files

### Backend
- `backend/src/routes/user.ts` - User management routes
- `backend/src/middleware/auth.ts` - Authentication middleware
- `backend/src/middleware/accessControl.ts` - Role-based access control
- `backend/src/services/webhookNotificationService.ts` - Notification service

---

## 🎯 Next Steps

### Priority 1: Frontend Integration
- [ ] User profile page with edit form
- [ ] User settings page (password change, account deletion)
- [ ] User transaction history table
- [ ] User notification center
- [ ] Admin user management dashboard
- [ ] Admin user detail modal/page

### Priority 2: Enhanced Features
- [ ] Email notifications on admin actions
- [ ] Profile picture upload
- [ ] Two-factor authentication (2FA/TOTP)
- [ ] Password reset flow
- [ ] Account recovery
- [ ] User export (GDPR compliance)

### Priority 3: Analytics
- [ ] User activity dashboard
- [ ] User growth charts
- [ ] User engagement metrics
- [ ] Role distribution analytics
- [ ] Trust score distribution

---

## ✅ Summary

**User Self-Management:**
- ✅ 11 endpoints for users to manage their own data
- ✅ Strict ID-based filtering prevents cross-user access
- ✅ Password verification for sensitive operations
- ✅ Comprehensive activity tracking

**Admin Management:**
- ✅ 8 endpoints for admins to manage all users
- ✅ Role-based access control (ADMIN, SUPER_ADMIN)
- ✅ User notifications on admin actions
- ✅ Complete audit trail
- ✅ Search, filter, and pagination support

**Security:**
- ✅ Authentication required on all routes
- ✅ Authorization enforced via middleware
- ✅ Activity logging for compliance
- ✅ Password hashing with bcrypt
- ✅ Soft delete for user accounts (hard delete for SUPER_ADMIN only)
