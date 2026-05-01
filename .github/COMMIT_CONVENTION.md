# Haspataal Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) to automatically generate changelogs and maintain a readable project history.

## Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

## Allowed Types
- **feat**: A new feature
- **fix**: A bug fix
- **security**: A vulnerability fix or security enhancement
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **docs**: Documentation only changes
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

## Allowed Scopes
- `patient` - Patient portal and flows
- `hospital` - Hospital HMS and admin flows
- `admin` - Platform admin panel
- `lab` - Diagnostic center module
- `agent` - Field agent portal
- `doctor` - Doctor facing features
- `auth` - Authentication, JWT, and RBAC
- `gateway` - API Gateway and routing
- `db` - Prisma, RLS, SQL migrations
- `infra` - Docker, Nginx, Redis
- `mobile` - Expo mobile app
- `deps` - Dependency updates
- `ci` - GitHub actions, Husky, Turborepo

## 10 Real Examples from Haspataal
1. `feat(patient): add MedChat AI triage component`
2. `fix(hospital): prevent crash when doctorId is null in removeDoctorAction`
3. `security(db): add @ignore to HospitalsMaster.password field`
4. `refactor(gateway): migrate auth validation from jsonwebtoken to jose`
5. `perf(db): add B-tree indexes for foreign keys to optimize dashboards`
6. `docs(architecture): add C4 Level 1 and Level 2 diagrams`
7. `test(auth): add regression test for HospitalSafeDto password stripping`
8. `build(deps): update @prisma/client to 5.10.2`
9. `feat(agent): implement agent registration and referral flow`
10. `chore(ci): set up commitlint with Haspataal scopes`
