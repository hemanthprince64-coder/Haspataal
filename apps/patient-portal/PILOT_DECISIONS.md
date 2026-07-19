# Pilot Decisions Log (MVP 1.1)

This log records every significant product, technical, or workflow decision made during the Muzaffarpur hospital pilot and validation sprints.

## Format
- **Date:** YYYY-MM-DD
- **Observation:** What we saw or heard from users/logs.
- **Decision:** What we decided to do (or not do).
- **Reason:** Why we made this choice.
- **Expected Impact:** How this affects the system, users, or roadmap.

---

### Example Entry (Template)
- **Date:** 2026-07-18
- **Observation:** Receptionists repeatedly used the Quick Action Bar instead of the sidebar.
- **Decision:** Keep Quick Action Bar permanently, make it sticky at the top of the layout.
- **Expected Impact:** Faster registration and billing times; fewer misclicks.

---

### End-to-End Latency vs DB Latency
- **Date:** 2026-07-18
- **Observation:** Simulation Gate 1 processed 1,080 transactions in 158 seconds sequentially directly via Prisma (146ms average). This proved DB write path stability, but bypassed HTTP, Auth, and React rendering.
- **Decision:** Do not accept 146ms as the true "Performance Target" metric for Gate 2. Shift Sprint 2 into four tracks (Infrastructure, Network, User Behaviour, Concurrency) with Track D (Concurrency) prioritized.
- **Reason:** Real hospitals do not operate sequentially. 4 receptionists and 6 doctors saving concurrently is the only way to expose true race conditions and locking faults.
- **Expected Impact:** Identifying actual performance bottlenecks before deploying to Muzaffarpur.

---

### Current RC1 Confidence Scores (Pre-Sprint 2)
- Architecture & Database Integrity: 10/10
- Transaction Design & Workflows: 9.5/10
- Performance & Production Readiness: 8.5/10 *(Awaiting End-to-End Concurrency & Usability Evidence)*
