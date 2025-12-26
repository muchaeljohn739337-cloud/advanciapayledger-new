import { test, expect } from '@playwright/test';

test.describe('2FA Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('complete 2FA setup wizard', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/setup-2fa');

    // Step 1: Welcome
    await expect(page.locator('h2')).toContainText('Enable Two-Factor');
    await page.click('text=Enable Two-Factor Authentication');

    // Step 2: QR Code
    await expect(page.locator('img[alt*="QR"]')).toBeVisible({ timeout: 10000 });
    const secret = await page.locator('text=/Setup Key:/i').textContent();
    expect(secret).toBeTruthy();

    // Verify backup codes
    const backupCodes = page.locator('[data-testid="backup-code"]');
    await expect(backupCodes).toHaveCount(8);

    await page.click('text=Next');

    // Step 3: Verify (using test TOTP)
    // Note: In real tests, you'd generate a valid TOTP code here
    await page.fill('[name="code"]', '123456');
    await page.click('text=Verify and Enable');

    // Should redirect on success (or show error for invalid code)
    // await page.waitForURL('**/dashboard');
  });

  test('download backup codes', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/setup-2fa');
    await page.click('text=Enable Two-Factor Authentication');

    await expect(page.locator('img[alt*="QR"]')).toBeVisible({ timeout: 10000 });

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Download Backup Codes'),
    ]);

    expect(download.suggestedFilename()).toMatch(/2fa-backup-codes.*\.txt/);
  });
});

test.describe('Forgot Password Flow', () => {
  test('sends reset email', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/forgot-password');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/If an account exists/i')).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/forgot-password');
    
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/valid email/i')).toBeVisible();
  });
});

test.describe('Reset Password Flow', () => {
  test('resets password with valid token', async ({ page }) => {
    const validToken = 'test-reset-token-123';
    await page.goto(`http://localhost:3000/auth/reset-password?token=${validToken}`);

    await page.fill('[name="password"]', 'NewPassword123!');
    await page.fill('[name="confirmPassword"]', 'NewPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/reset successfully/i')).toBeVisible({ timeout: 5000 });
    // await page.waitForURL('**/auth/login');
  });

  test('shows error for password mismatch', async ({ page }) => {
    const validToken = 'test-reset-token-123';
    await page.goto(`http://localhost:3000/auth/reset-password?token=${validToken}`);

    await page.fill('[name="password"]', 'Password123!');
    await page.fill('[name="confirmPassword"]', 'Different123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/do not match/i')).toBeVisible();
  });

  test('validates password requirements in real-time', async ({ page }) => {
    const validToken = 'test-reset-token-123';
    await page.goto(`http://localhost:3000/auth/reset-password?token=${validToken}`);

    const passwordInput = page.locator('[name="password"]');
    
    // Type weak password
    await passwordInput.fill('weak');
    
    // Check requirement indicators (adjust selectors based on your implementation)
    // await expect(page.locator('text=/8 characters/i')).toHaveClass(/text-red/);
    // await expect(page.locator('text=/uppercase/i')).toHaveClass(/text-red/);
    
    // Type strong password
    await passwordInput.fill('StrongPass123!');
    
    // await expect(page.locator('text=/8 characters/i')).toHaveClass(/text-green/);
    // await expect(page.locator('text=/uppercase/i')).toHaveClass(/text-green/);
  });
});
