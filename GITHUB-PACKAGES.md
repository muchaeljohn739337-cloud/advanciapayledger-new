# GitHub Packages Setup

## �� Published Packages

- **@advanciapayledger/backend** - Enterprise Fintech Backend

## 🔐 Authentication

### For Installing Packages

1. Create Personal Access Token (PAT):
   - Go to: https://github.com/settings/tokens/new
   - Select scopes: `read:packages`
   - Generate token

2. Configure NPM:
```bash
npm login --scope=@advanciapayledger --registry=https://npm.pkg.github.com
Username: your-github-username
Password: your-personal-access-token
Email: advanciapayledger@gmail.com
```

### For Publishing Packages

Publishing is automated via GitHub Actions on:
- New releases
- Manual workflow dispatch

## 📥 Installing Packages

### Backend Package

```bash
npm install @advanciapayledger/backend
```

### Using .npmrc (Recommended)

Create `.npmrc` in your project:
```
@advanciapayledger:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install normally:
```bash
npm install @advanciapayledger/backend
```

## 🚀 Publishing New Versions

### Automatic (Recommended)

1. Update version in `package.json`:
```bash
cd backend
npm version patch  # or minor, major
```

2. Create GitHub Release:
   - Go to: https://github.com/muchaeljohn739337-cloud/advanciapayledger-new/releases/new
   - Tag: v2.0.1 (match package.json version)
   - Click "Publish release"
   - Package will auto-publish via GitHub Actions

### Manual

1. Go to Actions → Publish to GitHub Packages
2. Click "Run workflow"
3. Enter version (optional)
4. Click "Run workflow"

## 📋 Package Registry

View packages at:
https://github.com/muchaeljohn739337-cloud?tab=packages

## 🔍 Package Information

### Backend Package

- **Name**: @advanciapayledger/backend
- **Version**: 2.0.0
- **Registry**: GitHub Packages
- **Scope**: @advanciapayledger

## 🛠️ Development

Building the package:
```bash
cd backend
npm run build
```

Testing before publish:
```bash
cd backend
npm pack
# Creates advanciapayledger-backend-2.0.0.tgz
```

Install locally:
```bash
npm install ./advanciapayledger-backend-2.0.0.tgz
```

## 📝 Notes

- Packages are scoped to `@advanciapayledger`
- Published to GitHub Packages (not npm registry)
- Requires GitHub authentication to install
- Auto-publishes on release creation
- Can manually trigger publish via Actions
