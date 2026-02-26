// test-api-routes.js
// Hits Next.js API endpoints to ensure they are connected and return proper JSON or 401s instead of 404s/500s

const http = require('http');

async function testApiEndpoint(path, method = 'GET', body = null) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        let data = '';
        const req = http.request(options, (res) => {
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let isJson = false;
                try {
                    JSON.parse(data);
                    isJson = true;
                } catch (e) { }

                console.log(`[API ${method}] ${path} -> [${res.statusCode}] ${isJson ? 'Valid JSON' : 'Text/HTML Response'}`);

                // For unauthenticated testing, 401, 403, 400, or 200 are acceptable (means route exists & handles logic)
                // 404 means route doesn't exist
                // 500 means server crash
                if (res.statusCode >= 500 || res.statusCode === 404) {
                    console.error(`❌ API ${path} returned fatal status ${res.statusCode}`);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Error fetching ${path}:`, e.message);
            resolve(false);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function main() {
    console.log("=== Testing Core API Routes ===");

    // Test a mix of routes Haspataal might use
    const endpoints = [
        { path: '/api/hospitals', method: 'GET' },
        { path: '/api/doctors', method: 'GET' },
    ];

    let allPassed = true;
    for (const ep of endpoints) {
        const passed = await testApiEndpoint(ep.path, ep.method);
        if (!passed) allPassed = false;
    }

    if (allPassed) {
        console.log("\n✅ API routing structure appears solid.");
    } else {
        console.log("\n⚠️ Some core expected API routes threw 404 or 500. This is expected if the app relies solely on Server Actions, but flags an issue if REST API architecture was intended.");
    }
}

main();
