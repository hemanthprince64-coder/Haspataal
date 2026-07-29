const fs = require('fs');

const path = 'tests/integration/phase4-consumers.integration.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/assert\.ok\((.*?) > (.*?)\);/g, 'expect($1).toBeGreaterThan($2);');
code = code.replace(
  /assert\.ok\((.*?) !== undefined && \1 !== null\);/g,
  'expect($1).toBeDefined();',
);
code = code.replace(/assert\.strictEqual\((.*?), null\);/g, 'expect($1).toBeNull();');
code = code.replace(/assert\.strictEqual\((.*?), (.*?)\);/g, 'expect($1).toBe($2);');
code = code.replace(/assert\.deepStrictEqual\((.*?), (.*?)\);/g, 'expect($1).toEqual($2);');
code = code.replace(
  /await assert\.rejects\(async \(\) => \{ await (.*?) \}, new Error\((.*?)\)\);/g,
  'await expect($1).rejects.toThrow($2);',
);

code = code.replace(
  /const originalHandle = (.*?)\.(.*?);\s*\1\.\2 = async \(\) => \{ \1\.\2 = originalHandle; throw new Error\((.*?)\); \};/g,
  "const spy = vi.spyOn($1, '$2').mockRejectedValueOnce(new Error($3));",
);

fs.writeFileSync(path, code);
