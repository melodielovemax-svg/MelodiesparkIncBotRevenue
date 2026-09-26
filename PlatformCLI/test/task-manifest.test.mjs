import assert from 'node:assert/strict';
import test from 'node:test';
import { taskManifest, CATEGORIES } from '../src/tasks/manifest.ts';
import { quantumFractalMatrix, MATRIX_PIPELINE } from '../src/workflows/quantum-fractal.ts';

test('manifest loads exactly 1010 authoritative tasks', () => {
  const manifest = taskManifest.load();
  assert.equal(manifest.total_tasks, 1010, 'Expected exactly 1010 tasks');
  assert.equal(manifest.tasks.length, 1010);

  // Assert all categories are represented
  const taskCategories = new Set(manifest.tasks.map((t) => t.category));
  for (const cat of CATEGORIES) {
    assert.ok(taskCategories.has(cat), `Category ${cat} must be represented in manifest`);
  }
});

test('task dependency graph is valid with zero cycles', () => {
  const graph = taskManifest.validateGraph();
  assert.equal(graph.valid, true, `Graph errors: ${graph.errors.join(', ')}`);
  assert.equal(graph.cycleFound, false);
});

test('Quantum Fractal Matrix executes full 7-node sequential pipeline', async () => {
  const result = await quantumFractalMatrix.runPipeline('Verify Model Router Core');
  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.nodesExecuted.length, 7);

  const executedNames = result.nodesExecuted.map((n) => n.node);
  assert.deepEqual(executedNames, MATRIX_PIPELINE);

  assert.ok(result.decompositionTree);
  assert.ok(result.decompositionTree.children);
  assert.equal(result.decompositionTree.children.length, 3);
});
