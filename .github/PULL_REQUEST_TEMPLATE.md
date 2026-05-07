<<<<<<< Updated upstream
> ⚠️ **WAIT!** Are you modifying `schema.prisma`?
> If so, you MUST run a dry-run and ensure no breaking changes (e.g. enum removals) affect existing code.

## Description

Provide a brief description of the changes introduced by this PR. Include any relevant issue numbers.

## Schema Changes Checklist

- [ ] No Prisma schema changes were made.
- [ ] Added a Prisma migration file (or ran `npx prisma migrate dev`).
- [ ] Checked for enum renames/removals and provided a data migration script.
- [ ] Executed a migration dry-run locally.

## Breaking Changes Checklist

- [ ] No breaking changes introduced.
- [ ] Searched for all callers of any deleted/renamed function or property.
- [ ] Updated `CHANGE_AUDIT_REPORT.md` if any breaking changes exist.

## Security Checklist

- [ ] Did not expose any `@ignore` Prisma fields to the client.
- [ ] Changes do not conflict with or bypass Supabase RLS policies.
- [ ] Validated input in Server Actions using Zod.
- [ ] Ensured auth-service / JWT logic is unaffected or securely tested.

## Test Coverage & Observability

- [ ] Added or updated regression tests in `scripts/tests/`.
- [ ] Linked test file: `_______________________`
- [ ] Added `logger.info` or `logger.error` using Pino for new critical code paths.

## Additional Notes

Add any other context, screenshots, or videos here.
=======
## SECTION 1 — Summary (required)
- **What does this PR do?** (1-3 sentences)
  - 
- **Ticket reference:** Closes #___
- **Type:**
  - [ ] feat
  - [ ] fix
  - [ ] refactor
  - [ ] security
  - [ ] chore
  - [ ] docs

---

## SECTION 2 — Schema Change Checklist
> [!IMPORTANT]
> Show only if `prisma/schema.prisma` is touched.
- [ ] I added a migration file in `prisma/migrations/` (never edit schema without a migration)
- [ ] I ran `prisma migrate dev --name <name>` locally
- [ ] If I renamed an enum value (like `BookingStatus`), I updated `CHANGE_AUDIT_REPORT.md`
- [ ] I checked every file that references the changed model/enum with: `grep -r "ModelName" --include="*.ts" --include="*.js" .`

---

## SECTION 3 — Security Checklist (required for every PR)
- [ ] This PR does **NOT** store passwords in plaintext
- [ ] This PR does **NOT** log PHI (`patientId`, `phone`, `email`, `dateOfBirth`) to console or pino
- [ ] This PR does **NOT** return `Hospital.password` in any API response
- [ ] If this PR touches auth: a security reviewer has approved

---

## SECTION 4 — Testing
- [ ] I added/updated tests for this change (link to test file: `_______________________` )
- [ ] All existing tests pass: `npx vitest run`
- [ ] If no tests added, explain why: 
  - 

---

## SECTION 5 — Breaking Changes
- [ ] This PR introduces **NO** breaking changes
- [ ] **OR:** This PR introduces breaking change: `_______________________` and I have updated `CHANGE_AUDIT_REPORT.md`
>>>>>>> Stashed changes
