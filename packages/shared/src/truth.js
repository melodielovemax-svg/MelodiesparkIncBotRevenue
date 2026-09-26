export const CapabilityStatus = Object.freeze({
  OPERATIONAL: 'OPERATIONAL', SCAFFOLD: 'SCAFFOLD', PLANNED: 'PLANNED', 
  PAPER_ONLY: 'PAPER_ONLY', BLOCKED: 'BLOCKED', FICTIONAL: 'FICTIONAL', UNVERIFIED: 'UNVERIFIED'
});
export const ExecutionReality = Object.freeze({
  NOT_EXECUTED: 'NOT_EXECUTED', REQUESTED: 'REQUESTED', PENDING: 'PENDING', 
  EXECUTING: 'EXECUTING', EXECUTED: 'EXECUTED', VERIFIED: 'VERIFIED', FAILED: 'FAILED'
});
export const CapabilityRegistry = new Map([
  ['cli.init', { status: CapabilityStatus.OPERATIONAL }],
  ['revenue.ledger', { status: CapabilityStatus.OPERATIONAL }],
  ['wallet.transfer', { status: CapabilityStatus.BLOCKED, reason: 'Requires funded wallet' }],
  ['quantum_fractal_engine', { status: CapabilityStatus.FICTIONAL, reason: 'Recursive workflow implemented' }],
  ['arc_angels_optimization', { status: CapabilityStatus.SCAFFOLD, reason: 'Hardware metrics active' }]
]);
