/**
 * Haspataal Load Test — Pre-Production Validation
 * Simulates concurrent booking, dashboard, and analytics loads.
 * Run: node scripts/load-test.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function timedFetch(label, url, options = {}) {
    const start = Date.now();
    try {
        const res = await fetch(url, { ...options, redirect: 'follow' });
        const elapsed = Date.now() - start;
        const status = res.status;
        return { label, status, elapsed, ok: res.ok };
    } catch (err) {
        const elapsed = Date.now() - start;
        return { label, status: 'ERR', elapsed, ok: false, error: err.message };
    }
}

async function runConcurrent(label, url, count) {
    console.log(`\n⏱  ${label}: ${count} concurrent requests to ${url}`);
    const promises = Array.from({ length: count }, (_, i) =>
        timedFetch(`${label}#${i + 1}`, url)
    );
    const results = await Promise.all(promises);

    const ok = results.filter(r => r.ok).length;
    const fail = results.filter(r => !r.ok).length;
    const times = results.map(r => r.elapsed);
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const max = Math.max(...times);
    const min = Math.min(...times);
    const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

    console.log(`   ✅ Success: ${ok}/${count}  ❌ Fail: ${fail}/${count}`);
    console.log(`   Avg: ${avg}ms | Min: ${min}ms | Max: ${max}ms | P95: ${p95}ms`);

    return { label, ok, fail, avg, min, max, p95, total: count };
}

async function main() {
    console.log('═══════════════════════════════════════');
    console.log('  HASPATAAL LOAD TEST — PRE-PRODUCTION');
    console.log('═══════════════════════════════════════');
    console.log(`  Target: ${BASE_URL}`);
    console.log(`  Time: ${new Date().toISOString()}`);

    const results = [];

    // Phase 1: Patient booking pages
    results.push(await runConcurrent('Patient Home', `${BASE_URL}/home`, 100));
    results.push(await runConcurrent('Doctor Search', `${BASE_URL}/search`, 100));
    results.push(await runConcurrent('Booking Page', `${BASE_URL}/book/dr-sharma-123`, 50));

    // Phase 2: Doctor/Hospital dashboards
    results.push(await runConcurrent('Hospital Dashboard', `${BASE_URL}/hospital/dashboard`, 50));
    results.push(await runConcurrent('Admin Dashboard', `${BASE_URL}/admin/dashboard`, 25));

    // Phase 3: API endpoints (if available)
    results.push(await runConcurrent('API Health', `${BASE_URL}/api/health`, 50));

    // Summary
    console.log('\n═══════════════════════════════════════');
    console.log('  LOAD TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('  Route                  | OK   | Fail | Avg   | P95   | Max');
    console.log('  ─────────────────────────────────────────────────────────');
    for (const r of results) {
        const name = r.label.padEnd(22);
        console.log(`  ${name} | ${String(r.ok).padEnd(4)} | ${String(r.fail).padEnd(4)} | ${String(r.avg + 'ms').padEnd(5)} | ${String(r.p95 + 'ms').padEnd(5)} | ${r.max}ms`);
    }

    const totalSuccess = results.reduce((a, r) => a + r.ok, 0);
    const totalFail = results.reduce((a, r) => a + r.fail, 0);
    const overallAvg = Math.round(results.reduce((a, r) => a + r.avg, 0) / results.length);

    console.log('');
    console.log(`  Total: ${totalSuccess} OK / ${totalFail} FAIL`);
    console.log(`  Overall Avg Response: ${overallAvg}ms`);

    if (totalFail === 0 && overallAvg < 2000) {
        console.log('\n  🟢 VERDICT: PERFORMANCE ACCEPTABLE');
    } else if (overallAvg < 5000) {
        console.log('\n  🟡 VERDICT: PERFORMANCE MARGINAL — optimize slow routes');
    } else {
        console.log('\n  🔴 VERDICT: PERFORMANCE CRITICAL — do not deploy');
    }
}

main().catch(console.error);
