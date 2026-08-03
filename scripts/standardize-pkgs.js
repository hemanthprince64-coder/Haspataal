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

const tsconfigTemplate = {
  extends: '../../tsconfig.json',
  compilerOptions: {
    outDir: 'dist',
    strict: true,
  },
  include: ['**/*.ts'],
  exclude: ['node_modules', 'dist'],
};

const packageJsonUpdates = {
  main: './index.ts',
  types: './index.ts',
  scripts: {
    build: 'tsc',
    lint: 'eslint .',
    test: 'vitest run',
  },
};

const vitestConfigTemplate = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
`;

const readmeTemplate = (pkgName) => `# @haspataal/${pkgName}

Domain package for ${pkgName}.

## Responsibilities
- 

## Boundaries
- Do not import from applications (apps/)
- Do not import UI components
`;

for (const pkg of packages) {
  const pkgDir = path.join('packages', pkg);

  if (!fs.existsSync(pkgDir)) {
    fs.mkdirSync(pkgDir, { recursive: true });
  }

  // 1. tsconfig.json
  const tsconfigPath = path.join(pkgDir, 'tsconfig.json');
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigTemplate, null, 2));

  // 2. package.json
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  let pkgJson = {};
  if (fs.existsSync(pkgJsonPath)) {
    pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  } else {
    pkgJson = { name: `@haspataal/${pkg}`, version: '1.0.0' };
  }

  pkgJson.main = packageJsonUpdates.main;
  pkgJson.types = packageJsonUpdates.types;
  pkgJson.scripts = { ...pkgJson.scripts, ...packageJsonUpdates.scripts };

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

  // 3. vitest.config.ts
  const vitestPath = path.join(pkgDir, 'vitest.config.ts');
  if (!fs.existsSync(vitestPath)) {
    fs.writeFileSync(vitestPath, vitestConfigTemplate);
  }

  // 4. README.md
  const readmePath = path.join(pkgDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, readmeTemplate(pkg));
  }

  // 5. index.ts
  const indexPath = path.join(pkgDir, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, '// Public API surface\n');
  }
}

console.log('Standardized package configurations.');
