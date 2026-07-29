# Phase 0A: Test Matrix

## 1. Overview
This test matrix validates the core components of the Phase 0A Event System Standardization: Outbox Pattern, Relay Reliability, Canonical Event Contract, and Idempotency.

## 2. Test Scenarios

### 2.1 Outbox & Producer
| ID | Scenario | Expected Behavior | Status |
|---|---|---|---|
| PROD-01 | Successful transaction commits event | Event is written to Outbox table within same transaction | Pending |
| PROD-02 | Transaction rollback | Event is NOT written to Outbox table | Pending |
| PROD-03 | Producer conforms to Canonical schema | Event passes schema validation before insertion | Pending |

### 2.2 Relay & Delivery
| ID | Scenario | Expected Behavior | Status |
|---|---|---|---|
| REL-01 | Standard processing | Relay picks up event, publishes, marks as processed | Pending |
| REL-02 | Relay failure mid-processing | Event remains unprocessed, picked up by next worker | Pending |
| REL-03 | Broker unavailable | Relay retries with exponential backoff | Pending |
| REL-04 | Poison pill event | Event moved to DLQ after `MAX_RETRIES` | Pending |

### 2.3 Consumer & Idempotency
| ID | Scenario | Expected Behavior | Status |
|---|---|---|---|
| CONS-01 | First-time event receipt | Processed successfully, Idempotency key stored | Pending |
| CONS-02 | Duplicate event receipt | Rejected as duplicate, no side-effects, acknowledged | Pending |
| CONS-03 | Concurrent duplicate receipt | Only one thread processes; others reject | Pending |

## 3. Performance & Chaos Testing
* **Load Test:** Simulate 5000 events/sec to verify Relay throughput and DB lock contention.
* **Chaos Test:** Randomly kill Relay nodes to ensure no events are dropped or stuck in processing state indefinitely.
