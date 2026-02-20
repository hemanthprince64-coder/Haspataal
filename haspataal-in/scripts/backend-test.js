const API_URL = 'http://localhost:3001/api/hospital';

async function runTests() {
    console.log('🚀 Starting Haspataal Backend Auth Stabilization Tests\n');

    let jwtToken = '';
    const uniqueSuffix = Date.now().toString().slice(-6);
    const mockMobile = `99${uniqueSuffix}12`;
    const password = 'TestPassword123!';

    // STEP 1: Register Hospital
    console.log('--- STEP 1: Register Hospital ---');
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hospital_name: `Test Hospital ${uniqueSuffix}`,
                mobile: mockMobile,
                password: password,
                city: 'Test City'
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('❌ Registration Failed:', data.error || data);
            return;
        }

        console.log('✅ Registration Successful!');
        console.log(`   Hospital ID: ${data.hospital_id}`);
        console.log(`   User ID: ${data.user_id}\n`);
    } catch (err) {
        console.error('❌ Registration HTTP Error:', err.message);
        return;
    }

    // STEP 2: Login
    console.log('--- STEP 2: Login Hospital Admin ---');
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: mockMobile,
                password: password
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('❌ Login Failed:', data.error || data);
            return;
        }

        jwtToken = data.token;
        console.log('✅ Login Successful!');
        console.log(`   JWT Token Received: ${jwtToken.substring(0, 30)}...\n`);
    } catch (err) {
        console.error('❌ Login HTTP Error:', err.message);
        return;
    }

    // STEP 3: Protected Route Test
    console.log('--- STEP 3: Test Protected Dashboard Route ---');
    try {
        const res = await fetch(`${API_URL}/dashboard-test`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        const resText = await res.text();
        let data;
        try {
            data = JSON.parse(resText);
        } catch (e) {
            console.error('❌ Protected Route didn\'t return JSON. Raw Response:');
            console.error(resText.substring(0, 1500));
            return;
        }

        if (!res.ok) {
            console.error('❌ Protected Route Failed:', data.error || data);
            return;
        }

        console.log('✅ Protected Route Access Granted!');
        console.log(`   Returned Data:`);
        console.log(`   - Hospital Name: ${data.hospital_name}`);
        console.log(`   - Total Users: ${data.users_count}`);
        console.log(`   - Total Patients: ${data.patients_count}`);
        console.log(`   - Role: ${data.user_role}\n`);
    } catch (err) {
        console.error('❌ Protected Route HTTP Error:', err.message);
        return;
    }

    console.log('🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!');
}

runTests();
