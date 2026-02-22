/**
 * validate-services.js
 * Validates the services export structure to prevent runtime errors.
 * Run: node scripts/validate-services.js
 */

// We can't import ESM directly in a CommonJS script, so we validate by parsing
// the source file for expected function definitions.

const fs = require('fs');
const path = require('path');

const SERVICES_FILE = path.join(__dirname, '..', 'lib', 'services.js');

console.log('=== PLATFORM SERVICES VALIDATION ===\n');

// Read the services file
let source;
try {
    source = fs.readFileSync(SERVICES_FILE, 'utf-8');
    console.log(`✅ services.js found at: ${SERVICES_FILE}`);
} catch (err) {
    console.error(`❌ CRITICAL: Cannot read services.js: ${err.message}`);
    process.exit(1);
}

// Required platform methods
const REQUIRED_PLATFORM_METHODS = [
    'getCities',
    'getHospitals',
    'getHospitalsByCity',
    'searchDoctors',
    'getDoctorById',
    'getHospitalById',
    'getAllSpecialities',
    'getHospitalDoctors',
    'getHospitalReviews',
];

let failures = 0;

for (const method of REQUIRED_PLATFORM_METHODS) {
    // Check for method definition patterns like: `methodName:` or `methodName :`
    const pattern = new RegExp(`\\b${method}\\s*[:=]`);
    if (pattern.test(source)) {
        console.log(`✅ platform.${method} — FOUND`);
    } else {
        console.error(`❌ platform.${method} — MISSING`);
        failures++;
    }
}

// Check that 'platform' is a key in the services object
if (/platform\s*:\s*\{/.test(source)) {
    console.log(`✅ services.platform object — FOUND`);
} else {
    console.error(`❌ services.platform object — MISSING`);
    failures++;
}

console.log('');

if (failures > 0) {
    console.error(`❌ VALIDATION FAILED: ${failures} missing method(s)`);
    process.exit(1);
} else {
    console.log('✅ PLATFORM SERVICES VERIFIED — All methods present');
    console.log('PLATFORM SERVICES VERIFIED');
}
