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
