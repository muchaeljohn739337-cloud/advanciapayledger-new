# Authentication Pages Testing Guide

## Table of Contents
1. [Setup & Prerequisites](#setup--prerequisites)
2. [2FA Setup Wizard Testing](#2fa-setup-wizard-testing)
3. [Forgot Password Testing](#forgot-password-testing)
4. [Reset Password Testing](#reset-password-testing)
5. [Automated Testing](#automated-testing)
6. [Security Testing](#security-testing)
7. [Test Data](#test-data)

---

## Setup & Prerequisites

### Required Tools
- Node.js 18.x or higher
- npm or yarn
- A valid email account for testing
- Google Authenticator or similar TOTP app (Authy, Microsoft Authenticator)
- Browser DevTools (Chrome/Edge recommended)

### Environment Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run setup:db

# 3. Start development servers
npm run dev

# 4. Verify services are running
# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

### Test User Accounts
Create these test users in your database:

```sql
-- User without 2FA enabled
INSERT INTO "User" (id, email, "passwordHash", name, role, "createdAt", "updatedAt")
VALUES ('test-user-1', 'test@example.com', '$2a$10$...', 'Test User', 'USER', NOW(), NOW());

-- User with 2FA enabled
INSERT INTO "User" (id, email, "passwordHash", name, role, "totpSecret", "totpEnabled", "createdAt", "updatedAt")
VALUES ('test-user-2', '2fa@example.com', '$2a$10$...', '2FA User', 'USER', 'JBSWY3DPEHPK3PXP', true, NOW(), NOW());
```

---

## 2FA Setup Wizard Testing

### Page Location
`/auth/setup-2fa`

### Test Cases

#### TC-2FA-001: Access 2FA Setup Page
**Precondition:** User is logged in and 2FA is not enabled

**Steps:**
1. Log in with test@example.com
2. Navigate to `/auth/setup-2fa`
3. Verify page loads with Step 1 visible

**Expected Result:**
- Welcome screen is displayed
- "Enable Two-Factor Authentication" button is visible
- Progress indicators show 1/3

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-002: Generate QR Code
**Precondition:** On 2FA setup page, Step 1

**Steps:**
1. Click "Enable Two-Factor Authentication"
2. Wait for QR code to load
3. Verify QR code is displayed
4. Verify backup codes are shown

**Expected Result:**
- QR code image is displayed
- Setup key is visible (alphanumeric string)
- 8 backup codes are displayed
- Download and Print buttons work
- "Next" button is enabled

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-003: Scan QR Code
**Precondition:** QR code is displayed

**Steps:**
1. Open Google Authenticator app
2. Tap "+" to add account
3. Select "Scan QR code"
4. Scan the displayed QR code
5. Verify account is added with correct email

**Expected Result:**
- Account added successfully
- Email matches logged-in user
- 6-digit code is generated and changes every 30 seconds

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-004: Manual Entry Alternative
**Precondition:** QR code is displayed

**Steps:**
1. Copy the setup key from the page
2. Open Google Authenticator app
3. Tap "+" → "Enter a setup key"
4. Enter:
   - Account: user's email
   - Key: copied setup key
   - Time-based: Yes
5. Add account

**Expected Result:**
- Account added successfully
- 6-digit code matches the one from QR scan method

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-005: Verify TOTP Code - Valid
**Precondition:** Authenticator app is set up

**Steps:**
1. Click "Next" to go to Step 3 (Verify)
2. Get current 6-digit code from authenticator app
3. Enter the code
4. Click "Verify and Enable"

**Expected Result:**
- Code is accepted
- Success message: "2FA enabled successfully!"
- Redirected to dashboard or profile
- 2FA badge/indicator shows enabled

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-006: Verify TOTP Code - Invalid
**Precondition:** On verification step

**Steps:**
1. Enter incorrect code: "000000"
2. Click "Verify and Enable"
3. Observe error message

**Expected Result:**
- Error message: "Invalid verification code. Please try again."
- User remains on verification step
- Can retry with correct code

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-007: Verify TOTP Code - Expired
**Precondition:** On verification step

**Steps:**
1. Get code from authenticator
2. Wait 30+ seconds for code to expire
3. Enter the expired code
4. Click "Verify and Enable"

**Expected Result:**
- Error message about invalid/expired code
- New code is accepted

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-008: Download Backup Codes
**Precondition:** Backup codes are displayed

**Steps:**
1. Click "Download Backup Codes" button
2. Check Downloads folder

**Expected Result:**
- File downloaded: `2fa-backup-codes-[timestamp].txt`
- File contains all 8 backup codes
- File includes user email and generation date

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-009: Print Backup Codes
**Precondition:** Backup codes are displayed

**Steps:**
1. Click "Print Backup Codes" button
2. Verify print dialog opens

**Expected Result:**
- Print dialog displays
- Print preview shows formatted backup codes
- Includes user email and date

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-010: Navigation - Back Button
**Precondition:** On Step 2 or 3

**Steps:**
1. Click "Back" button
2. Verify previous step is shown
3. Navigate forward again
4. Verify data is preserved

**Expected Result:**
- Can navigate between steps
- QR code and backup codes are preserved
- No need to regenerate

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-011: Cancel Setup
**Precondition:** On any step

**Steps:**
1. Click "Cancel" or close page
2. Navigate back to `/auth/setup-2fa`

**Expected Result:**
- Setup is not completed
- 2FA remains disabled
- Starting fresh shows new QR code

**Status:** [ ] Pass [ ] Fail

---

#### TC-2FA-012: Already Enabled Check
**Precondition:** 2FA is already enabled for user

**Steps:**
1. Navigate to `/auth/setup-2fa`

**Expected Result:**
- Redirected to dashboard or settings
- OR: Shows "2FA is already enabled" message
- Cannot re-enable without disabling first

**Status:** [ ] Pass [ ] Fail

---

## Forgot Password Testing

### Page Location
`/auth/forgot-password`

### Test Cases

#### TC-FORGOT-001: Access Page
**Precondition:** User is logged out

**Steps:**
1. Navigate to `/auth/login`
2. Click "Forgot password?" link
3. Verify forgot password page loads

**Expected Result:**
- Page URL: `/auth/forgot-password`
- Email input field is visible
- "Send Reset Link" button present
- Link back to login page present

**Status:** [ ] Pass [ ] Fail

---

#### TC-FORGOT-002: Valid Email Submission
**Precondition:** On forgot password page

**Steps:**
1. Enter valid registered email: test@example.com
2. Click "Send Reset Link"
3. Check email inbox

**Expected Result:**
- Success message: "If an account exists with that email..."
- Email received with reset link
- Email contains:
  - Reset link valid for 1 hour
  - User's name
  - Security warning
  - Link format: `/auth/reset-password?token=...`

**Status:** [ ] Pass [ ] Fail

---

#### TC-FORGOT-003: Unregistered Email
**Precondition:** On forgot password page

**Steps:**
1. Enter unregistered email: nonexistent@example.com
2. Click "Send Reset Link"

**Expected Result:**
- Same success message (security measure)
- No email sent
- No indication whether email exists

**Status:** [ ] Pass [ ] Fail

---

#### TC-FORGOT-004: Invalid Email Format
**Precondition:** On forgot password page

**Steps:**
1. Enter invalid email: "notanemail"
2. Click "Send Reset Link"

**Expected Result:**
- Error message: "Please enter a valid email address"
- Form not submitted
- Email field highlighted

**Status:** [ ] Pass [ ] Fail

---

#### TC-FORGOT-005: Empty Email
**Precondition:** On forgot password page

**Steps:**
1. Leave email field empty
2. Click "Send Reset Link"

**Expected Result:**
- Error message: "Email is required"
- Form not submitted

**Status:** [ ] Pass [ ] Fail

---

#### TC-FORGOT-006: Rate Limiting
**Precondition:** On forgot password page

**Steps:**
1. Submit email
2. Immediately submit again
3. Repeat 3 more times

**Expected Result:**
- After 3-5 attempts: Rate limit message
- "Too many requests. Please try again in X minutes"
- Subsequent requests blocked temporarily

**Status:** [ ] Pass [ ] Fail

---

#### TC-FORGOT-007: Email Content Verification
**Precondition:** Reset email received

**Steps:**
1. Open reset password email
2. Verify all content elements

**Expected Result:**
Email contains:
- [ ] Personalized greeting with user's name
- [ ] Clear reset password link
- [ ] Expiration time (1 hour)
- [ ] Security warning about not sharing link
- [ ] "If you didn't request this" message
- [ ] Company/app branding
- [ ] Support contact info

**Status:** [ ] Pass [ ] Fail

---

## Reset Password Testing

### Page Location
`/auth/reset-password?token=...`

### Test Cases

#### TC-RESET-001: Valid Token Access
**Precondition:** Valid reset token from email

**Steps:**
1. Click reset link from email
2. Verify reset password page loads

**Expected Result:**
- Page loads successfully
- Form shows:
  - New password field
  - Confirm password field
  - Password requirements list
  - "Reset Password" button

**Status:** [ ] Pass [ ] Fail

---

#### TC-RESET-002: Invalid Token
**Precondition:** None

**Steps:**
1. Navigate to `/auth/reset-password?token=invalid123`
2. Observe page behavior

**Expected Result:**
- Error message: "Invalid or expired reset token"
- Link to request new reset email
- Cannot submit form

**Status:** [ ] Pass [ ] Fail

---

#### TC-RESET-003: Expired Token
**Precondition:** Reset token older than 1 hour

**Steps:**
1. Use expired reset link
2. Attempt to load page

**Expected Result:**
- Error message: "This reset link has expired"
- Button to request new link
- Redirects to forgot password page

**Status:** [ ] Pass [ ] Fail

---

#### TC-RESET-004: Valid Password Reset
**Precondition:** Valid token, on reset page

**Steps:**
1. Enter new password: "NewSecure123!"
2. Confirm password: "NewSecure123!"
3. Click "Reset Password"
4. Wait for confirmation

**Expected Result:**
- Success message: "Password reset successfully"
- Redirected to login page
- Can log in with new password
- Old password no longer works

**Status:** [ ] Pass [ ] Fail

---

#### TC-RESET-005: Password Mismatch
**Precondition:** On reset password page

**Steps:**
1. New password: "Password123!"
2. Confirm: "Password456!"
3. Click "Reset Password"

**Expected Result:**
- Error: "Passwords do not match"
- Form not submitted
- Can correct and retry

**Status:** [ ] Pass [ ] Fail

---

#### TC-RESET-006: Weak Password
**Precondition:** On reset password page

**Steps:**
1. Try each weak password:
   - "12345678"
   - "password"
   - "abcdefgh"
2. Observe validation

**Expected Result:**
- Error messages for each:
  - "Password must contain uppercase letter"
  - "Password must contain number"
  - "Password must contain special character"
- Requirements list updates dynamically

**Status:** [ ] Pass [ ] Fail

---

#### TC-RESET-007: Password Requirements Display
**Precondition:** On reset password page

**Steps:**
1. Observe password requirements list
2. Start typing password
3. Watch requirements update

**Expected Result:**
Requirements shown:
- [ ] Minimum 8 characters
- [ ] At least one uppercase letter
- [ ] At least one lowercase letter
- [ ] At least one number
- [ ] At least one special character

Each requirement:
- [ ] Shows ✗ when not met (red)
- [ ] Shows ✓ when met (green)
- [ ] Updates in real-time

**Status:** [ ] Pass [ ] Fail

---

#### TC-RESET-008: Token Reuse Prevention
**Precondition:** Token used once successfully

**Steps:**
1. Complete password reset with token
2. Try to use same token again
3. Navigate to same reset link

**Expected Result:**
- Error: "This reset link has already been used"
- Cannot reset password again with same token
- Must request new reset email

**Status:** [ ] Pass [ ] Fail

---

#### TC-RESET-009: Same Password Prevention
**Precondition:** On reset password page

**Steps:**
1. Enter current password as new password
2. Confirm password
3. Submit form

**Expected Result:**
- Optional: Warning "New password must be different"
- OR: Accepts but logs security event
- Depends on security policy

**Status:** [ ] Pass [ ] Fail

---

## Automated Testing

### Unit Tests

Create test file: `frontend/src/app/(auth)/setup-2fa/__tests__/page.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Setup2FAPage from '../page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react');
jest.mock('next/navigation');

describe('2FA Setup Wizard', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated',
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders Step 1 welcome screen', () => {
    render(<Setup2FAPage />);
    expect(screen.getByText(/Enable Two-Factor Authentication/i)).toBeInTheDocument();
  });

  it('generates QR code on step 2', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          qrCode: 'data:image/png;base64,...',
          secret: 'JBSWY3DPEHPK3PXP',
          backupCodes: ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5', 'CODE6', 'CODE7', 'CODE8'],
        }),
      })
    ) as jest.Mock;

    render(<Setup2FAPage />);
    fireEvent.click(screen.getByText(/Enable Two-Factor Authentication/i));

    await waitFor(() => {
      expect(screen.getByAltText(/QR Code/i)).toBeInTheDocument();
    });
  });

  it('validates TOTP code on step 3', async () => {
    // Test implementation
  });

  it('shows error for invalid TOTP code', async () => {
    // Test implementation
  });

  it('downloads backup codes', async () => {
    // Test implementation
  });
});
```

### Integration Tests

Create test file: `backend/src/__tests__/auth.integration.test.ts`

```typescript
import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import * as speakeasy from 'speakeasy';

const prisma = new PrismaClient();

describe('Authentication Flow', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'integration@test.com',
        passwordHash: await bcrypt.hash('Test123!', 10),
        name: 'Integration Test',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  describe('2FA Setup', () => {
    it('generates TOTP secret and QR code', async () => {
      const response = await request(app)
        .post('/api/auth/totp/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('qrCode');
      expect(response.body).toHaveProperty('secret');
      expect(response.body.backupCodes).toHaveLength(8);
    });

    it('verifies valid TOTP code', async () => {
      const secret = speakeasy.generateSecret();
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
      });

      await prisma.user.update({
        where: { id: testUser.id },
        data: { totpSecret: secret.base32 },
      });

      const response = await request(app)
        .post('/api/auth/totp/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: token })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('rejects invalid TOTP code', async () => {
      const response = await request(app)
        .post('/api/auth/totp/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: '000000' })
        .expect(400);

      expect(response.body.error).toBeTruthy();
    });
  });

  describe('Password Reset', () => {
    it('sends reset email for valid user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.message).toContain('If an account exists');
    });

    it('creates valid reset token', async () => {
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user?.resetToken).toBeTruthy();
      expect(user?.resetTokenExpiry).toBeTruthy();
    });

    it('resets password with valid token', async () => {
      const resetToken = 'valid-token-123';
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 3600000),
        },
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('rejects expired reset token', async () => {
      const expiredToken = 'expired-token-123';
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          resetToken: expiredToken,
          resetTokenExpiry: new Date(Date.now() - 3600000), // 1 hour ago
        },
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          password: 'NewPassword123!',
        })
        .expect(400);

      expect(response.body.error).toContain('expired');
    });
  });
});
```

### E2E Tests (Playwright)

Create test file: `e2e/auth-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('2FA Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('complete 2FA setup wizard', async ({ page }) => {
    await page.goto('/auth/setup-2fa');

    // Step 1: Welcome
    await expect(page.locator('h2')).toContainText('Enable Two-Factor');
    await page.click('text=Enable Two-Factor Authentication');

    // Step 2: QR Code
    await expect(page.locator('img[alt*="QR"]')).toBeVisible();
    const secret = await page.locator('text=/Setup Key:/i').textContent();
    expect(secret).toBeTruthy();

    // Verify backup codes
    const backupCodes = page.locator('[data-testid="backup-code"]');
    await expect(backupCodes).toHaveCount(8);

    await page.click('text=Next');

    // Step 3: Verify (using test TOTP)
    await page.fill('[name="code"]', '123456'); // Mock code
    await page.click('text=Verify and Enable');

    // Should redirect on success
    await page.waitForURL('/dashboard');
  });

  test('download backup codes', async ({ page }) => {
    await page.goto('/auth/setup-2fa');
    await page.click('text=Enable Two-Factor Authentication');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Download Backup Codes'),
    ]);

    expect(download.suggestedFilename()).toMatch(/2fa-backup-codes.*\.txt/);
  });
});

test.describe('Forgot Password Flow', () => {
  test('sends reset email', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/If an account exists/i')).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/valid email/i')).toBeVisible();
  });
});

test.describe('Reset Password Flow', () => {
  test('resets password with valid token', async ({ page }) => {
    const validToken = 'test-reset-token-123';
    await page.goto(`/auth/reset-password?token=${validToken}`);

    await page.fill('[name="password"]', 'NewPassword123!');
    await page.fill('[name="confirmPassword"]', 'NewPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/reset successfully/i')).toBeVisible();
    await page.waitForURL('/auth/login');
  });

  test('shows error for password mismatch', async ({ page }) => {
    const validToken = 'test-reset-token-123';
    await page.goto(`/auth/reset-password?token=${validToken}`);

    await page.fill('[name="password"]', 'Password123!');
    await page.fill('[name="confirmPassword"]', 'Different123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/do not match/i')).toBeVisible();
  });

  test('validates password requirements in real-time', async ({ page }) => {
    const validToken = 'test-reset-token-123';
    await page.goto(`/auth/reset-password?token=${validToken}`);

    const passwordInput = page.locator('[name="password"]');
    
    // Type weak password
    await passwordInput.fill('weak');
    
    // Check requirement indicators
    await expect(page.locator('text=/8 characters/i')).toHaveClass(/text-red/);
    await expect(page.locator('text=/uppercase/i')).toHaveClass(/text-red/);
    
    // Type strong password
    await passwordInput.fill('StrongPass123!');
    
    await expect(page.locator('text=/8 characters/i')).toHaveClass(/text-green/);
    await expect(page.locator('text=/uppercase/i')).toHaveClass(/text-green/);
  });
});
```

### Running Tests

```bash
# Unit tests
npm run test

# Frontend tests only
cd frontend && npm test

# Backend tests only
cd backend && npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

---

## Security Testing

### Test Cases

#### SEC-001: SQL Injection Prevention
**Test:** Attempt SQL injection in email fields
```
Input: test@example.com' OR '1'='1
Expected: Sanitized/rejected, no database breach
```

#### SEC-002: XSS Prevention
**Test:** Inject script tags
```
Input: <script>alert('XSS')</script>@test.com
Expected: Sanitized output, script not executed
```

#### SEC-003: CSRF Token Validation
**Test:** Submit form without CSRF token
```
Expected: Request rejected with 403 Forbidden
```

#### SEC-004: Rate Limiting
**Test:** Rapid fire 100 requests to forgot-password
```
Expected: Rate limit after 5 requests, temporary block
```

#### SEC-005: Token Entropy
**Test:** Generate 1000 reset tokens
```
Expected: All unique, high entropy, unpredictable
```

#### SEC-006: HTTPS Enforcement
**Test:** Access via HTTP
```
Expected: Redirect to HTTPS automatically
```

#### SEC-007: Session Security
**Test:** Copy session token to different browser
```
Expected: Additional validation (IP, user agent) or rejection
```

#### SEC-008: TOTP Secret Storage
**Test:** Check database for plaintext secrets
```
Expected: Secrets encrypted at rest
```

---

## Test Data

### Valid Test Emails
```
test@example.com
user+test@domain.co.uk
first.last@company.com
```

### Invalid Test Emails
```
notanemail
@domain.com
user@
user @domain.com
```

### Valid Test Passwords
```
SecurePass123!
MyP@ssw0rd2024
Complex$Password99
```

### Invalid Test Passwords
```
12345678          (no letters/special chars)
password          (no numbers/uppercase/special)
Pass1!            (too short)
UPPERCASE123!     (no lowercase)
lowercase123!     (no uppercase)
```

### Test TOTP Codes
For testing, use known test secret: `JBSWY3DPEHPK3PXP`

Generate codes with:
```javascript
const speakeasy = require('speakeasy');
const token = speakeasy.totp({
  secret: 'JBSWY3DPEHPK3PXP',
  encoding: 'base32'
});
console.log(token); // Use this code
```

---

## Checklist: Final Testing

Before deploying to production, verify:

### 2FA Setup
- [ ] QR code generates correctly
- [ ] QR code works with Google Authenticator
- [ ] QR code works with Microsoft Authenticator
- [ ] QR code works with Authy
- [ ] Manual setup key works
- [ ] Backup codes are unique and valid
- [ ] Backup codes download correctly
- [ ] Backup codes print correctly
- [ ] Valid TOTP codes are accepted
- [ ] Invalid codes are rejected
- [ ] Expired codes are rejected
- [ ] Navigation works between steps
- [ ] Cancel/back buttons work
- [ ] Already enabled check works
- [ ] Mobile responsive design works

### Forgot Password
- [ ] Email validation works
- [ ] Registered email receives email
- [ ] Unregistered email shows safe message
- [ ] Email template renders correctly
- [ ] Reset link format is correct
- [ ] Rate limiting works
- [ ] Multiple requests handled correctly
- [ ] Email delivery time < 1 minute

### Reset Password
- [ ] Valid token loads page
- [ ] Invalid token shows error
- [ ] Expired token shows error
- [ ] Password requirements display
- [ ] Real-time validation works
- [ ] Password mismatch caught
- [ ] Weak passwords rejected
- [ ] Strong password accepted
- [ ] Token can't be reused
- [ ] Success redirects to login
- [ ] New password works for login
- [ ] Old password stops working

### Security
- [ ] HTTPS enforced
- [ ] CSRF protection active
- [ ] Rate limiting configured
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] Secrets encrypted at rest
- [ ] Tokens have expiration
- [ ] Session management secure
- [ ] Audit logging enabled

### Performance
- [ ] QR code generates in < 2 seconds
- [ ] Email sends in < 30 seconds
- [ ] Page loads in < 1 second
- [ ] Form submissions < 500ms
- [ ] No memory leaks
- [ ] Database queries optimized

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Error messages readable

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Troubleshooting

### Common Issues

**Issue: QR code not displaying**
- Check network tab for API errors
- Verify backend is running on port 3001
- Check CORS configuration
- Verify user is authenticated

**Issue: TOTP codes always invalid**
- Verify time synchronization on server
- Check secret encoding (base32)
- Ensure 30-second time window
- Test with known secret

**Issue: Reset emails not received**
- Check spam folder
- Verify email service configuration
- Check server logs for errors
- Test email service connection

**Issue: Reset token always invalid**
- Check token expiration time
- Verify token format in URL
- Check database for token
- Ensure no URL encoding issues

---

## Success Criteria

All authentication pages are considered production-ready when:

1. ✅ All test cases pass (100%)
2. ✅ Security tests pass with no vulnerabilities
3. ✅ Code coverage > 80%
4. ✅ E2E tests pass on all browsers
5. ✅ Performance metrics meet targets
6. ✅ Accessibility audit passes
7. ✅ Manual testing completed by QA
8. ✅ Security audit approved
9. ✅ Penetration testing completed
10. ✅ Stakeholder approval received

---

## Next Steps After Testing

1. **Deploy to Staging**
   - Run full test suite
   - Perform smoke tests
   - Check monitoring/logging

2. **User Acceptance Testing (UAT)**
   - Select test users
   - Provide testing guide
   - Collect feedback

3. **Production Deployment**
   - Deploy during low-traffic window
   - Monitor error rates
   - Have rollback plan ready

4. **Post-Deployment**
   - Monitor analytics
   - Track user adoption
   - Gather user feedback
   - Iterate on improvements

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Author:** Development Team  
**Status:** Complete
