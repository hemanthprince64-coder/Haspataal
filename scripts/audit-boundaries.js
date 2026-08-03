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

let hasErrors = false;

function scanDirectory(dir, pkgName) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        scanDirectory(fullPath, pkgName);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // 1. domain -> app imports
        if (
          importPath.includes('apps/') ||
          (importPath.startsWith('@haspataal/') && importPath.includes('apps'))
        ) {
          console.error(`[ERROR] ${pkgName} (${fullPath}): imports from app -> ${importPath}`);
          hasErrors = true;
        }

        // 2. domain -> UI imports
        if (importPath === '@haspataal/ui' || importPath.includes('/ui/')) {
          console.error(`[ERROR] ${pkgName} (${fullPath}): imports UI component -> ${importPath}`);
          hasErrors = true;
        }

        // 3. deep imports across package boundaries
        if (importPath.startsWith('@haspataal/') && importPath.split('/').length > 2) {
          console.error(`[ERROR] ${pkgName} (${fullPath}): deep import -> ${importPath}`);
          hasErrors = true;
        }
      }
    }
  }
}

for (const pkg of packages) {
  const pkgDir = path.join('packages', pkg);
  if (fs.existsSync(pkgDir)) {
    scanDirectory(pkgDir, pkg);
  }
}

if (!hasErrors) {
  console.log(
    'Package boundary audit passed! No app imports, UI imports, or deep imports found in the target packages.',
  );
} else {
  process.exit(1);
}
