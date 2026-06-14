const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const originalSchemaPath = path.join(rootDir, 'packages', 'db', 'prisma', 'schema.prisma');
const sqliteSchemaPath = path.join(rootDir, 'packages', 'db', 'prisma', 'schema.sqlite.prisma');

function prepareSchema() {
  const provider = process.env.DATABASE_PROVIDER || 'postgres';

  if (provider !== 'sqlite') {
    console.log('[prepare-schema] DATABASE_PROVIDER is not sqlite. Skipping SQLite schema generation.');
    // Ensure that if a schema.sqlite.prisma exists, we delete it to avoid confusion
    if (fs.existsSync(sqliteSchemaPath)) {
      try {
        fs.unlinkSync(sqliteSchemaPath);
      } catch (err) {
        // Ignore
      }
    }
    return;
  }

  console.log('[prepare-schema] Generating SQLite-compatible Prisma schema...');

  if (!fs.existsSync(originalSchemaPath)) {
    console.error(`[prepare-schema] Error: Original schema not found at ${originalSchemaPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(originalSchemaPath, 'utf8');

  // 1. Change datasource provider from postgresql to sqlite
  content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');

  // 2. Remove directUrl configuration which is not supported by sqlite
  content = content.replace(/directUrl\s*=\s*env\("[^"]*"\)/g, '');

  // 3. Find all model names so we can distinguish between relation lists and scalar lists
  const modelRegex = /model\s+(\w+)\s*\{/g;
  const models = new Set();
  let modelMatch;
  while ((modelMatch = modelRegex.exec(content)) !== null) {
    models.add(modelMatch[1]);
  }

  // 4. Find and remove all enum declarations, collecting their names
  const enumRegex = /enum\s+(\w+)\s*\{([\s\S]*?)\}/g;
  const enums = new Set();
  let enumMatch;
  while ((enumMatch = enumRegex.exec(content)) !== null) {
    enums.add(enumMatch[1]);
  }
  content = content.replace(enumRegex, '');

  // 5. Replace all enum types with String in the models
  for (const enumName of enums) {
    // Match the type declaration: "fieldName EnumName" or "fieldName EnumName?" or "fieldName EnumName[]"
    // Prisma types are: Type, Type?, Type[]
    const typeRegex = new RegExp(`(\\s+)${enumName}(\\s+|\\b|\\?)`, 'g');
    content = content.replace(typeRegex, '$1String$2');
  }

  // 6. Replace enum defaults like @default(PENDING) with string literals like @default("PENDING")
  // Exclude boolean/now/functions defaults: @default(true), @default(false), @default(now()), @default(uuid()), @default(cuid())
  // Also exclude numeric defaults: @default(1001)
  content = content.replace(/@default\((?!true|false|now|uuid|cuid|autoincrement)([A-Za-z0-9_]+)\)/g, (match, val) => {
    if (/^\d+$/.test(val)) {
      return `@default(${val})`; // Keep numeric defaults unquoted
    }
    return `@default("${val}")`; // Wrap string enums in quotes
  });

  // 7. Convert all scalar lists (like String[]) and enum lists (now String[]) to String?
  // We identify lists of types not present in the 'models' Set (i.e. relation lists)
  // And strip any @default([])
  const listRegex = /(\s+)(\w+)\[\](\s+@default\([^)]*\))?/g;
  content = content.replace(listRegex, (match, space, typeName, defaultAttr) => {
    if (models.has(typeName)) {
      return match; // Keep relation lists intact (e.g. Appointment[])
    }
    return `${space}String?`; // Convert scalar/enum lists to String?
  });

  // 8. Convert Json and Json? types to String? (since SQLite connector in Prisma does not support Json)
  // Also strip default value attributes for Json (e.g. @default("{}") or @default("[]"))
  content = content.replace(/\bJson\??(\s+@default\([^)]*\))?/g, 'String?');

  // 9. Strip PostgreSQL-specific annotations: @db.Date, @db.Uuid, @db.VarChar(...), @db.Text etc.
  content = content.replace(/@db\.[a-zA-Z0-9_]+(\([^)]*\))?/g, '');

  // Write the updated SQLite-compatible schema to packages/db/prisma/schema.sqlite.prisma
  fs.writeFileSync(sqliteSchemaPath, content, 'utf8');
  console.log(`[prepare-schema] SQLite schema successfully written to ${sqliteSchemaPath}`);
}

if (require.main === module) {
  prepareSchema();
}

module.exports = { prepareSchema };
