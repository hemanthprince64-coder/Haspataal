---
description: Run the comprehensive global code validation pipeline including linting, security, and schema checks.
---

# Global Code Validation Pipeline

This workflow executes the full validation sequence as defined by the user.

## 1. Loop Agent (Linting & Analysis)
- Analyzes changed files for errors and unused imports.
```bash
npm run lint
```
// turbo
```bash
tsc --noEmit
```

## 2. Code Rabbit (Deep Review)
- Performs manual review of critical files (e.g. `page.js`, `layout.js`, API routes).
- Checks for architectural consistency.

## 3. Supabase Schema Guardian (Database Validation)
- Validates Prisma schema and migrations.
```bash
npx prisma validate
```

## 4. Security Agent (OWASP Scan)
- Checks for known vulnerabilities.
```bash
npm audit
```

## 5. QA Agent (Build Check)
- Verifies build integrity as a proxy for regression testing (if specific test suites are not yet defined).
```bash
npm run build
```

## 6. Performance Auditor
- Checks bundle sizes via build output.

## Execution
Run this workflow by typing `/run-full-validation` or when explicitly requested.
