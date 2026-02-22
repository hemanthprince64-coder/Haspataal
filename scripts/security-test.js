const { SignJWT } = require('jose');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

// The same secret used in lib/session.ts
const secretKey = process.env.SESSION_SECRET || 'default-secret-key-change-me-in-prod-1234567890';
const key = new TextEncoder().encode(secretKey);

async function generateMockToken(payload) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return await new SignJWT({ ...payload, expiresAt })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);
}

async function runSecurityTests() {
    console.log('--- STARTING SECURITY ROUTE TESTS ---');
    console.log('Ensure Next.js server is running on http://localhost:3000\n');

    let passed = 0;
    let failed = 0;
    const baseUrl = 'http://localhost:3000';

    const test = async (name, url, cookieStr, expectRedirectTo) => {
        try {
            const res = await fetch(url, {
                headers: cookieStr ? { 'Cookie': cookieStr } : {},
                redirect: 'manual' // crucial to catch 307s from Next.js server blocks
            });

            if (res.status === 307 || res.status === 302 || res.status === 303) {
                const location = res.headers.get('location');
                if (location && location.includes(expectRedirectTo)) {
                    console.log(`✅ PASS: ${name} (Redirected securely to ${location})`);
                    passed++;
                } else {
                    console.error(`❌ FAIL: ${name} (Redirected to unexpected ${location})`);
                    failed++;
                }
            } else if (res.status >= 400 && expectRedirectTo === '403') {
                console.log(`✅ PASS: ${name} (Blocked with ${res.status})`);
                passed++;
            } else if (res.status === 200 && expectRedirectTo === '200') {
                console.log(`✅ PASS: ${name} (Allowed access with 200)`);
                passed++;
            } else {
                console.error(`❌ FAIL: ${name} (Received status ${res.status} instead of expected)`);
                failed++;
            }
        } catch (e) {
            console.error(`❌ ERROR: ${name} (${e.message})`);
            failed++;
        }
    };

    // 1. Unauthenticated to Admin
    await test('Unauthenticated access to Admin', `${baseUrl}/admin/dashboard`, null, '/admin');

    // 2. Patient token to Admin Dashboard
    const patientToken = await generateMockToken({ user: { id: 'p1', role: 'PATIENT', name: 'Frank' } });
    // Assuming patient auth cookie maps to session_admin somehow by attacker renaming cookie name
    await test('Patient Role accessing Admin', `${baseUrl}/admin/dashboard`, `session_admin=${patientToken}`, '/admin');

    // 3. Hospital Admin token to Admin Dashboard
    const prisma = new PrismaClient();
    const firstHospital = await prisma.hospital.findFirst();
    const realHospitalId = firstHospital ? firstHospital.id : '123';
    await prisma.$disconnect();

    const hospToken = await generateMockToken({ user: { id: 'h1', role: 'HOSPITAL_ADMIN', name: 'Hosp', hospitalId: realHospitalId } });
    await test('Hospital Admin accessing Platform Admin', `${baseUrl}/admin/dashboard`, `session_admin=${hospToken}`, '/admin');

    // 4. Patient token to Hospital Dashboard
    await test('Patient accessing Hospital Dashboard', `${baseUrl}/hospital/dashboard`, `session_user=${patientToken}`, '/hospital/login');

    // 5. Valid Hospital Admin to Hospital Dashboard
    await test('Valid Hospital Admin access', `${baseUrl}/hospital/dashboard`, `session_user=${hospToken}`, '200');

    // 6. Expired Token Simulation (we forge one expired 1 hour ago)
    const expiredToken = await new SignJWT({ user: { id: 'h1', role: 'HOSPITAL_ADMIN' } })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
        .sign(key);
    await test('Expired Session Token', `${baseUrl}/hospital/dashboard`, `session_user=${expiredToken}`, '/hospital/login');

    console.log(`\n--- TEST RESULTS: ${passed} Passed, ${failed} Failed ---`);
    if (failed > 0) process.exit(1);
}

runSecurityTests();
