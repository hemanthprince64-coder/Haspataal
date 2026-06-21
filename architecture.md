# System Architecture

This document maps out the system architecture of the Haspataal healthcare platform.

## Overview
Haspataal is a modern, monorepo-based healthcare management system consisting of multiple frontend applications, backend microservices, shared packages, and databases.

## Technology Stack
- **Monorepo Management**: Turborepo (Node.js & npm workspaces)
- **Frontend Portals**: Next.js 14/15 App Router, React 19/18, Tailwind CSS, Radix UI, lucide-react
- **Backend Framework**: Next.js API Routes & Server Actions, BullMQ queue engine, Redis
- **Database Layer**: PostgreSQL via Prisma ORM, Supabase Storage
- **Authentication**: JWT/jose-based sessions with custom cookie verification
- **Monitoring & Errors**: Sentry & PostHog

## Component Layers

```
  +-------------------------------------------------------------+
  |                        Browser Client                       |
  +------------------------------+------------------------------+
                                 |
                                 v
  +------------------------------+------------------------------+
  |              Next.js Gateway & Portals                      |
  |    (patient-portal, hospital-hms, admin-panel)              |
  +------------------------------+------------------------------+
                                 | (Server Actions & API Routes)
                                 v
  +------------------------------+------------------------------+
  |             Business Logic & Shared Packages                |
  |     (@haspataal/auth, @haspataal/db, @haspataal/queue)      |
  +------------------------------+------------------------------+
                                 |
                                 v
  +------------------------------+------------------------------+
  |                        Databases                            |
  |             (PostgreSQL, Redis cache/queue)                 |
  +-------------------------------------------------------------+
```

