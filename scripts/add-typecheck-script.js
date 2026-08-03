const fs = require('fs');
const path = require('path');

const packages = [
  'auth',
  'orders',
  'encounter',
  'consultation',
  'timeline',
  'laboratory',
  'radiology',
];

for (const pkg of packages) {
  const pkgDir = path.join('packages', pkg);
  const pkgJsonPath = path.join(pkgDir, 'package.json');

  if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    pkgJson.scripts = pkgJson.scripts || {};
    pkgJson.scripts.typecheck = 'tsc --noEmit';
    pkgJson.scripts.lint = 'eslint .';
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
    console.log(`Updated scripts for ${pkg}`);
  }
}
