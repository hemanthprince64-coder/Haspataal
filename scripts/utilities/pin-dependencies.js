const fs = require('fs');
const path = require('path');

function pinDependencies(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let updated = false;

  ['dependencies', 'devDependencies'].forEach((depType) => {
    if (packageJson[depType]) {
      Object.keys(packageJson[depType]).forEach((dep) => {
        const version = packageJson[depType][dep];
        // If it starts with ^ or ~, replace with the exact version
        if (version.startsWith('^') || version.startsWith('~')) {
          packageJson[depType][dep] = version.substring(1);
          updated = true;
        }
      });
    }
  });

  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Pinned dependencies in ${packageJsonPath}`);
  }
}

// Pin root package.json
pinDependencies(path.join(__dirname, '../package.json'));

// Pin api-gateway package.json
const apiGatewayPath = path.join(__dirname, '../api-gateway/package.json');
if (fs.existsSync(apiGatewayPath)) {
  pinDependencies(apiGatewayPath);
}

console.log('Dependency pinning complete.');
