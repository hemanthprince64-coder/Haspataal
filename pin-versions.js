const fs = require('fs');
const path = require('path');

function getAllPackageJsons(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        getAllPackageJsons(filePath, fileList);
      }
    } else if (file === 'package.json') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function pinVersions(packageJsonPath, packageLockJsonPath) {
  if (!fs.existsSync(packageJsonPath)) return;
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Always use the root package-lock.json for pinning to ensure consistency
  const packageLockJson = JSON.parse(fs.readFileSync(packageLockJsonPath, 'utf8'));

  const pin = (deps) => {
    if (!deps) return;
    for (const [name, version] of Object.entries(deps)) {
      if (typeof version === 'string' && (version.startsWith('^') || version.startsWith('~'))) {
        let lockedVersion = null;

        // Try to find in root package-lock.json packages (npm v7+)
        if (packageLockJson.packages) {
          // Check direct dependencies of root
          if (packageLockJson.packages[`node_modules/${name}`]) {
            lockedVersion = packageLockJson.packages[`node_modules/${name}`].version;
          }
          // Search in all packages if not found directly
          else {
            for (const pkgPath in packageLockJson.packages) {
              if (pkgPath.endsWith(`node_modules/${name}`)) {
                lockedVersion = packageLockJson.packages[pkgPath].version;
                break;
              }
            }
          }
        }

        if (lockedVersion) {
          deps[name] = lockedVersion;
        }
      }
    }
  };

  pin(packageJson.dependencies);
  pin(packageJson.devDependencies);

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Pinned: ${packageJsonPath}`);
}

const rootDir = process.cwd();
const lockFile = path.join(rootDir, 'package-lock.json');
const allPackageJsons = getAllPackageJsons(rootDir);

allPackageJsons.forEach((pj) => {
  pinVersions(pj, lockFile);
});

console.log('\nAll package.json files pinned successfully!');
