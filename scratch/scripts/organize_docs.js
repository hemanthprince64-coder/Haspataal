const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

const fileMapping = {
  // manuals
  'ADMIN.md': 'docs/manuals',
  'HMS.md': 'docs/manuals',
  'DOCTOR.md': 'docs/manuals',
  'PATIENT.md': 'docs/manuals',

  // architecture
  'architecture.md': 'docs/architecture',
  'api-map.md': 'docs/architecture',
  'database-map.md': 'docs/architecture',
  'dependency-graph.md': 'docs/architecture',
  'CURRENT_REPOSITORY_ARCHITECTURE_MAP.md': 'docs/architecture',
  'EVENT_TOPOLOGY_MAP.md': 'docs/architecture',
  'routes.md': 'docs/architecture',
  'DATABASE.md': 'docs/architecture',
  'CANONICAL_EVENT_CONTRACT.md': 'docs/architecture',
  'DLQ_STATE_MODEL.md': 'docs/architecture',
  'EVENT_CONTRACT_REGISTER.md': 'docs/architecture',
  'OUTBOX_CONSUMER_INVENTORY.md': 'docs/architecture',
  'OUTBOX_PRODUCER_INVENTORY.md': 'docs/architecture',

  // compliance
  'DATA_OWNERSHIP_MATRIX.md': 'docs/compliance',
  'AUTHORIZATION_MATRIX.md': 'docs/compliance',
  'SECURITY.md': 'docs/compliance',
  'CLAIM_SECRET_ROTATION_RISK.md': 'docs/compliance',
  'PERFORMANCE_SECURITY_REPORT.md': 'docs/compliance',
  'RULES_SAFETY_AUDIT.md': 'docs/compliance',

  // engineering
  'CONTRIBUTING.md': 'docs/engineering',
  'DEVELOPMENT_ROADMAP.md': 'docs/engineering',
  'QA.md': 'docs/engineering/testing',
  'QA_CHECKLIST.md': 'docs/engineering/testing',
  'RELEASE_CHECKLIST.md': 'docs/engineering/testing',
  'AI.md': 'docs/engineering',
  'ANALYTICS.md': 'docs/engineering',
  'AGENT_ROUTING.md': 'docs/engineering',
  'RULES.md': 'docs/engineering',
  'TIMELINE.md': 'docs/engineering',
  'NOTIFICATION.md': 'docs/engineering',
  'CARE_JOURNEY_ENGINE.md': 'docs/engineering',
  'HMS-Diagnostics-Document-Upload-TR.md': 'docs/engineering',

  // adr
  'IDEMPOTENCY_TOPOLOGY_DECISION.md': 'docs/adr',
  'APPROVED_DECISIONS_INVARIANT_REGISTER.md': 'docs/adr',

  // operational
  'DEPLOYMENT.md': 'docs/operational/runbooks',
  'MIGRATION_PLAN.md': 'docs/operational/runbooks',

  // phase0a archive
  'PHASE_0A_MIGRATION_PLAN.md': 'openspec/archive/phase0a',
  'PHASE_0A_OPENSPEC.md': 'openspec/archive/phase0a',
  'PHASE_0A_TEST_MATRIX.md': 'openspec/archive/phase0a',
  'PHASE_0A_VERIFICATION_REPORT.md': 'openspec/archive/phase0a',
  'PHASE_0B_HANDOFF.md': 'openspec/archive/phase0a',

  // reports archive
  'PORTAL_INTEGRATION_AUDIT.md': 'openspec/archive/reports',
  'REFERRAL_PIPELINE_AUDIT.md': 'openspec/archive/reports',
  'RELAY_FAILURE_WINDOW_ANALYSIS.md': 'openspec/archive/reports',
  'TIMELINE_UNIFICATION_AUDIT.md': 'openspec/archive/reports',
  'IDENTITY_SOURCE_OF_TRUTH_AUDIT.md': 'openspec/archive/reports',
  'DISCHARGE_EVENT_PIPELINE_AUDIT.md': 'openspec/archive/reports',
  'CARE_JOURNEY_INTEGRATION_AUDIT.md': 'openspec/archive/reports',
  'CHANGE_AUDIT_REPORT.md': 'openspec/archive/reports',
  'EVENTLOG_REPAIR_REPORT.md': 'openspec/archive/reports',
  'FAILURE_INJECTION_REPORT.md': 'openspec/archive/reports',
  'P0_P1_P2_GAP_REGISTER.md': 'openspec/archive/reports',
  'PHASE6_EXECUTIVE_VERDICT.md': 'openspec/archive/reports',
  'PRIORITY_SUMMARY.md': 'openspec/archive/reports',
  'THREE_MONTH_REMEDIATION_PLAN.md': 'openspec/archive/reports',

  // legacy archive
  'LEGACY_NORMALIZATION_RULES.md': 'openspec/archive/legacy',
  'DELETION_AND_DEPRECATION_REGISTER.md': 'openspec/archive/legacy',
  'project_context.md': 'openspec/archive/legacy',

  // plans archive
  'IMPLEMENTATION_ALIGNMENT.md': 'openspec/archive/plans',
  'FINAL_IMPLEMENTATION_SEQUENCE.md': 'openspec/archive/plans',
  'TASK_BREAKDOWN.md': 'openspec/archive/plans',
  'DEPENDENCY_ORDER.md': 'openspec/archive/plans',

  // discard (these are agent logs/outputs)
  'walkthrough.md': 'scratch/archive',
};

// Execute moves
Object.entries(fileMapping).forEach(([file, targetDir]) => {
  const sourcePath = path.join(rootDir, file);
  if (fs.existsSync(sourcePath)) {
    const targetDirPath = path.join(rootDir, targetDir);
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }
    const targetPath = path.join(targetDirPath, file);
    // Use git mv if possible, else standard rename
    try {
      require('child_process').execSync(`git mv "${file}" "${targetDir}/${file}"`);
      console.log(`Git moved ${file} to ${targetDir}`);
    } catch (e) {
      fs.renameSync(sourcePath, targetPath);
      console.log(`Moved ${file} to ${targetDir} (fs.rename)`);
    }
  }
});
