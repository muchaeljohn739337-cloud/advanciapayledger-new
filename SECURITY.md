# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them responsibly using one of these methods:

### 1. GitHub Security Advisories (Preferred)
Report directly through GitHub's private vulnerability reporting:
- Go to: https://github.com/muchaeljohn739337-cloud/advanciapayledger-new/security/advisories/new
- This keeps the vulnerability private until we can address it

### 2. Email
Send details to: **security@advanciapayledger.com** (or project maintainer email)

**Include in your report:**
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Response Timeline

- **Initial Response:** Within 48 hours of report
- **Status Update:** Within 5 business days
- **Fix Timeline:** Critical issues within 7 days, others within 30 days
- **Public Disclosure:** After fix is deployed and users have time to update

## Security Update Process

1. We validate and confirm the vulnerability
2. We develop a fix in a private repository
3. We prepare security advisory
4. We release patched version
5. We publish security advisory
6. We credit reporter (if desired)

## Security Best Practices for Users

### For Developers:
- Always use environment variables for secrets (never commit `.env` files)
- Keep dependencies updated with `npm audit` and Dependabot
- Enable 2FA on all service accounts (GitHub, AWS, payment processors)
- Use the provided `.env.template` file
- Review security scanning results regularly

### For Deployment:
- Use HTTPS only in production
- Rotate credentials regularly (at least every 90 days)
- Enable all security features:
  - GitHub Secret Scanning
  - GitHub Push Protection
  - CodeQL Analysis
  - Branch Protection Rules
- Use PostgreSQL with encrypted connections
- Store sensitive data in Azure Key Vault or similar

## Security Features

This project includes:
- ✅ GitHub Secret Scanning
- ✅ Push Protection
- ✅ CodeQL Security Analysis
- ✅ Pre-commit hooks for secret prevention
- ✅ Dependency scanning via Dependabot
- ✅ GitLab security scanning pipeline

## Disclosure Policy

- We follow responsible disclosure practices
- We credit security researchers (with permission)
- We maintain a security changelog in release notes
- Critical vulnerabilities are disclosed after patches are available

## Bug Bounty Program

Currently, we do not offer a paid bug bounty program, but we deeply appreciate responsible disclosure and will publicly credit researchers who help improve our security.

## Security Hall of Fame

We will list researchers who have responsibly disclosed security issues here:

*(No vulnerabilities reported yet)*

## Contact

- Security Email: security@advanciapayledger.com
- Project Maintainer: @muchaeljohn739337-cloud
- GitHub Security: https://github.com/muchaeljohn739337-cloud/advanciapayledger-new/security

## Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

**Last Updated:** December 26, 2025
