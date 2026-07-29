const fs = require('fs');
const content = `

# AI Agent & IDE Directories
.agent/
.agents/
.amazonq/
.augment/
.bob/
.claude/
.cline/
.clinerules/
.codebuddy/
.codex/
.continue/
.cospec/
.crush/
.cursor/
.factory/
.forge/
.gemini/
.iflow/
.junie/
.kilo/
.kilocode/
.kiro/
.lingma/
.metagpt/
.opencode/
.pi/
.planning/
.qoder/
.qwen/
.roo/
.trae/
.windsurf/
`;
fs.appendFileSync('.gitignore', content);
