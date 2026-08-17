# Phase 6 Load Test Report

**Date:** July 15, 2026
**Status:** PASS
**Testing Engine:** k6

## Load Test Scenarios
Four distinct scenarios were executed to simulate real-world hospital loads over a 60-second window.

### 1. OPD Load (50 Concurrent VUs)
- **Result:** P95 Latency < 100ms
- **Errors:** 0.00%
- **Status:** PASS

### 2. IPD Admissions (Ramping 0 -> 20 VUs)
- **Result:** P95 Latency < 120ms
- **Errors:** 0.00%
- **Status:** PASS

### 3. Pharmacy Dispense (100 Arrivals/s)
- **Result:** P95 Latency < 250ms
- **Errors:** 0.00% (Batch relayed successfully via Outbox)
- **Status:** PASS

### 4. Laboratory Orders (30 Concurrent VUs)
- **Result:** P95 Latency < 80ms
- **Errors:** 0.00%
- **Status:** PASS

## Observations
The outbox relay gracefully handles traffic spikes during the 100 arrivals/s pharmacy simulation, preventing database lock contention. The target P95 latency of < 500ms across all endpoints was successfully maintained.
