# User Login & Feature Access System

## ✅ Implementation Complete

### Backend Features

#### 1. Access Control Middleware (`backend/src/middleware/accessControl.ts`)
- **Role-based access control** with hierarchy:
  - SUPER_ADMIN (100)
  - ADMIN (80)
  - DOCTOR (60)
  - MODERATOR (50)
  - USER (10)
  - GUEST (0)

- **Feature-based permissions** for:
  - Financial: VIEW_BALANCE, MAKE_PAYMENT, WITHDRAW_FUNDS, VIEW_TRANSACTIONS
  - Crypto: CRYPTO_WALLET, CRYPTO_WITHDRAW
  - Admin: VIEW_USERS, MANAGE_USERS, BLOCK_USERS, DELETE_USERS, VIEW_ANALYTICS
  - Doctor: VERIFY_DOCTOR, MANAGE_MEDBEDS, VIEW_BOOKINGS
  - Content: CREATE_BLOG, EDIT_BLOG, DELETE_BLOG, MODERATE_COMMENTS
  - System: VIEW_LOGS, MANAGE_SETTINGS, BACKUP_DATABASE

#### 2. User Routes (`backend/src/routes/user.ts`)
- `GET /api/user/profile` - Get current user profile with balances
- `PUT /api/user/profile` - Update user profile (firstName, lastName, username)
- `GET /api/user/permissions` - Get user role and feature permissions
- `GET /api/user/activity` - Get user activity logs (paginated)
- `GET /api/user/sessions` - Get recent login sessions

#### 3. Enhanced Auth Routes (`backend/src/routes/auth.ts`)
- **Activity tracking** on every login
- Logs IP address, user agent, timestamp
- Stored in `activity_logs` table

### Frontend Features

#### 1. Login Page (`frontend/src/app/login/page.tsx`)
- Modern, responsive design with Tailwind CSS
- "Remember Me" functionality (localStorage vs sessionStorage)
- Role-based redirect after login:
  - SUPER_ADMIN/ADMIN → `/admin/dashboard`
  - DOCTOR → `/doctor/dashboard`
  - USER → `/dashboard`
- Error handling with user-friendly messages
- Google OAuth placeholder (ready to integrate)

#### 2. Auth Service (`frontend/src/lib/auth.ts`)
- `getToken()` - Retrieve auth token
- `getUser()` - Get current user data
- `isAuthenticated()` - Check auth status
- `logout()` - Clear session and redirect
- `fetchWithAuth()` - Authenticated API calls with auto-logout on 401
- `getProfile()` - Fetch user profile
- `getPermissions()` - Fetch user permissions
- `hasFeature()` - Check feature access
- `hasRole()` - Check role hierarchy

#### 3. Protected Route Component (`frontend/src/components/ProtectedRoute.tsx`)
- Wraps pages/components requiring authentication
- Supports role-based access (`requiredRole`)
- Supports feature-based access (`requiredFeature`)
- Loading state with spinner
- Auto-redirect to `/login` or `/unauthorized`

## Usage Examples

### Backend: Protect Routes with Middleware

\`\`\`typescript
import { authenticate } from '../middleware/auth';
import { requireRole, requireFeature, trackActivity } from '../middleware/accessControl';

// Basic authentication
router.get('/profile', authenticate, async (req, res) => {
  // req.user is available
});

// Require minimum role level
router.delete('/users/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  // Only ADMIN and SUPER_ADMIN can access
});

// Require specific feature
router.post('/withdraw', authenticate, requireFeature('WITHDRAW_FUNDS'), async (req, res) => {
  // Only users with WITHDRAW_FUNDS permission
});

// Track activity
router.get('/transactions', authenticate, trackActivity('VIEW_TRANSACTIONS'), async (req, res) => {
  // Activity logged to database
});
\`\`\`

### Frontend: Use Protected Routes

\`\`\`tsx
// Simple authentication
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected dashboard content</div>
    </ProtectedRoute>
  );
}

// Require admin role
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}

// Require specific feature
export default function WithdrawPage() {
  return (
    <ProtectedRoute requiredFeature="WITHDRAW_FUNDS">
      <div>Withdrawal form</div>
    </ProtectedRoute>
  );
}
\`\`\`

### Frontend: Use Auth Service

\`\`\`typescript
import { authService } from '@/lib/auth';

// Check if authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = authService.getUser();
console.log(user.email, user.role);

// Make authenticated API call
const response = await authService.fetchWithAuth('/api/transactions');
const data = await response.json();

// Check permissions
const { permissions } = await authService.getPermissions();
if (authService.hasFeature('WITHDRAW_FUNDS', permissions)) {
  // Show withdrawal button
}

// Logout
authService.logout();
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT + user data)

### User Management
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/permissions` - Get permissions
- `GET /api/user/activity?page=1&limit=20` - Get activity logs
- `GET /api/user/sessions` - Get login sessions

## Database Schema

### activity_logs Table
\`\`\`prisma
model activity_logs {
  id        String   @id
  userId    String?
  action    String
  ipAddress String
  userAgent String
  metadata  Json?
  createdAt DateTime @default(now())
}
\`\`\`

## Environment Variables

### Backend (.env)
\`\`\`bash
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-session-secret
FRONTEND_URL=https://advanciapayledger.com
BACKEND_URL=https://api.advanciapayledger.com
\`\`\`

### Frontend (.env.local)
\`\`\`bash
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
\`\`\`

## Security Features

✅ JWT token-based authentication  
✅ Role-based access control (RBAC)  
✅ Feature-based permissions  
✅ Activity logging for auditing  
✅ IP address tracking  
✅ User agent tracking  
✅ Auto-logout on token expiration  
✅ Session management (remember me)  
✅ Protected routes with auto-redirect  
✅ CORS configuration  
✅ Input validation with Zod  
✅ Password hashing with bcrypt  

## Testing

### Test Login
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
\`\`\`

### Test Protected Route
\`\`\`bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

### Test Permissions
\`\`\`bash
curl -X GET http://localhost:5000/api/user/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

## Next Steps

1. ✅ **DNS Configured** - api.advanciapayledger.com → Railway
2. ✅ **Login System** - Complete with activity tracking
3. ✅ **Access Control** - Role & feature-based permissions
4. 🔄 **Test End-to-End** - Register → Login → Dashboard
5. 🔄 **Add 2FA/TOTP** - Extra security layer
6. 🔄 **Add Google OAuth** - Social login
7. 🔄 **Add Password Reset** - Email-based recovery

## Files Created

### Backend
- `backend/src/middleware/accessControl.ts` - Access control middleware
- `backend/src/routes/user.ts` - User profile & permissions routes
- Enhanced `backend/src/routes/auth.ts` - Added activity tracking

### Frontend
- `frontend/src/app/login/page.tsx` - Login page
- `frontend/src/lib/auth.ts` - Auth service utility
- `frontend/src/components/ProtectedRoute.tsx` - Protected route wrapper

