const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function archiveFile(sourceFile, archiveDir, archiveName) {
  const sourcePath = path.join(rootDir, sourceFile);
  const targetDir = path.join(rootDir, 'openspec', 'archive', archiveDir);
  const targetPath = path.join(targetDir, archiveName || path.basename(sourceFile));

  if (fs.existsSync(sourcePath)) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.copyFileSync(sourcePath, targetPath);
    fs.unlinkSync(sourcePath);
    console.log(`Archived ${sourceFile} to ${targetPath}`);
  }
}

// 1. CLAUDE.md -> Archive (it's completely duplicated in MEMORY.md)
archiveFile('CLAUDE.md', 'legacy');

// 2. ARCHITECTURE_REPORT.md -> architecture.md
const archReportPath = path.join(rootDir, 'ARCHITECTURE_REPORT.md');
const archPath = path.join(rootDir, 'architecture.md');
if (fs.existsSync(archReportPath) && fs.existsSync(archPath)) {
  const archReportContent = fs.readFileSync(archReportPath, 'utf8');
  fs.appendFileSync(archPath, '\n\n## Content from ARCHITECTURE_REPORT.md\n\n' + archReportContent);
  archiveFile('ARCHITECTURE_REPORT.md', 'reports');
}

// 3. API.md -> docs/api-reference.md
const apiPath = path.join(rootDir, 'API.md');
const apiRefPath = path.join(rootDir, 'docs', 'api-reference.md');
if (fs.existsSync(apiPath) && fs.existsSync(apiRefPath)) {
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  const apiRefContent = fs.readFileSync(apiRefPath, 'utf8');
  // API.md has better structure, we'll put apiRefContent (the list of endpoints) at the end of it
  const newApiRefContent = apiContent + '\n\n' + apiRefContent;
  fs.writeFileSync(apiRefPath, newApiRefContent);
  archiveFile('API.md', 'legacy');
}

// 4. PHASE_0A_CHANGELOG.md -> CHANGELOG.md
const phaseChangelogPath = path.join(rootDir, 'PHASE_0A_CHANGELOG.md');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');
if (fs.existsSync(phaseChangelogPath) && fs.existsSync(changelogPath)) {
  const phaseContent = fs.readFileSync(phaseChangelogPath, 'utf8');
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');

  // Phase 0A content is actually already in CHANGELOG.md? Let's check... wait, it's not in CHANGELOG.md exactly.
  // We'll just prepend it below the header.
  const header =
    '# Changelog\n\n## Engineering History\n\nAll notable changes to the Haspataal platform are documented in this file.\n\n';
  const rest = changelogContent.replace(header, '');
  const newChangelog =
    header + phaseContent.replace('# Phase 0A: Changelog\n\n', '') + '\n\n' + rest;

  fs.writeFileSync(changelogPath, newChangelog);
  archiveFile('PHASE_0A_CHANGELOG.md', 'phase0a');
}
