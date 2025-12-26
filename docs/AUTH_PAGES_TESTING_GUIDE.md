# Authentication Pages Testing Guide

## Overview
This document provides comprehensive testing instructions for the authentication flow pages:
- PAGE 4/6: 2FA Setup Wizard
- PAGE 5/6: Forgot Password
- PAGE 6/6: Reset Password

---

## Prerequisites

### Backend Setup
1. Ensure the backend server is running:
\\\ash
cd backend
npm run dev
\\\

2. Verify these endpoints are available:
   - \POST /api/totp/setup\ - Initialize 2FA setup
   - \POST /api/totp/verify\ - Verify 2FA code
   - \POST /api/password/forgot\ - Request password reset
   - \POST /api/password/reset\ - Reset password with token
   - \GET /api/password/verify-token/:token\ - Verify reset token

### Frontend Setup
1. Start the frontend development server:
\\\ash
cd frontend
npm run dev
\\\

2. Access the application at: \http://localhost:3000\

### Required Tools
- **Authenticator App**: Download one of these on your smartphone:
  - Google Authenticator (iOS/Android)
  - Microsoft Authenticator (iOS/Android)
  - Authy (iOS/Android/Desktop)
  - 1Password (iOS/Android/Desktop)

- **Email Testing**: Configure one of:
  - Mailtrap (recommended for development)
  - Gmail SMTP with app password
  - SendGrid/Resend API

### Environment Variables
Ensure these are set in \rontend/.env.local\:
\\\nv
NEXT_PUBLIC_API_URL=http://localhost:5000
\\\

Backend \ackend/.env\:
\\\nv
EMAIL_FROM=noreply@advancia-pay.com
EMAIL_SERVICE=mailtrap  # or 'resend', 'gmail'
MAILTRAP_TOKEN=your_token_here
# OR for Gmail:
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
\\\

---

## PAGE 4: 2FA Setup Wizard Testing

### Test Case 1: Complete 2FA Setup Flow (Happy Path)

**Steps:**
1. Login to the application with valid credentials
2. Navigate to \/settings/2fa-setup\
3. **Step 1 - Introduction**:
   - Verify the introduction page displays
   - Check that "Why Enable 2FA?" content is visible
   - Verify "What you'll need" checklist appears
   - Click "Get Started" button

4. **Step 2 - QR Code Display**:
   - Verify QR code image loads and displays
   - Verify manual entry key is shown below QR code
   - Click the copy button and verify "Copied to clipboard" message
   - Open your authenticator app and scan the QR code
   - Verify the account appears in your app as "Advancia Pay (your_email)"
   - Click "I've Scanned the Code"

5. **Step 3 - Verify Code**:
   - Open authenticator app and view the 6-digit code
   - Enter the code in the verification field
   - Verify the code auto-formats (digits only, max 6 characters)
   - Click "Verify & Enable 2FA"
   - Wait for successful verification

6. **Step 4 - Backup Codes**:
   - Verify 10 backup codes are displayed (format: XXXX-XXXX)
   - Click "Download Backup Codes" button
   - Verify a .txt file downloads with all backup codes
   - Check the "I have saved my backup codes" checkbox
   - Click "Complete Setup"
   - Verify redirect to dashboard

**Expected Results:**
- ✓ All steps progress smoothly
- ✓ QR code scans successfully
- ✓ Verification code validates correctly
- ✓ Backup codes download properly
- ✓ 2FA is enabled on the user account
- ✓ Audit log entry created for "TOTP_ENABLED"

**Success Criteria:**
- User can complete entire wizard without errors
- 2FA is active and required on next login
- Backup codes are generated and downloadable

---

### Test Case 2: Invalid Verification Code

**Steps:**
1. Complete steps 1-2 from Test Case 1
2. At Step 3, enter an incorrect 6-digit code (e.g., "000000")
3. Click "Verify & Enable 2FA"

**Expected Results:**
- ✓ Error message displays: "Invalid TOTP code"
- ✓ User remains on Step 3
- ✓ Can retry with a new code
- ✓ Audit log entry created for "TOTP_FAILED"

---

### Test Case 3: Expired Verification Code

**Steps:**
1. Complete steps 1-2 from Test Case 1
2. Wait for the code in authenticator app to refresh (30 seconds)
3. Use the OLD code that just expired
4. Click "Verify & Enable 2FA"

**Expected Results:**
- ✓ Error message displays: "Invalid TOTP code" or "Code may have expired"
- ✓ User can enter the new current code and succeed

---

### Test Case 4: 2FA Already Enabled

**Steps:**
1. Login with an account that already has 2FA enabled
2. Navigate to \/settings/2fa-setup\
3. Click "Get Started"

**Expected Results:**
- ✓ Error message: "TOTP already enabled"
- ✓ Message: "Disable TOTP first before setting up again"
- ✓ User cannot proceed with setup

---

### Test Case 5: Unauthenticated Access

**Steps:**
1. Logout of the application
2. Directly navigate to \/settings/2fa-setup\

**Expected Results:**
- ✓ Automatic redirect to \/login\
- ✓ Cannot access 2FA setup without authentication

---

### Test Case 6: Manual Entry (No QR Scanner)

**Steps:**
1. Complete Step 1
2. At Step 2, instead of scanning QR code:
   - Click the copy button next to manual entry key
   - Open authenticator app
   - Choose "Enter a setup key" or "Manual entry"
   - Paste the key
   - Set account name: "Advancia Pay"
3. Continue with verification

**Expected Results:**
- ✓ Manual entry works as alternative to QR code
- ✓ Codes generate correctly
- ✓ Verification succeeds

---

### Test Case 7: Back Navigation

**Steps:**
1. Progress to Step 3 (Verify Code)
2. Click "← Back to QR Code"
3. Verify you return to Step 2
4. QR code should still be displayed (same secret)

**Expected Results:**
- ✓ Can navigate backwards
- ✓ QR code persists (same secret)
- ✓ Can progress forward again

---

### Test Case 8: Progress Indicator

**Steps:**
1. Observe the progress bar at each step

**Expected Results:**
- ✓ Step 1: First circle highlighted
- ✓ Step 2: First two circles highlighted, progress line filled
- ✓ Step 3: First three circles highlighted
- ✓ Step 4: All four circles highlighted

---

## PAGE 5: Forgot Password Testing

### Test Case 9: Valid Email - Password Reset Request

**Steps:**
1. Navigate to \/login\
2. Click "Forgot Password?" link
3. Verify redirect to \/forgot-password\
4. Enter a valid registered email address
5. Click "Send Reset Link"

**Expected Results:**
- ✓ Success message: "Password reset email sent"
- ✓ Email received with reset link
- ✓ Link format: \http://localhost:3000/reset-password?token=...\
- ✓ Reset token stored in database with expiration (15 minutes)

**Verification:**
Check your email inbox for:
- Subject: "Password Reset Request" or similar
- Reset link button/URL
- Expiration notice (link valid for 15 minutes)

---

### Test Case 10: Non-Existent Email

**Steps:**
1. Navigate to \/forgot-password\
2. Enter an email that doesn't exist: \
onexistent@example.com\
3. Click "Send Reset Link"

**Expected Results:**
- ✓ Success message still shown (security best practice - don't reveal if email exists)
- ✓ No email sent
- ✓ No error revealing email doesn't exist

---

### Test Case 11: Multiple Reset Requests

**Steps:**
1. Request password reset for same email 3 times
2. Check email inbox

**Expected Results:**
- ✓ Each request generates a new token
- ✓ Previous tokens are invalidated
- ✓ Only the most recent link works
- ✓ Rate limiting may apply (check backend)

---

### Test Case 12: Empty Email Validation

**Steps:**
1. Navigate to \/forgot-password\
2. Leave email field empty
3. Try to submit

**Expected Results:**
- ✓ HTML5 validation triggers: "Please fill out this field"
- ✓ Form doesn't submit

---

### Test Case 13: Back to Login

**Steps:**
1. On forgot password page
2. Click "Back to Login"

**Expected Results:**
- ✓ Navigates to \/login\

---

## PAGE 6: Reset Password Testing

### Test Case 14: Valid Token - Successful Reset (Happy Path)

**Steps:**
1. Request password reset from forgot password page
2. Check email and click reset link
3. Verify redirect to \/reset-password?token=...\
4. Wait for token verification (loading spinner)
5. Enter new password: \NewPassword123!\
6. Confirm password: \NewPassword123!\
7. Click "Reset Password"

**Expected Results:**
- ✓ Token verification succeeds
- ✓ Email address displays on page
- ✓ Password reset succeeds
- ✓ Success message: "Password reset successfully"
- ✓ Automatic redirect to \/login\ after 3 seconds
- ✓ Can login with new password

---

### Test Case 15: Password Mismatch

**Steps:**
1. Navigate to valid reset password page (with token)
2. Enter new password: \Password123!\
3. Enter confirm password: \DifferentPassword123!\
4. Click "Reset Password"

**Expected Results:**
- ✓ Error message: "Passwords do not match"
- ✓ Form doesn't submit
- ✓ User remains on page

---

### Test Case 16: Weak Password Validation

**Steps:**
1. Navigate to valid reset password page
2. Enter password: \weak\ (less than 8 characters)
3. Confirm password: \weak\
4. Click "Reset Password"

**Expected Results:**
- ✓ Error message: "Password must be at least 8 characters"
- ✓ Form doesn't submit

---

### Test Case 17: Expired Token

**Steps:**
1. Request password reset
2. Wait 16 minutes (token expires after 15 minutes)
3. Click reset link from email

**Expected Results:**
- ✓ Error message: "Invalid or expired reset link"
- ✓ Reset form not displayed
- ✓ Suggested action to request new reset link

---

### Test Case 18: Invalid/Malformed Token

**Steps:**
1. Navigate to: \/reset-password?token=invalid-token-xyz\

**Expected Results:**
- ✓ Loading spinner shows briefly
- ✓ Error message: "Invalid or expired reset link"
- ✓ Form not displayed

---

### Test Case 19: Missing Token Parameter

**Steps:**
1. Navigate to: \/reset-password\ (no token parameter)

**Expected Results:**
- ✓ Error message: "Invalid reset link"
- ✓ Form not displayed

---

### Test Case 20: Token Already Used

**Steps:**
1. Complete password reset successfully
2. Try to use the same reset link again

**Expected Results:**
- ✓ Error message: "Invalid or expired reset link"
- ✓ Token is single-use only

---

## Integration Testing

### Test Case 21: Complete Auth Flow

**Steps:**
1. Register new account
2. Login
3. Enable 2FA via \/settings/2fa-setup\
4. Logout
5. Login again - verify 2FA prompt appears
6. Enter 2FA code from authenticator
7. Access dashboard
8. Initiate password reset
9. Reset password
10. Login with new password + 2FA

**Expected Results:**
- ✓ Complete flow works end-to-end
- ✓ 2FA persists after password reset
- ✓ All authentication mechanisms work together

---

### Test Case 22: 2FA with Backup Code

**Steps:**
1. Complete 2FA setup and save backup codes
2. Logout
3. Login with credentials
4. When 2FA prompt appears, use a backup code instead of authenticator code

**Expected Results:**
- ✓ Backup code is accepted
- ✓ Can login successfully
- ✓ Backup code is marked as used (cannot reuse)

---

## Accessibility Testing

### Test Case 23: Keyboard Navigation

**Steps:**
1. Use Tab key to navigate through each page
2. Use Enter/Space to activate buttons
3. Use arrow keys where applicable

**Expected Results:**
- ✓ All interactive elements are keyboard accessible
- ✓ Focus indicators are visible
- ✓ Tab order is logical

---

### Test Case 24: Screen Reader Testing

**Steps:**
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate through each authentication page

**Expected Results:**
- ✓ All form fields have proper labels
- ✓ Error messages are announced
- ✓ Success messages are announced
- ✓ Instructions are clear

---

## Mobile Responsive Testing

### Test Case 25: Mobile Layout

**Steps:**
1. Test on mobile devices or browser dev tools (375px, 768px widths)
2. Test on iOS Safari and Chrome Android

**Expected Results:**
- ✓ Layouts adapt to screen size
- ✓ Buttons are touch-friendly (44x44px minimum)
- ✓ Text is readable without zooming
- ✓ QR code is properly sized
- ✓ Forms are usable on small screens

---

## Performance Testing

### Test Case 26: Page Load Times

**Steps:**
1. Use browser DevTools Network tab
2. Measure page load time for each route

**Expected Results:**
- ✓ Initial page load < 2 seconds
- ✓ API responses < 500ms
- ✓ QR code generation < 1 second

---

## Security Testing

### Test Case 27: CSRF Protection

**Steps:**
1. Attempt to submit forms from external sites
2. Check CSRF token validation

**Expected Results:**
- ✓ Cross-site requests are rejected
- ✓ CSRF tokens are validated

---

### Test Case 28: Rate Limiting

**Steps:**
1. Attempt 10+ password reset requests in quick succession
2. Attempt 10+ failed 2FA verifications

**Expected Results:**
- ✓ Rate limiting triggers after threshold
- ✓ Appropriate error messages
- ✓ Temporary lockout if configured

---

## Error Handling

### Test Case 29: Network Errors

**Steps:**
1. Disable backend server
2. Attempt to use each authentication page
3. Re-enable server

**Expected Results:**
- ✓ User-friendly error messages
- ✓ No application crashes
- ✓ Can retry when server returns

---

### Test Case 30: Browser Console

**Steps:**
1. Open browser console
2. Navigate through all auth pages
3. Check for errors or warnings

**Expected Results:**
- ✓ No console errors
- ✓ No unhandled promise rejections
- ✓ Clean console output

---

## Automated Testing

### Unit Tests

Create test files in \rontend/__tests__/\:

\\\ash
# Run Jest tests
cd frontend
npm test

# Run with coverage
npm run test:coverage
\\\

### Example Test Structure

\\\	ypescript
// __tests__/2fa-setup.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TwoFactorSetupPage from '@/app/settings/2fa-setup/page';

describe('2FA Setup Wizard', () => {
  it('renders introduction step', () => {
    render(<TwoFactorSetupPage />);
    expect(screen.getByText('Why Enable 2FA?')).toBeInTheDocument();
  });

  it('progresses to QR code step', async () => {
    render(<TwoFactorSetupPage />);
    const startButton = screen.getByText('Get Started');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
    });
  });
});
\\\

---

## Testing Checklist

### 2FA Setup Wizard
- [ ] Step 1: Introduction displays correctly
- [ ] Step 2: QR code generates and displays
- [ ] Step 2: Manual entry key is copyable
- [ ] Step 3: Valid codes verify successfully
- [ ] Step 3: Invalid codes show errors
- [ ] Step 4: Backup codes display and download
- [ ] Progress indicator updates correctly
- [ ] Back navigation works
- [ ] Complete flow succeeds
- [ ] Authentication guard works (redirect if not logged in)

### Forgot Password
- [ ] Form displays correctly
- [ ] Valid email sends reset email
- [ ] Email contains valid reset link
- [ ] Success message displays
- [ ] Form validation works
- [ ] Back to login link works
- [ ] Multiple requests handled correctly

### Reset Password
- [ ] Token verification works
- [ ] Valid token displays form
- [ ] Invalid token shows error
- [ ] Expired token shows error
- [ ] Password validation enforced
- [ ] Password mismatch caught
- [ ] Successful reset redirects to login
- [ ] Can login with new password
- [ ] Token is single-use

### Cross-Cutting
- [ ] All pages are responsive
- [ ] All pages are keyboard accessible
- [ ] All errors are user-friendly
- [ ] All success states are clear
- [ ] Loading states display
- [ ] Network errors handled gracefully

---

## Test Data

### Valid Test Accounts

Create these accounts for testing:

\\\
User 1 (no 2FA):
Email: test@example.com
Password: Test123!

User 2 (with 2FA):
Email: test2fa@example.com
Password: Test123!
2FA: Enabled

Admin (with 2FA):
Email: admin@advancia-pay.com
Password: Admin123!
2FA: Enabled
\\\

---

## Debugging Tips

### Common Issues

**QR Code Not Displaying:**
- Check browser console for errors
- Verify \QRCode\ package is installed: \
pm install qrcode\
- Check API response in Network tab

**Email Not Received:**
- Check spam folder
- Verify email service configuration in backend
- Check backend logs for email errors
- Test with Mailtrap first

**2FA Code Always Invalid:**
- Verify phone/computer time is correct
- Check authenticator app settings
- Verify secret key matches
- Check backend \speakeasy\ configuration

**Reset Token Errors:**
- Check token format in URL
- Verify token hasn't expired
- Check database for token entry
- Ensure token hasn't been used

---

## Continuous Integration

Add to CI/CD pipeline:

\\\yaml
# .github/workflows/test.yml
name: Test Authentication Flow

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Dependencies
        run: |
          cd frontend
          npm install
      - name: Run Tests
        run: |
          cd frontend
          npm test
      - name: Check Types
        run: |
          cd frontend
          npm run type-check
\\\

---

## Success Metrics

A successful test run should achieve:
- ✓ 100% of manual test cases pass
- ✓ 80%+ code coverage on auth components
- ✓ 0 console errors
- ✓ < 2s page load times
- ✓ Mobile responsive on all viewports
- ✓ WCAG 2.1 Level AA compliance

---

## Reporting Issues

When reporting bugs, include:
1. Test case number
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots/video
5. Browser/device information
6. Console errors
7. Network tab responses

**Example Bug Report:**
\\\
Test Case: #3 (Expired Verification Code)
Browser: Chrome 120
Device: Desktop

Steps:
1. Reached Step 3 of 2FA wizard
2. Waited 35 seconds for code expiry
3. Entered expired code
4. Clicked verify

Expected: Error message about expired code
Actual: Generic "Invalid code" message

Console Error: None
Network: 401 response from /api/totp/verify
\\\

---

## Contact

For questions about testing:
- Frontend Team: frontend@advancia-pay.com
- Backend Team: backend@advancia-pay.com
- QA Team: qa@advancia-pay.com

---

**Last Updated:** December 25, 2025
**Version:** 2.0.0
**Test Coverage Target:** 80%+
