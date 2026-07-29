# Haspataal Repository Structure

This document outlines the logical structure of the Haspataal monorepo. As the codebase grows towards MVP, adhering to this structure is mandatory to prevent clutter and maintain developer productivity.

## Directory Layout

```text
haspataal/
├── apps/               # Next.js frontend applications
│   ├── admin-panel/    # Platform admin dashboard
│   ├── hospital-hms/   # Hospital management system (HMS)
│   ├── marketing/      # Public-facing landing pages
│   ├── mobile/         # React Native / Expo mobile app
│   └── patient-portal/ # Primary patient-facing web application
│
├── packages/           # Shared libraries and packages
│   ├── auth/           # Shared authentication logic
│   ├── config/         # Shared configuration (ESLint, TS, Tailwind)
│   ├── core/           # Core domain logic and business rules
│   ├── db/             # Prisma schema and database client
│   └── types/          # Shared TypeScript types and Zod schemas
│
├── services/           # Backend microservices
│   ├── auth/           # Dedicated authentication service
│   ├── gateway/        # API Gateway
│   └── medchat/        # AI medical chat service
│
├── workers/            # Background job processing (BullMQ)
│
├── docs/               # Project documentation
│   └── architecture/   # Architectural decisions and structures
│
├── clinical/           # Clinical content (Not code)
│   ├── scenarios/      # Clinical scenarios and expected outcomes
│   └── datasets/       # Mock data and JSON fixtures
│
├── openspec/           # OpenSpec planning workflow
│   ├── active/         # Currently active specifications
│   ├── archive/        # Completed and archived specifications
│   └── specs/          # Reusable spec definitions
│
├── scripts/            # Operational, automation, and utility scripts
│   ├── benchmark/      # Load testing and stress testing scripts
│   ├── build/          # Custom build steps
│   ├── debug/          # Troubleshooting and diagnostic tools
│   ├── deploy/         # Deployment automation
│   ├── maintenance/    # Backup, restore, and cleanup scripts
│   ├── migrate/        # Database migration utilities
│   ├── simulation/     # Executable clinical simulations
│   └── utilities/      # General developer helpers and seeders
│
└── scratch/            # Temporary, uncommitted developer workspaces
    ├── experiments/    # Proof of concepts
    ├── notes/          # Developer scratchpads
    ├── prompts/        # LLM prompt drafts
    ├── scripts/        # One-off throwaway scripts
    └── sql/            # Scratch SQL queries
```

## Guidelines

1. **New Applications**: All new standalone deployable applications must be placed in `apps/`.
2. **New Packages**: Shared code used by two or more applications must be extracted into `packages/`.
3. **No Build Artifacts**: Directories like `.next`, `.turbo`, and `graphify-out` are strictly `.gitignore`d. Do not bypass this.
4. **No Root Logs**: Do not write `.txt` or `.log` files to the repository root. Send outputs to `tmp/` or `scratch/` if needed.
5. **Clinical Automation**: Executable automation (e.g. `simulate-pediatric-ns.ts`) lives in `scripts/simulation/`. The non-executable context (e.g. JSON payloads) for those simulations lives in `clinical/scenarios/`.

*By keeping this structure clean, we ensure faster onboarding, smaller repository size, and a more robust development lifecycle.*
