const http = require('http');

async function testRoute(path, expectedStatusRegex) {
    return new Promise((resolve) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            const statusMatch = expectedStatusRegex.test(res.statusCode.toString());
            console.log(`GET ${path} -> ${res.statusCode} ${statusMatch ? '✅' : '❌'}`);
            if (!statusMatch) {
                console.error(`❌ Route ${path} failed protection test. Expected match for ${expectedStatusRegex}`);
                process.exit(1);
            }
            resolve();
        }).on('error', (e) => {
            console.error(`Error fetching ${path}:`, e.message);
            process.exit(1);
        });
    });
}

async function main() {
    console.log("=== Testing Route Protections (Without Auth) ===");

    // Protected routes should redirect (307 Temporary Redirect usually in Next.js middleware)
    await testRoute('/admin/dashboard', /^30/);
    await testRoute('/hospital/dashboard', /^30/);
    await testRoute('/agent/dashboard', /^30/);
    await testRoute('/profile', /^30/);

    // Public routes should return 200
    await testRoute('/', /^200$/);
    await testRoute('/search', /^200$/);
    await testRoute('/hospitals', /^200$/);

    console.log("\n✅ Middleware Route Protection Verified.");
}

main();
