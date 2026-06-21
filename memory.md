# Haspataal Project Memory (memory.md)

This file serves as the permanent brain of the **Haspataal** project, outlining its business goal, tech stack, architecture, routing, database structure, and core operations.

## Project Overview
Haspataal is a dual-portal healthcare platform offering a **Patient Portal** (for booking, tracking health journeys, vitals, and medchat AI triage) and a **Hospital HMS** (for hospital admins, receptionists, and doctors to manage appointments, billing, staff, lab tests, and patients).

## Tech Stack
- **Framework**: Next.js App Router (14/15), React, Node.js
- **Database**: PostgreSQL (Prisma ORM)
- **Caching & Queues**: Redis & BullMQ
- **Authentication**: JWT Jose-based session cookies with OTP codes for patients
- **Styling**: Vanilla Tailwind CSS & Radix UI

## System Architecture
Haspataal follows a Clean Architecture approach where the business logic resides in services and use-cases, while Next.js handles routing and client interaction. Data flow goes from the browser through Server Actions / API Routes, into domain services, and finally queries the PostgreSQL database via Prisma with JWT claims set for Row-Level Security (RLS).

## Core Modules & Features
1. **Patient Portal**: Vitals, medications, pregnancy tracking (ANC), doctor/speciality search, slot booking, medchat AI triage, and wallet-based transactions.
2. **Hospital HMS**: Visit creation, clinical notes processing, department handoffs, staff scheduling, pharmacy dispensing, billing/invoicing, and diagnostic order processing.
3. **Queue System**: Standardized adapter backing queues with Redis/BullMQ, pg-boss, or in-process execution for email/SMS alerts and AI processing.

## Documentation Index
Detailed maps can be found in their respective documentation files:
- [System Architecture](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/architecture.md)
- [Route Tables](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/routes.md)
- [API Map](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/api-map.md)
- [Database Map](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/database-map.md)
- [Dependency Graph](file:///c:/Users/heman/.gemini/antigravity/scratch/haspataal/dependency-graph.md)
