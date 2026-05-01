# Contributing to Haspataal

Welcome to Haspataal! This document provides guidelines for contributing to our platform.

## Setup
- This is a Turborepo monorepo.
- Use `npm run dev` from the root to start all services.

## Commit Message Convention
Haspataal uses **Conventional Commits** to enforce readable history and automated changelogs. All commits are validated via a Husky `commit-msg` hook.

Please read the full convention rules here: [Haspataal Commit Convention](.github/COMMIT_CONVENTION.md)

### Quick Example
`feat(patient): add MedChat AI triage component`

If your commit fails linting, edit your message to match the `<type>(<scope>): <subject>` format.

## Pull Requests
All pull requests must use our tailored template which checks for:
1. **Schema Changes** (Migrations, Enum renames)
2. **Breaking Changes**
3. **Security Implications** (RLS, Auth)
4. **Test Coverage**

When creating a PR, the checklist will automatically populate. Please ensure all relevant checkboxes are completed.
