/**
 * DEVELOPMENT / SIMULATION SCRIPT
 *
 * Not imported by production application code.
 * Used exclusively for local workflow state testing.
 */
import { v4 as uuidv4 } from 'uuid';

import { HospitalWorkflow, HospitalState } from './hospital-lifecycle';

export async function simulate() {
  console.log('--- Starting Workflow Simulation ---');

  const mockHospitalId = uuidv4();
  const actor = { id: uuidv4(), role: 'PLATFORM_ADMIN' };

  // Dummy state updater
  let currentState: HospitalState = 'CREATED';
  const updateFn = async (id: string, newState: HospitalState, _tx: any) => {
    currentState = newState;
  };

  // 1. Valid Transition
  console.log(`\n[Test 1] Valid Transition: CREATED -> START_PROFILE -> PROFILE_COMPLETION`);
  const res1 = await HospitalWorkflow.transition(
    'HOSPITAL',
    mockHospitalId,
    currentState,
    'START_PROFILE',
    'User started profile',
    actor,
    {},
    'CREATED',
    updateFn,
  );
  console.log(
    res1.success ? `✅ Success: State is now ${res1.newState}` : `❌ Failed: ${res1.error}`,
  );

  // 2. Illegal Transition (Skip states)
  console.log(`\n[Test 2] Illegal Transition: PROFILE_COMPLETION -> GO_LIVE`);
  const res2 = await HospitalWorkflow.transition(
    'HOSPITAL',
    mockHospitalId,
    currentState,
    'GO_LIVE',
    'Hack the system',
    actor,
    {},
    'PROFILE_COMPLETION',
    updateFn,
  );
  console.log(!res2.success ? `✅ Prevented: ${res2.error}` : `❌ Failed: Transition went through`);

  // 3. Race Condition Prevention (expectedState mismatch)
  console.log(`\n[Test 3] Expected State Mismatch`);
  const res3 = await HospitalWorkflow.transition(
    'HOSPITAL',
    mockHospitalId,
    currentState,
    'COMPLETE_PROFILE',
    'Complete profile',
    actor,
    {},
    'CREATED',
    updateFn, // Notice expected is CREATED, but actual is PROFILE_COMPLETION
  );
  console.log(!res3.success ? `✅ Prevented: ${res3.error}` : `❌ Failed: Transition went through`);

  // 4. Idempotency (Duplicate requests)
  console.log(
    `\n[Test 4] Valid Transition: PROFILE_COMPLETION -> COMPLETE_PROFILE -> DOCUMENT_UPLOAD`,
  );
  const res4 = await HospitalWorkflow.transition(
    'HOSPITAL',
    mockHospitalId,
    currentState,
    'COMPLETE_PROFILE',
    'Done',
    actor,
    {},
    'PROFILE_COMPLETION',
    updateFn,
  );
  console.log(
    res4.success ? `✅ Success: State is now ${res4.newState}` : `❌ Failed: ${res4.error}`,
  );

  console.log(`\n[Test 4b] Duplicate Transition: COMPLETE_PROFILE again`);
  const res5 = await HospitalWorkflow.transition(
    'HOSPITAL',
    mockHospitalId,
    currentState,
    'COMPLETE_PROFILE',
    'Done',
    actor,
    {},
    'PROFILE_COMPLETION',
    updateFn,
  );
  console.log(
    !res5.success ? `✅ Prevented (Idempotent): ${res5.error}` : `❌ Failed: Duplicate allowed`,
  );

  console.log('\n--- Simulation Complete ---');
}

// We mock prisma out since this is a quick simulation
// Normally this would run against a test DB, but the logic inside WorkflowEngine is what we're testing.
