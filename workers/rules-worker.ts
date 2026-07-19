import { prisma } from '@haspataal/db';
import { eventBus, EVENT_TYPES } from '@haspataal/events';
import { RuleRegistry, RuleCommandHandler } from '@haspataal/rules';
import { v4 as uuidv4 } from 'uuid';

import logger from '../apps/patient-portal/lib/logger';

const registry = new RuleRegistry();

// In-memory cache to prevent infinite loops (Causation Depth protection)
// If the same event triggers > 3 chained actions that trigger the same event, we drop it.
const depthTracker = new Map<string, number>();

async function onDomainEvent(event: any) {
  const correlationId = event.correlationId || uuidv4();

  // Depth tracking
  const currentDepth = depthTracker.get(correlationId) || 0;
  if (currentDepth > 10) {
    logger.warn(
      { action: 'rule_depth_exceeded', correlationId },
      'Max causation depth exceeded. Dropping event to prevent infinite loop.',
    );
    return;
  }
  depthTracker.set(correlationId, currentDepth + 1);

  try {
    // 1. Find rules that match this event type
    const rules = await registry.findByEvent(event.type, event.hospitalId);
    if (!rules || rules.length === 0) return;

    // 2. Dispatch a command for each rule to execute
    for (const rule of rules) {
      if (!rule.isActive) continue;

      const command = {
        commandId: uuidv4(),
        commandVersion: 1,
        target: 'rules',
        tenantContext: { hospitalId: event.hospitalId || 'system', branchId: 'default' },
        actorContext: { actorId: event.actorId || 'system', actorType: 'SYSTEM' },
        correlationId,
        idempotencyKey: `execute-${rule.id}-${event.id}`,
        timestamp: new Date().toISOString(),
        payload: {
          ruleId: rule.id,
          event: event.payload,
          patientId: event.payload?.patientId,
        },
      };

      try {
        await RuleCommandHandler.handleExecuteRule(command as any);
        logger.info(
          { action: 'rule_executed', ruleId: rule.id, eventType: event.type },
          'Executed rule',
        );
      } catch (err: any) {
        logger.error(
          { action: 'rule_execution_failed', ruleId: rule.id, error: err.message },
          'Failed to execute rule',
        );
      }
    }
  } catch (error: any) {
    logger.error(
      { action: 'rules_worker_failed', eventId: event.id, error: error.message },
      'Failed to process rules for event',
    );
  }
}

// Start listener
logger.info('Rules Worker Started - Listening to EventBus');

// Clean up depth tracker every hour
setInterval(
  () => {
    depthTracker.clear();
  },
  60 * 60 * 1000,
);

// Emergency Reconciliation Escalation Job (Runs hourly)
setInterval(
  async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const unresolved = await prisma.patient.findMany({
        where: {
          name: 'Unknown Emergency',
          createdAt: { lt: cutoff },
        },
      });

      for (const p of unresolved) {
        logger.warn(
          { action: 'unresolved_emergency_escalation', patientId: p.id, hospitalId: p.hospitalId },
          `SLA Breach: Emergency patient ${p.id} unresolved for >24 hours`,
        );

        await eventBus.publish({
          type: 'NOTIFICATION_SEND' as any,
          id: uuidv4(),
          hospitalId: p.hospitalId,
          actorId: 'system',
          correlationId: uuidv4(),
          timestamp: new Date().toISOString(),
          payload: {
            channel: 'WHATSAPP',
            recipient: 'SUPERVISOR_GROUP',
            message: `🚨 URGENT: Emergency patient ${p.uhid} admitted over 24 hours ago has not been reconciled. Please update demographics to unblock billing.`,
          },
        } as any);
      }
    } catch (err: any) {
      logger.error(
        { action: 'emergency_escalation_failed', error: err.message },
        'Failed to run emergency escalation job',
      );
    }
  },
  60 * 60 * 1000,
);

// Subscribe to all standard platform events
const ALL_EVENTS = Object.values(EVENT_TYPES);
for (const type of ALL_EVENTS) {
  eventBus.subscribe(type, onDomainEvent);
}
