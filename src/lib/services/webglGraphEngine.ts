import { NetworkNode, NetworkEdge, Platform, EmotionType } from '../types';

/**
 * Spatial Grid index for high-performance O(1) collision detection across 100,000+ nodes
 */
export class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, number[]>;

  constructor(cellSize: number = 40) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  public clear() {
    this.grid.clear();
  }

  private getKey(x: number, y: number): string {
    const gx = Math.floor(x / this.cellSize);
    const gy = Math.floor(y / this.cellSize);
    return `${gx},${gy}`;
  }

  public insert(nodeIndex: number, x: number, y: number) {
    const key = this.getKey(x, y);
    const cell = this.grid.get(key);
    if (cell) {
      cell.push(nodeIndex);
    } else {
      this.grid.set(key, [nodeIndex]);
    }
  }

  public queryRadius(x: number, y: number, radius: number): number[] {
    const results: number[] = [];
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);

    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) {
        const cell = this.grid.get(`${gx},${gy}`);
        if (cell) {
          results.push(...cell);
        }
      }
    }
    return results;
  }
}

/**
 * Generates synthetic scale-free network (Barabási–Albert preferential attachment)
 * for large-scale GPU WebGL stress testing (from 50 to 50,000+ nodes)
 */
export function generateLargeScaleNetwork(targetCount: number = 5000): {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
} {
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  const platforms: Platform[] = ['x', 'telegram', 'instagram', 'facebook', 'reddit', 'youtube'];
  const emotions: EmotionType[] = ['excitement', 'anxiety', 'sarcasm', 'supportive', 'against', 'joy', 'anger', 'trust'];

  // Initial seed cluster of 5 nodes
  for (let i = 0; i < Math.min(5, targetCount); i++) {
    nodes.push({
      id: `gpu-node-${i}`,
      label: `KOL Seed ${i + 1}`,
      handle: `@seed_kol_${i + 1}`,
      platform: platforms[i % platforms.length],
      followers: 500000 + i * 100000,
      influenceScore: 95 - i * 5,
      pageRank: 0.08,
      betweennessCentrality: 0.12,
      inDegree: 10,
      outDegree: 5,
      eigenvectorCentrality: 0.9,
      communityId: (i % 4) + 1,
      communityName: `Community ${(i % 4) + 1}`,
      dominantSentiment: emotions[i % emotions.length],
      sentimentPolarity: 0.7 - (i * 0.3),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'KOL',
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 800,
    });
  }

  // Preferential attachment for remaining nodes
  const attachmentList: number[] = [0, 1, 2, 3, 4];

  for (let i = 5; i < targetCount; i++) {
    const communityId = (i % 4) + 1;
    const isKOL = i < 20;
    const isBridge = i % 25 === 0;

    const role = isKOL ? 'KOL' : (isBridge ? 'Bridge' : 'Regular');
    const platform = platforms[i % platforms.length];
    const emotion = emotions[i % emotions.length];

    // Polar distribution around center with community clustering
    const angle = (communityId * Math.PI / 2) + ((Math.random() - 0.5) * 1.2);
    const radius = 120 + Math.sqrt(Math.random()) * 650;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    nodes.push({
      id: `gpu-node-${i}`,
      label: `User ${i + 1}`,
      handle: `@usr_${platform}_${i + 1}`,
      platform,
      followers: Math.floor(Math.random() * 45000) + 120,
      influenceScore: Math.floor(Math.random() * 60) + 15,
      pageRank: Number((1 / targetCount).toFixed(6)),
      betweennessCentrality: isBridge ? 0.045 : 0.001,
      inDegree: 1,
      outDegree: 2,
      eigenvectorCentrality: 0.05,
      communityId,
      communityName: `Community ${communityId}`,
      dominantSentiment: emotion,
      sentimentPolarity: Number(((Math.random() * 1.8) - 0.9).toFixed(2)),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role,
      x,
      y,
    });

    // Attach to 1-2 existing nodes based on preferential attachment
    const targetIdx = attachmentList[Math.floor(Math.random() * attachmentList.length)];
    if (targetIdx !== undefined && targetIdx < nodes.length) {
      edges.push({
        id: `gpu-edge-${i}-1`,
        source: nodes[i].id,
        target: nodes[targetIdx].id,
        type: 'retweet',
        weight: 1.5,
        timestamp: new Date().toISOString(),
        platform,
        sentiment: 0.4,
      });
      attachmentList.push(i, targetIdx);
    }
  }

  return { nodes, edges };
}

/**
 * WebGL 2.0 Shader sources for GPU point instancing and 60 FPS rendering
 */
export const WEBGL_VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
in float a_size;
in vec4 a_color;
in float a_infected;

uniform mat3 u_matrix;
uniform float u_time;

out vec4 v_color;
out float v_infected;
out float v_time;

void main() {
  vec3 pos = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(pos.xy, 0.0, 1.0);
  
  float size = a_size;
  if (a_infected > 0.5) {
    size += sin(u_time * 6.0) * 4.0;
  }
  gl_PointSize = max(3.0, size);
  
  v_color = a_color;
  v_infected = a_infected;
  v_time = u_time;
}
`;

export const WEBGL_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec4 v_color;
in float v_infected;
in float v_time;

out vec4 fragColor;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  
  if (dist > 0.5) {
    discard;
  }
  
  // Antialiased edge
  float alpha = smoothstep(0.5, 0.42, dist);
  
  vec3 color = v_color.rgb;
  
  // Outer neon ring for infected nodes
  if (v_infected > 0.5 && dist > 0.35) {
    color = vec3(0.22, 0.74, 0.97); // Electric cyan ring
    alpha = 1.0;
  }
  
  fragColor = vec4(color, alpha * v_color.a);
}
`;
