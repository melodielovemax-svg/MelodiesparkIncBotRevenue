import assert from 'node:assert/strict';
import test from 'node:test';
import { agentRegistry } from '../src/agents/registry.ts';
import { AgentEngine } from '../src/agents/engine.ts';

test('agent registry registers functional and namespace profiles', () => {
  const profiles = agentRegistry.listProfiles();
  assert.ok(profiles.length >= 40, 'Should have standard + namespace profiles');

  const coder = agentRegistry.getProfile('coder');
  assert.ok(coder);
  assert.equal(coder.role, 'coder');

  const watson = agentRegistry.getProfile('watson');
  assert.ok(watson);

  const phoenix = agentRegistry.getProfile('phoenix_blake') || agentRegistry.getProfile('phoenix-blake');
  assert.ok(phoenix);
});

test('80K logical agent addressing resolution separates logical identities from OS processes', () => {
  const a1 = agentRegistry.resolveLogicalAgent(0);
  assert.equal(a1.id, 'AGENT-000001');
  assert.ok(a1.profile);
  assert.ok(a1.virtualWorkerId >= 0 && a1.virtualWorkerId < 32);

  const a80k = agentRegistry.resolveLogicalAgent(79999);
  assert.equal(a80k.id, 'AGENT-080000');
  assert.ok(a80k.profile);
  assert.ok(a80k.virtualWorkerId >= 0 && a80k.virtualWorkerId < 32);
});

test('agent engine decomposes a coding task into verifiable steps', async () => {
  const engine = new AgentEngine();
  const plan = await engine.planTask('Implement unified provider router fallback');
  assert.ok(plan.taskId.startsWith('TASK-'));
  assert.ok(plan.steps.length >= 4);
  assert.ok(plan.filesIdentified.length > 0);
  assert.ok(plan.testsRequired.length > 0);
});

test('agent review detects synthetic keys and dangerous calls', async () => {
  const engine = new AgentEngine();
  const cleanReview = await engine.reviewCode('export function add(a: number, b: number) { return a + b; }');
  assert.equal(cleanReview.pass, true);
  assert.equal(cleanReview.findings.length, 0);

  const leakedKeyReview = await engine.reviewCode('const stripeKey = "sk_live_SYNTHETICfixture123456";');
  assert.equal(leakedKeyReview.pass, false);
  assert.ok(leakedKeyReview.findings.some((f) => f.includes('CRITICAL')));
});

test('agent execution gate enforces human approval before mutation', async () => {
  const engine = new AgentEngine();

  // Without approval: gate holds
  const unapproved = await engine.execute('TASK-000042', { type: 'test' }, { approveExecution: false });
  assert.equal(unapproved.status, 'PENDING');
  assert.match(unapproved.output || '', /Awaiting human review/);

  // With approval: executes through sandbox
  const approved = await engine.execute('TASK-000042', { type: 'test' }, { approveExecution: true });
  assert.equal(approved.status, 'VERIFIED');
});
