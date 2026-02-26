const http = require('http');

async function testApi(path, method = 'GET', body = null) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[API ${method}] ${path} -> ${res.statusCode}`);
                if (res.statusCode >= 500) {
                    console.error(`❌ API ${path} returned 500 Server Error:`, data);
                    resolve({ success: false });
                } else {
                    resolve({ success: true, status: res.statusCode, data });
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Error fetching ${path}:`, e.message);
            resolve({ success: false });
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function main() {
    console.log("=== Testing Public Frontend API Routes ===");

    // We shouldn't hit real DB errors on basic queries
    let failed = 0;

    // Just testing if the page routing is stable, Haspataal uses server actions mostly.
    // So we'll hit the frontend pages to verify they don't 500 SSR crash.
    const pagesToTest = [
        '/',
        '/search',
        '/hospitals',
        '/login',
        '/hospital',
        '/hospital/login',
        '/hospital/register',
        '/doctor/register',
        '/agent/login',
        '/agent/register',
    ];

    for (const page of pagesToTest) {
        const result = await testApi(page);
        if (!result.success || result.status !== 200) {
            console.error(`❌ Page ${page} failed to load properly. Status: ${result.status}`);
            failed++;
        }
    }

    if (failed > 0) {
        console.error(`\n❌ ${failed} frontend routes returned non-200 or 500 errors.`);
        process.exit(1);
    } else {
        console.log("\n✅ All core SSR pages load successfully without 500 errors.");
    }
}

main();
