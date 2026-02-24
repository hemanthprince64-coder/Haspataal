# ARCHITECTURE REPORT

> Repo: https://github.com/hemanthprince64-coder/Haspataal.git

## Structure: Multi-Project (NOT monorepo — no workspaces)

| Project | Type | Port | Framework |
|---|---|---|---|
| **Root (haspataal)** | Primary App | 3000 | Next.js 16.1.6 + React 19 |
| **haspataal-in** | Provider Portal | 3001 | Next.js |
| **haspataal-admin** | Admin Portal | 3002 | Next.js |
| **haspataal-com** | Marketing Site | 3000 | Next.js |
| **haspataal-mobile** | Patient Mobile App | N/A | Expo (React Native) |

## Root App Tech Stack

| Tech | Version |
|---|---|
| Next.js | 16.1.6 |
| React | 19.2.3 |
| Prisma | 5.10.0 |
| TypeScript | 5.9.3 |
| Auth | jose (JWTs) |
| Logging | pino + pino-pretty |
| Validation | zod 4.3.6 |
| DB | Supabase PostgreSQL |

## Root App Route Groups

| Group | Routes |
|---|---|
| `(patient)` | `/`, `/login`, `/hospitals`, `/book`, `/profile`, `/search` |
| `(hospital)` | `/hospital/*` (login, register, dashboard, billing, doctors, reports) |
| `(hospital)` | `/lab/*` (register, dashboard) |
| `(agent)` | `/agent/*` (login, register, dashboard) |
| `(doctor)` | `/doctor/register` |
| `admin` | `/admin`, `/admin/dashboard`, `/admin/dashboard/hospitals` |

## Shared Code
- `common/` — shared services.js
- `prisma/schema.prisma` — single schema for root app
- `lib/` — services.ts, auth utilities, prisma client
