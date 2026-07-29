# Haspataal Clinical Rules Engine

## 1. PROBLEM STATEMENT

Haspataal currently implements business logic in individual modules requiring code changes for every workflow modification.

## 2. SOLUTION OVERVIEW

A configurable Business Rules Platform serving as the "Clinical Brain" of Haspataal.

## 3. BUSINESS VALUE

- Zero Code Changes for new workflows
- Consistency: Single source of truth
- Auditability: Immutable logs
- Versioning: Safe rollbacks
- Scalability: BullMQ parallel execution

## 4. SCOPE

In Scope:
- Rule repository with versioning
- Visual no-code rule builder
- Real-time/scheduled execution
- Timeline/API integration

Out of Scope:
- AI autonomous execution
- Mobile-native builder

## 5. SUCCESS CRITERIA

- All modules use Rules Engine
- New workflows = configuration
- Execution < 100ms per rule
- RLS enforcement
