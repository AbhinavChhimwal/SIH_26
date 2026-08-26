const assert = require('node:assert');
const test = require('node:test');

function computePageRankTest(nodes, edges, damping = 0.85, maxIterations = 40) {
  const n = nodes.length;
  if (n === 0) return {};

  const nodeMap = new Map();
  nodes.forEach((node, i) => nodeMap.set(node.id, i));

  const outDegree = new Float64Array(n);
  const inNeighbors = Array.from({ length: n }, () => []);

  edges.forEach((edge) => {
    const srcIdx = nodeMap.get(edge.source);
    const tgtIdx = nodeMap.get(edge.target);
    if (srcIdx !== undefined && tgtIdx !== undefined) {
      outDegree[srcIdx] += 1.0;
      inNeighbors[tgtIdx].push(srcIdx);
    }
  });

  let ranks = new Float64Array(n).fill(1 / n);
  let nextRanks = new Float64Array(n);

  for (let iter = 0; iter < maxIterations; iter++) {
    let danglingSum = 0;
    for (let i = 0; i < n; i++) {
      if (outDegree[i] === 0) danglingSum += ranks[i];
    }

    const baseRank = (1 - damping) / n + (damping * danglingSum) / n;

    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (const inIdx of inNeighbors[i]) {
        sum += ranks[inIdx] / outDegree[inIdx];
      }
      nextRanks[i] = baseRank + damping * sum;
    }

    ranks.set(nextRanks);
  }

  const result = {};
  nodes.forEach((node, i) => {
    result[node.id] = ranks[i];
  });

  return result;
}

test('Network Topology Engine - PageRank should sum to approximately 1.0', () => {
  const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
  const edges = [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'A' },
    { source: 'D', target: 'C' },
  ];

  const ranks = computePageRankTest(nodes, edges);
  const sum = Object.values(ranks).reduce((a, b) => a + b, 0);

  assert.ok(Math.abs(sum - 1.0) < 1e-4, `PageRank sum should be ~1.0, got ${sum}`);
  assert.ok(ranks['C'] > ranks['D'], 'Node C with incoming links should have higher PageRank than node D');
});

test('Network Topology Engine - Star topology should identify center hub as primary KOL', () => {
  const nodes = [{ id: 'Hub' }, { id: 'Leaf1' }, { id: 'Leaf2' }, { id: 'Leaf3' }];
  const edges = [
    { source: 'Leaf1', target: 'Hub' },
    { source: 'Leaf2', target: 'Hub' },
    { source: 'Leaf3', target: 'Hub' },
  ];

  const ranks = computePageRankTest(nodes, edges);
  assert.ok(ranks['Hub'] > ranks['Leaf1']);
  assert.ok(ranks['Hub'] > ranks['Leaf2']);
  assert.ok(ranks['Hub'] > ranks['Leaf3']);
});
