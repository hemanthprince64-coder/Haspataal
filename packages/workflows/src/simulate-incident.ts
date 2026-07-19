import { prisma } from '@haspataal/db';

import { IncidentWorkflow } from './incident-lifecycle';

async function run() {
  console.log('Simulating Incident Workflow...');

  const incident = await prisma.incident.create({
    data: {
      title: 'API Gateway Down',
      description: 'Gateway is returning 502 Bad Gateway',
      severity: 'CRITICAL',
      component: 'GATEWAY',
      status: 'DETECTED',
    },
  });

  console.log(`Created Incident: ${incident.id} - ${incident.status}`);

  // Transition: DETECTED -> ASSIGNED
  console.log('\nTransitioning: DETECTED -> ASSIGNED');
  const result1 = await IncidentWorkflow.transition(
    'INCIDENT',
    incident.id,
    'DETECTED',
    'ASSIGN',
    'Ops team notified',
    { id: 'admin-1', role: 'PLATFORM_ADMIN' },
    { assignedTo: 'on-call-ops' },
    'DETECTED', // expectedState
    async (entityId, newState, tx) => {
      await tx.incident.update({
        where: { id: entityId },
        data: { status: newState, assignedTo: 'on-call-ops' },
      });
    },
  );

  console.log('Result 1:', result1.success ? 'Success' : result1.error);

  // Check Workflow Metric
  const metrics = await prisma.workflowMetric.findMany({
    where: { entityId: incident.id },
  });

  console.log(`\nGenerated ${metrics.length} WorkflowMetric records.`);
  metrics.forEach((m) => {
    console.log(`- Metric ID: ${m.id}`);
    console.log(
      `  durationMs: ${m.durationMs}, waitTimeMs: ${m.waitTimeMs}, executionTimeMs: ${m.executionTimeMs}`,
    );
    console.log(`  finalStatus: ${m.finalStatus}`);
  });

  // Clean up
  await prisma.workflowMetric.deleteMany({ where: { entityId: incident.id } });
  await prisma.platformTimelineEvent.deleteMany({ where: { entityId: incident.id } });
  await prisma.auditLog.deleteMany({ where: { entityId: incident.id } });
  await prisma.incident.delete({ where: { id: incident.id } });

  console.log('\nCleanup Complete.');
}

run()
  .catch(console.error)
  .finally(() => process.exit(0));
