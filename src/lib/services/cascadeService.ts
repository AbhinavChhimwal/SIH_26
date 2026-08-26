import { NetworkNode, NetworkEdge, CascadeStep, EmotionType } from '../types';

/**
 * Generates an information cascade simulation based on graph topology and seed KOLs
 */
export function simulateInformationCascade(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  stepsCount: number = 6
): CascadeStep[] {
  if (nodes.length === 0) return [];

  // Find top KOLs (seeds)
  const sortedByKOL = [...nodes].sort((a, b) => (b.pageRank + b.betweennessCentrality) - (a.pageRank + a.betweennessCentrality));
  const seedNode = sortedByKOL[0];
  const secondarySeed = sortedByKOL[1] || seedNode;

  // Build adjacency map
  const adj: Record<string, Array<{ target: string; edgeId: string; weight: number }>> = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    if (adj[e.source]) {
      adj[e.source].push({ target: e.target, edgeId: e.id, weight: e.weight });
    }
  });

  const steps: CascadeStep[] = [];
  const infectedSet = new Set<string>();
  const activeEdgesSet = new Set<string>();

  // Time labels
  const timeLabels = ['T+0m (Origin)', 'T+15m (First Wave)', 'T+45m (Bridge Spillover)', 'T+2h (Viral Peak)', 'T+6h (Counter Surge)', 'T+12h (Saturation)'];
  const milestones = [
    `Patient Zero ${seedNode.handle} posts original leak/breaking disclosure.`,
    'Core followers and early amplifiers repost across primary community cluster.',
    'Bridge nodes propagate discussion across to secondary industry communities.',
    'Mainstream media and large KOLs broadcast to broad public; virality reaches peak $R_0$.',
    'Skeptics and counter-narrative cluster react with critical analysis and anxiety.',
    'Information cascades reach full saturation across all multi-platform channels.',
  ];

  const emotionEvolution: EmotionType[] = [
    'excitement',
    'excitement',
    'anxiety',
    'sarcasm',
    'against',
    'supportive',
  ];

  for (let s = 0; s < stepsCount; s++) {
    const newlyInfected: string[] = [];
    let r0 = 1.0;

    if (s === 0) {
      infectedSet.add(seedNode.id);
      newlyInfected.push(seedNode.id);
      r0 = 1.2;
    } else if (s === 1) {
      if (secondarySeed && !infectedSet.has(secondarySeed.id)) {
        infectedSet.add(secondarySeed.id);
        newlyInfected.push(secondarySeed.id);
      }
      // Infect direct neighbors of seed
      const direct = adj[seedNode.id] || [];
      direct.slice(0, 5).forEach(neighbor => {
        if (!infectedSet.has(neighbor.target)) {
          infectedSet.add(neighbor.target);
          newlyInfected.push(neighbor.target);
          activeEdgesSet.add(neighbor.edgeId);
        }
      });
      r0 = 2.4;
    } else {
      // Infect neighbors of currently infected nodes with probability
      const currentInfectedList = Array.from(infectedSet);
      for (const node of currentInfectedList) {
        const neighbors = adj[node] || [];
        for (const n of neighbors) {
          if (!infectedSet.has(n.target) && Math.random() < 0.6) {
            infectedSet.add(n.target);
            newlyInfected.push(n.target);
            activeEdgesSet.add(n.edgeId);
          }
        }
      }
      // Ensure at least some nodes get infected each step until 80%+ graph coverage
      if (newlyInfected.length === 0 && infectedSet.size < nodes.length) {
        const remaining = nodes.filter(n => !infectedSet.has(n.id));
        remaining.slice(0, Math.min(3, remaining.length)).forEach(r => {
          infectedSet.add(r.id);
          newlyInfected.push(r.id);
        });
      }

      r0 = s === 3 ? 3.8 : (s === 4 ? 2.1 : 0.8);
    }

    const cumulativeReach = Array.from(infectedSet).reduce((sum, id) => {
      const n = nodes.find(x => x.id === id);
      return sum + (n ? n.followers : 1000);
    }, 0);

    steps.push({
      step: s,
      timeLabel: timeLabels[s] || `T+${s * 2}h`,
      timestamp: new Date(Date.now() - (stepsCount - s) * 3600000).toISOString(),
      activeNodes: Array.from(infectedSet),
      newlyInfectedNodes: newlyInfected,
      activeEdges: Array.from(activeEdgesSet),
      cumulativeReach,
      reproductionRate: Number(r0.toFixed(2)),
      dominantEmotion: emotionEvolution[s] || 'neutral',
      narrativeMilestone: milestones[s] || 'Information continues cascading across social nodes.',
    });
  }

  return steps;
}
