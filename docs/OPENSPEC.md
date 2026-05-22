# OpenSpec — Haspataal Integration Guide

## Overview

OpenSpec is a **spec-driven development (SDD) framework** for AI coding assistants. Instead of prompting your AI agent with vague or rapidly-shifting context, OpenSpec lets you define a lightweight spec layer before any code is written — giving both humans and AI a shared contract to build against.

**Repository:** [github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)  
**npm package:** `@fission-ai/openspec` v1.3.1

---

## Step 1 — Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20.19.0+ (v25.8.1 used) |
| npm | 10+ |
| OS | Windows, macOS, Linux |

---

## Step 2 — Install

```bash
# Install globally (provides `openspec` CLI)
npm install -g @fission-ai/openspec@latest

# Verify installation
openspec --version
```

---

## Step 3 — Initialize in the Haspataal Project

```bash
cd haspataal
openspec init . --tools all --force
```

The `--tools all` flag configures slash-commands for **all 28 supported AI agents**, including:
- Claude Code (`.claude/`)
- Kilo (`.kilocode/`)
- OpenCode (`.opencode/`)
- Cursor, Windsurf, GitHub Copilot, and 22 others

The `--force` flag skips interactive prompts and auto-cleans legacy config files.

---

## Step 4 — Configure Project Context

Edit `openspec/config.yaml` to embed Haspataal-specific knowledge that the AI will use when generating specs:

```yaml
schema: spec-driven
context: |
  Tech stack: Next.js 16 (App Router), Express.js, TypeScript, Prisma 5,
    PostgreSQL (Supabase), Redis (ioredis), BullMQ, Turborepo, Tailwind CSS
  Monorepo: apps/ (patient-portal, hospital-hms, admin-panel),
    packages/ (db, types, auth, core, config), services/ (gateway, auth, medchat)
  Health domain: Multi-tenant hospital SaaS for Tier-2/3 Indian cities.
    Must enforce RLS, PHI protection, ABDM/ABHA integration, DPDP compliance
  Auth: JWT with role-specific cookies (session_user, session_patient, session_admin, session_agent)
  Observability: Sentry + Pino structured logging (PHI auto-redacted)
  Coding: PascalCase components, camelCase vars, kebab-case folders.
    Server Actions = TS + Zod validation. @haspataal/logger for all logging.
  Commits: Conventional Commits
```

---

## Step 5 — Select Your Workflow Profile

```bash
openspec config profile core   # lightweight: propose → apply → archive
# openspec config profile core --help  # for more options
```

After changing the profile, refresh agent instructions:

```bash
openspec update --force
```

---

## Step 6 — Start Building

The core workflow consists of **3 slash commands**:

### `/opsx:propose "your idea"` — Create a Change
Creates a new `openspec/changes/<name>/` folder and generates:
- `proposal.md` — **What** and **Why** (problem, scope, affected subsystems)
- `specs/` — directory for requirement documents
- `design.md` — **How** (technical approach)
- `tasks.md` — implementation checklist

### `/opsx:apply` — Implement Tasks
Reads the generated artifacts and implements every pending task, ticking checkboxes in `tasks.md` as it goes.

### `/opsx:archive` — Clean Up
Archives a completed change to `openspec/changes/archive/YYYY-MM-DD-<name>/` and finalizes the specs.

---

## Directory Structure After Initialization

```
haspataal/
├── openspec/
│   ├── config.yaml              # Project context for AI
│   ├── changes/                 # Active changes (one folder per feature/fix)
│   │   ├── <change-name>/
│   │   │   ├── .openspec.yaml   # Change metadata
│   │   │   ├── proposal.md      # What & Why
│   │   │   ├── design.md        # Technical approach
│   │   │   ├── specs/           # Requirement docs
│   │   │   │   └── <capability>/
│   │   │   │       └── spec.md
│   │   │   └── tasks.md         # ✓ Implementation checklist
│   │   └── archive/             # Completed changes (timestamped)
│   └── specs/                   # Global shared specs (cross-cutting)
├── .claude/                     # Claude Code slash commands + skills
├── .kilocode/                   # Kilo Code integration
├── .opencode/                   # OpenCode integration
└── ...                          # 25 other AI agent configs
```

---

## Artifact Lifecycle (Spec-Driven Schema)

```
/opsx:propose
    │
    ├─ proposal.md   ← What & Why (dependencies: none)
    │
    ├─ specs/<id>/   ← Requirements per capability (deps: proposal)
    │
    ├─ design.md     ← Technical approach (deps: proposal, specs)
    │
    └─ tasks.md      ← Checklist (deps: design, specs)

         ↓ (all artifacts complete)

/opsx:apply  →  AI implements each task, ticking checkboxes

         ↓ (implementation verified)

/opsx:archive  →  Move to openspec/changes/archive/
```

The CLI enforces ordering: `design` blocks on `proposal`; `tasks` blocks on `design` + `specs`; `/opsx:apply` only runs when `applyRequires` artifacts are all done.

---

## Example: Adding a Retention Escalation Feature

```bash
# 1. Propose the change
/opsx:propose add-retention-followup-escalation
```

The AI creates `openspec/changes/add-retention-followup-escalation/` with:
- `proposal.md` — Chronic follow-up gap → doctor escalation alert rationale
- `specs/retention-escalation/spec.md` — Exact business rules (threshold = 2 missed, eligible patient types, notification channels)
- `design.md` — Redis worker, Prisma `EscalationAlert` model, Express API routes, HMS dashboard widget
- `tasks.md` — Step-by-step tasks (10+ items, each independently completable)

```bash
# 2. Apply (AI implements)
/opsx:apply add-retention-followup-escalation

# 3. Archive when verified
/opsx:archive add-retention-followup-escalation
```

---

## Maintenance

```bash
# Upgrade OpenSpec globally
npm install -g @fission-ai/openspec@latest

# Refresh all agent command files in the project
openspec update --force

# View all active changes
openspec list --json

# Show latest status for a specific change
openspec status --change <name>
```

---

## Opt-Out of Telemetry

```bash
export OPENSPEC_TELEMETRY=0
# or
export DO_NOT_TRACK=1
```

---

## Integrating with Haspataal CI

Add the following to your CI pipeline to validate OpenSpec changes on PRs:

```yaml
- name: Validate OpenSpec changes
  run: |
    openspec list --json
    for change in $(openspec list --json | jq -r '.changes[].name'); do
      openspec status --change "$change" --json | jq '.'
    done
```
