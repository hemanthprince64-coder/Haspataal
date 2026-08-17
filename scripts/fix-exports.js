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
  const srcIndexPath = path.join(pkgDir, 'src', 'index.ts');
  const rootIndexPath = path.join(pkgDir, 'index.ts');

  if (fs.existsSync(srcIndexPath)) {
    fs.writeFileSync(rootIndexPath, "export * from './src';\n");
    console.log(`Updated ${pkg}/index.ts to export from ./src`);
  } else {
    // Check if there are other files in src we should export
    const srcDir = path.join(pkgDir, 'src');
    if (fs.existsSync(srcDir)) {
      const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
      let exports = '';
      for (const f of files) {
        exports += `export * from './src/${f.replace('.ts', '')}';\n`;
      }
      fs.writeFileSync(rootIndexPath, exports);
      console.log(`Updated ${pkg}/index.ts with generated exports from ./src`);
    }
  }
}
