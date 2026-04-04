/**
 * Worker Lifecycle Manager (M5 Fix)
 * Adds SIGTERM/SIGINT graceful shutdown to all setInterval workers.
 *
 * Without this, when the process is killed (e.g. during deployment), open
 * intervals continue running but the DB/Redis connections close, causing
 * silent errors and potential partial writes.
 */

type WorkerHandle = {
  name: string;
  intervalId: ReturnType<typeof setInterval>;
};

const registeredWorkers: WorkerHandle[] = [];

/**
 * Register a setInterval worker for graceful shutdown tracking.
 * Usage:
 *   const id = registerWorker('outbox', setInterval(processOutbox, 5000));
 */
export function registerWorker(name: string, intervalId: ReturnType<typeof setInterval>): ReturnType<typeof setInterval> {
  registeredWorkers.push({ name, intervalId });
  return intervalId;
}

/**
 * Stop all registered workers cleanly.
 * Called automatically on SIGTERM/SIGINT.
 */
function shutdownWorkers(signal: string) {
  console.info(`[WorkerManager] Received ${signal}. Stopping ${registeredWorkers.length} workers...`);
  for (const worker of registeredWorkers) {
    clearInterval(worker.intervalId);
    console.info(`[WorkerManager] Stopped worker: ${worker.name}`);
  }
  console.info('[WorkerManager] All workers stopped. Exiting.');
  process.exit(0);
}

// Wire shutdown signals
process.on('SIGTERM', () => shutdownWorkers('SIGTERM'));
process.on('SIGINT',  () => shutdownWorkers('SIGINT'));
