import { NetworkGraph, NetworkNode, NetworkEdge, CommunityInfo } from '../types';

/**
 * Calculates PageRank for a given set of nodes and edges
 */
export function computePageRank(
  nodes: { id: string }[],
  edges: { source: string; target: string; weight?: number }[],
  damping: number = 0.85,
  maxIterations: number = 50,
  tolerance: number = 1e-6
): Record<string, number> {
  const n = nodes.length;
  if (n === 0) return {};

  const nodeMap = new Map<string, number>();
  nodes.forEach((node, i) => nodeMap.set(node.id, i));

  // Adjacency matrix: out-neighbors
  const outDegree = new Float64Array(n);
  const inNeighbors: Array<Array<{ index: number; weight: number }>> = Array.from({ length: n }, () => []);

  edges.forEach((edge) => {
    const srcIdx = nodeMap.get(edge.source);
    const tgtIdx = nodeMap.get(edge.target);
    if (srcIdx !== undefined && tgtIdx !== undefined) {
      const w = edge.weight || 1.0;
      outDegree[srcIdx] += w;
      inNeighbors[tgtIdx].push({ index: srcIdx, weight: w });
    }
  });

  let ranks = new Float64Array(n).fill(1 / n);
  let nextRanks = new Float64Array(n);

  for (let iter = 0; iter < maxIterations; iter++) {
    let diff = 0;
    // Calculate dangling sum (nodes with outDegree = 0)
    let danglingSum = 0;
    for (let i = 0; i < n; i++) {
      if (outDegree[i] === 0) {
        danglingSum += ranks[i];
      }
    }

    const baseRank = (1 - damping) / n + (damping * danglingSum) / n;

    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (const inEdge of inNeighbors[i]) {
        sum += (ranks[inEdge.index] * inEdge.weight) / outDegree[inEdge.index];
      }
      nextRanks[i] = baseRank + damping * sum;
      diff += Math.abs(nextRanks[i] - ranks[i]);
    }

    ranks.set(nextRanks);
    if (diff < tolerance) break;
  }

  // Normalize sum to 1
  let total = 0;
  for (let i = 0; i < n; i++) total += ranks[i];

  const result: Record<string, number> = {};
  nodes.forEach((node, i) => {
    result[node.id] = total > 0 ? Number((ranks[i] / total).toFixed(6)) : 1 / n;
  });

  return result;
}

/**
 * Computes Betweenness Centrality using Brandes' Algorithm
 */
export function computeBetweennessCentrality(
  nodes: { id: string }[],
  edges: { source: string; target: string }[]
): Record<string, number> {
  const n = nodes.length;
  if (n === 0) return {};

  const nodeMap = new Map<string, number>();
  nodes.forEach((node, i) => nodeMap.set(node.id, i));

  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach((edge) => {
    const s = nodeMap.get(edge.source);
    const t = nodeMap.get(edge.target);
    if (s !== undefined && t !== undefined) {
      adj[s].push(t);
      adj[t].push(s); // treat undirected for betweenness bridge discovery
    }
  });

  const cb = new Float64Array(n);

  for (let s = 0; s < n; s++) {
    const S: number[] = [];
    const P: number[][] = Array.from({ length: n }, () => []);
    const sigma = new Float64Array(n);
    const d = new Int32Array(n).fill(-1);

    sigma[s] = 1;
    d[s] = 0;

    const Q: number[] = [s];

    while (Q.length > 0) {
      const v = Q.shift()!;
      S.push(v);

      for (const w of adj[v]) {
        if (d[w] < 0) {
          Q.push(w);
          d[w] = d[v] + 1;
        }
        if (d[w] === d[v] + 1) {
          sigma[w] += sigma[v];
          P[w].push(v);
        }
      }
    }

    const delta = new Float64Array(n);
    while (S.length > 0) {
      const w = S.pop()!;
      for (const v of P[w]) {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      }
      if (w !== s) {
        cb[w] += delta[w];
      }
    }
  }

  // Normalize (undirected graph scaling)
  const normFactor = n > 2 ? 2 / ((n - 1) * (n - 2)) : 1;
  const result: Record<string, number> = {};
  nodes.forEach((node, i) => {
    result[node.id] = Number((cb[i] * normFactor).toFixed(6));
  });

  return result;
}

/**
 * Computes Degree Centrality & Node Roles
 */
export function enrichGraphWithMetrics(
  nodes: NetworkNode[],
  edges: NetworkEdge[]
): {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
} {
  const pageRanks = computePageRank(nodes, edges);
  const betweenness = computeBetweennessCentrality(nodes, edges);

  const inDegreeMap: Record<string, number> = {};
  const outDegreeMap: Record<string, number> = {};

  nodes.forEach((n) => {
    inDegreeMap[n.id] = 0;
    outDegreeMap[n.id] = 0;
  });

  edges.forEach((e) => {
    if (outDegreeMap[e.source] !== undefined) outDegreeMap[e.source]++;
    if (inDegreeMap[e.target] !== undefined) inDegreeMap[e.target]++;
  });

  // Calculate max values for normalization
  const maxPR = Math.max(...Object.values(pageRanks), 0.001);
  const maxBC = Math.max(...Object.values(betweenness), 0.001);
  const maxInDeg = Math.max(...Object.values(inDegreeMap), 1);

  const enrichedNodes = nodes.map((node) => {
    const pr = pageRanks[node.id] || 0.001;
    const bc = betweenness[node.id] || 0;
    const inDeg = inDegreeMap[node.id] || 0;
    const outDeg = outDegreeMap[node.id] || 0;
    const followerFactor = Math.log10(Math.max(node.followers, 10)) / 7; // log scale up to 10M followers

    // Composite influence score (0 to 100)
    const normPR = pr / maxPR;
    const normBC = bc / maxBC;
    const normInDeg = inDeg / maxInDeg;

    const rawScore = (normPR * 0.35 + normBC * 0.25 + normInDeg * 0.20 + followerFactor * 0.20) * 100;
    const influenceScore = Math.min(100, Math.max(5, Math.round(rawScore)));

    // Classify Role
    let role: NetworkNode['role'] = 'Regular';
    if (influenceScore > 80 || (normPR > 0.7 && normInDeg > 0.6)) {
      role = 'KOL';
    } else if (normBC > 0.65 && normInDeg < 0.6) {
      role = 'Bridge';
    } else if (outDeg > inDeg * 3 && outDeg > 8) {
      role = 'Amplifier';
    } else if (inDeg > 5) {
      role = 'Regular';
    }

    return {
      ...node,
      pageRank: pr,
      betweennessCentrality: bc,
      inDegree: inDeg,
      outDegree: outDeg,
      eigenvectorCentrality: Number((normPR * 0.9 + normBC * 0.1).toFixed(4)),
      influenceScore,
      role,
    };
  });

  return { nodes: enrichedNodes, edges };
}
