---
version: 2.0
owner: Haspataal Engineering
last_updated: 2026-08-04
status: Active
---

# Code Review Guidelines

Reviewers must explicitly check the following before approving a PR:

1. **Security:** Are there any RLS bypasses or exposed PHI?
2. **Domain Boundaries:** Does this PR violate rules in `DEPENDENCY_RULES.md`?
3. **Tests:** Did the author include tests for edge cases (e.g., race conditions)?
4. **Docs:** Did the author update the relevant `docs/` files for architectural changes?
