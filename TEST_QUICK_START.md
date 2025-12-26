# Testing Quick Start Guide

## 🚀 Running Tests

```bash
# All tests (frontend + backend)
npm run test

# Frontend unit tests only  
npm run test:frontend

# Backend integration tests only
npm run test:backend

# E2E tests with Playwright
npm run test:e2e

# E2E tests with UI mode (interactive)
npm run test:e2e:ui
```

## 📁 Test Structure

```
advancia-pay-ledger-new/
├── frontend/src/app/(auth)/setup-2fa/__tests__/
│   └── page.test.tsx              # Frontend unit tests
├── backend/src/__tests__/
│   └── auth.integration.test.ts   # Backend integration tests
└── e2e/
    ├── auth-flow.spec.ts          # E2E tests
    └── playwright.config.ts       # Playwright configuration
```

## ✅ Current Status

- ✅ Test infrastructure set up
- ✅ Dependencies installed
- ✅ Frontend tests passing (1/1)
- ⚠️  Backend tests need implementation
- ⚠️  E2E tests need dev server running

## 📚 Documentation

See **TESTING_AUTH.md** for:
- 28 detailed manual test cases
- Automated test templates
- Security testing guidelines
- Production readiness checklist

## 🔧 Implementation TODOs

### Frontend Tests
- [ ] Complete 2FA QR code generation test
- [ ] Add TOTP validation tests
- [ ] Test backup code download
- [ ] Add error handling tests

### Backend Tests
- [ ] Import Express app
- [ ] Implement TOTP setup endpoint tests
- [ ] Add password reset flow tests
- [ ] Test token expiration

### E2E Tests
- [ ] Set up test user accounts
- [ ] Configure test database
- [ ] Add real TOTP code generation
- [ ] Test complete authentication flows

## 🎯 Quick Test Workflow

1. **Unit Test Development**:
   ```bash
   cd frontend
   npm test -- --watch  # Watch mode for TDD
   ```

2. **Integration Test Development**:
   ```bash
   cd backend
   npm test -- --watch
   ```

3. **E2E Test Development**:
   ```bash
   npm run dev          # Start servers in one terminal
   npm run test:e2e:ui  # Run E2E tests in another terminal
   ```

## 🐛 Troubleshooting

**Tests not running?**
- Check Node.js version: `node --version` (should be 18.x+)
- Reinstall dependencies: `npm install`
- Clear Jest cache: `npm test -- --clearCache`

**E2E tests failing?**
- Ensure dev server is running: `npm run dev`
- Check backend is on port 3001
- Check frontend is on port 3000
- Verify test database is set up

**TypeScript errors?**
- Run `npm run build` to check for compilation errors
- Verify `@types/jest` is installed
- Check `tsconfig.json` configuration

## 📊 Coverage Reports

```bash
# Run tests with coverage
npm test -- --coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 🔗 Related Files

- `TESTING_AUTH.md` - Complete testing documentation
- `package.json` - Test scripts configuration
- `jest.config.js` - Jest configuration (frontend & backend)
- `e2e/playwright.config.ts` - Playwright configuration

---

**Last Updated**: December 25, 2025
**Status**: Infrastructure Complete ✅
