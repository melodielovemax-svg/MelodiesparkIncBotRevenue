import crypto from 'node:crypto';

const CANCELLABLE = new Set(['proposed', 'authorized', 'queued', 'running']);
const STATUS_VALUES = new Set(['proposed', 'authorized', 'queued', 'running', 'succeeded', 'failed', 'cancelled']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function publicError(code, message, status = 409) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

export class ExecutionService {
  constructor({ db, workflows, timeoutMs = 30_000, autoStart = true, logger = console.info, enableMetrics = true, logLevel = 'info' }) {
    this.db = db;
    this.workflows = workflows;
    this.timeoutMs = Math.max(1_000, Math.min(300_000, timeoutMs));
    this.autoStart = autoStart;
    this.logger = typeof logger === 'function' ? logger : () => {};
    this.enableMetrics = enableMetrics;
    this.logLevel = logLevel;
    this.active = new Map();
    this.shuttingDown = false;
  }

  create({ userId, actorUserId, authorizationIntentId }) {
    if (this.shuttingDown) throw publicError('SHUTTING_DOWN', 'Execution admission is closed during shutdown.', 503);
    if (!UUID_PATTERN.test(String(authorizationIntentId || ''))) {
      throw publicError('INVALID_AUTHORIZATION_INTENT', 'A valid authorization intent is required.', 400);
    }
    try {
      const result = this.db.createExecution({
        id: crypto.randomUUID(),
        userId,
        actorUserId,
        authorizationIntentId: String(authorizationIntentId)
      });
      if (result.created && this.autoStart) this.enqueue(result.execution.id, userId, actorUserId);
      return result.execution;
    } catch (error) {
      if (error.message === 'EXECUTION_INTENT_NOT_FOUND') throw publicError('INTENT_NOT_FOUND', 'Authorization intent was not found.', 404);
      if (error.message === 'EXECUTION_INTENT_INVALID') throw publicError('INTENT_NOT_AUTHORIZED', 'Authorization intent is expired, unsigned, or already unavailable.', 409);
      if (String(error.message).includes('UNIQUE')) {
        const existing = this.db.getExecutionByIntent({ userId, authorizationIntentId: String(authorizationIntentId) });
        if (existing) return existing;
      }
      throw error;
    }
  }

  enqueue(id, userId, actorUserId) {
    const task = this.execute(id, userId, actorUserId).catch(() => {});
    this.active.set(id, task);
    task.finally(() => this.active.delete(id)).catch(() => {});
  }

  async execute(id, userId, actorUserId) {
    const current = this.db.getExecution(id, userId);
    if (!current) return null;
    if (current.status === 'running') return this.waitForCompletion(id, userId);
    if (current.status !== 'queued') return current;
    let timeoutHandle;
    try {
      if (!this.db.claimExecution({ id, actorUserId })) return this.waitForCompletion(id, userId);
      const startedAt = Date.now();
      const timeout = new Promise((_, reject) => { timeoutHandle = setTimeout(() => {
        const error = new Error('Bounded runner timed out.');
        error.code = 'RUNNER_TIMEOUT';
        reject(error);
      }, this.timeoutMs); });
      const result = await Promise.race([this.workflows.runCycle({ trigger: `execution:${id}` }), timeout]);
      clearTimeout(timeoutHandle);
      const latest = this.db.getExecution(id, userId);
      if (latest?.status === 'cancelled') return latest;
      const completed = this.db.transitionExecution({
        id, fromStatus: 'running', toStatus: 'succeeded', actorUserId, reason: 'runner.succeeded', result
      });
      this.db.awardKarma({ userId, eventKey: `execution:${id}:succeeded`, points: 1, reason: 'Bounded execution completed.' });
      if (this.enableMetrics) this.db.recordExecutionMetric('success');
      this.logTransition({ id, userId, fromStatus: 'running', toStatus: 'succeeded', durationMs: Date.now() - startedAt });
      this.db.audit({ actorUserId, actorType: 'user', action: 'execution.succeeded', resourceType: 'execution', resourceId: id, outcome: 'success', details: { status: completed.status } });
      return completed;
    } catch (error) {
      if (typeof timeoutHandle !== 'undefined') clearTimeout(timeoutHandle);
      const latest = this.db.getExecution(id, userId);
      if (latest?.status === 'cancelled') return latest;
      const code = error.code === 'RUNNER_TIMEOUT' ? 'RUNNER_TIMEOUT' : 'RUNNER_FAILED';
      const message = code === 'RUNNER_TIMEOUT' ? 'Bounded runner timed out.' : 'Bounded runner failed.';
      const failed = this.db.transitionExecution({
        id, fromStatus: 'running', toStatus: 'failed', actorUserId, reason: 'runner.failed',
        errorCode: code, errorMessage: message
      });
      if (this.enableMetrics) this.db.recordExecutionMetric(code === 'RUNNER_TIMEOUT' ? 'timeout' : 'failure');
      this.logTransition({ id, userId, fromStatus: 'running', toStatus: 'failed', durationMs: Date.now() - (latest?.started_at ? Date.parse(latest.started_at) : Date.now()), failureClass: code });
      this.db.audit({ actorUserId, actorType: 'user', action: 'execution.failed', resourceType: 'execution', resourceId: id, outcome: 'error', details: { code } });
      return failed;
    }
  }

  cancel({ id, userId, actorUserId }) {
    const execution = this.db.getExecution(id, userId);
    if (!execution) throw publicError('EXECUTION_NOT_FOUND', 'Execution was not found.', 404);
    if (!CANCELLABLE.has(execution.status)) throw publicError('EXECUTION_NOT_CANCELLABLE', 'Execution is no longer cancellable.');
    const cancelled = this.db.transitionExecution({
      id, fromStatus: execution.status, toStatus: 'cancelled', actorUserId, reason: 'execution.cancelled'
    });
    if (this.enableMetrics) this.db.recordExecutionMetric('cancellation');
    this.logTransition({ id, userId, fromStatus: execution.status, toStatus: 'cancelled', durationMs: Date.now() - Date.parse(execution.created_at) });
    this.db.audit({ actorUserId, actorType: 'user', action: 'execution.cancelled', resourceType: 'execution', resourceId: id, outcome: 'success' });
    return cancelled;
  }

  logTransition({ id, userId, fromStatus, toStatus, durationMs = null, failureClass = null }) {
    if (this.logLevel === 'silent') return;
    this.logger(JSON.stringify({
      level: 'info',
      component: 'execution',
      execution_id: id,
      user_id: userId,
      from_status: fromStatus,
      status: toStatus,
      duration_ms: Math.max(0, Number(durationMs) || 0),
      failure_class: failureClass
    }));
  }

  async waitForCompletion(id, userId) {
    const deadline = Date.now() + this.timeoutMs + 1_000;
    while (Date.now() < deadline) {
      const current = this.db.getExecution(id, userId);
      if (!current || ['succeeded', 'failed', 'cancelled'].includes(current.status)) return current;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return this.db.getExecution(id, userId);
  }

  get(id, userId) {
    return this.db.getExecution(id, userId);
  }

  list({ userId, status, limit, offset }) {
    if (status && !STATUS_VALUES.has(status)) throw publicError('INVALID_STATUS', 'Unknown execution status.', 400);
    return this.db.listExecutions({ userId, status, limit, offset });
  }

  recover() {
    if (this.shuttingDown) return;
    for (const execution of this.db.recoverExecutions()) {
      const current = this.db.getExecution(execution.id, execution.userId);
      if (current?.status === 'running') {
        this.db.transitionExecution({
          id: execution.id,
          fromStatus: 'running',
          toStatus: 'failed',
          actorUserId: execution.userId,
          reason: 'process.recovered',
          errorCode: 'RUNNER_INTERRUPTED',
          errorMessage: 'Execution was interrupted by a process restart.'
        });
        if (this.enableMetrics) this.db.recordExecutionMetric('recovery');
        this.logTransition({ id: execution.id, userId: execution.userId, fromStatus: 'running', toStatus: 'failed', failureClass: 'RUNNER_INTERRUPTED' });
      } else if (current?.status === 'queued') {
        this.enqueue(execution.id, execution.userId, execution.userId);
      }
    }
  }

  beginShutdown() {
    this.shuttingDown = true;
  }

  async waitForIdle(timeoutMs = this.timeoutMs + 1_000) {
    const deadline = Date.now() + timeoutMs;
    while (this.active.size && Date.now() < deadline) {
      await Promise.race([...this.active.values()].map((task) => task.catch(() => {})));
    }
    return this.active.size === 0;
  }
}
