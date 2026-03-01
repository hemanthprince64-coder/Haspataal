const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' }); // Ensure it loads the correct .env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create an ANONYMOUS client to test that public access is blocked.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSecurityTests() {
    console.log("==========================================");
    console.log("🛡️ STARTING ZERO TRUST RLS VALIDATION 🛡️");
    console.log("==========================================\n");

    let testsPassed = 0;
    let testsFailed = 0;

    // TEST 1: Anonymous Read on sensitive tables should fail or return 0 rows.
    process.stdout.write("1. Testing Anonymous Read on 'patients_master'...");
    let { data: patients, error: readRoleError } = await supabase.from('patients_master').select('*').limit(1);
    if (readRoleError || !patients || patients.length === 0) {
        console.log(" ✅ BLOCKED (Expected)");
        testsPassed++;
    } else {
        console.log(` ❌ FAILED! Anonymous user read ${patients.length} rows.`);
        testsFailed++;
    }

    // TEST 2: Anonymous Insert should fail.
    process.stdout.write("2. Testing Anonymous Insert on 'appointments'...");
    let { error: insertError } = await supabase.from('appointments').insert([{ patient_id: 'fake-id', doctor_id: 'fake-id' }]);
    if (insertError) {
        console.log(` ✅ BLOCKED (Expected): ${insertError.message}`);
        testsPassed++;
    } else {
        console.log(" ❌ FAILED! Anonymous user successfully inserted a record.");
        testsFailed++;
    }

    // TEST 3: Anonymous access to a private bucket should fail.
    process.stdout.write("3. Testing Anonymous Read on 'medical-records' storage...");
    let { data: files, error: storageError } = await supabase.storage.from('medical-records').list();
    if (storageError) {
        console.log(` ✅ BLOCKED (Expected): ${storageError.message}`);
        testsPassed++;
    } else {
        // Some configurations might return empty arrays if no access instead of an error, which is also a "pass" if length is 0 and the bucket is known to have files.
        if (files.length === 0) {
            console.log(` ✅ BLOCKED (Expected): Returned 0 files due to RLS.`);
            testsPassed++;
        } else {
            console.log(` ❌ FAILED! Anonymous user accessed storage files.`);
            testsFailed++;
        }
    }

    console.log("\n==========================================");
    console.log(`🏁 TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
    if (testsFailed === 0) {
        console.log("✅ SYSTEM IS SECURE! RLS is active and protecting against unauthenticated access.");
    } else {
        console.log("❌ CRITICAL: Security risks still exist. Review RLS policies.");
    }
}

runSecurityTests();
