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

  // Initial seed cluster of 6 high-authority KOL nodes
  for (let i = 0; i < Math.min(6, targetCount); i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r = 180;
    nodes.push({
      id: `gpu-node-${i}`,
      label: `KOL Anchor ${i + 1}`,
      handle: `@anchor_kol_${i + 1}`,
      platform: platforms[i % platforms.length],
      followers: 850000 + i * 150000,
      influenceScore: 98 - i * 4,
      pageRank: 0.085,
      betweennessCentrality: 0.14,
      inDegree: 15,
      outDegree: 8,
      eigenvectorCentrality: 0.95,
      communityId: (i % 4) + 1,
      communityName: `Cluster ${(i % 4) + 1}`,
      dominantSentiment: emotions[i % emotions.length],
      sentimentPolarity: 0.7 - i * 0.25,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'KOL',
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    });
  }

  // Interconnect anchor nodes
  for (let i = 0; i < Math.min(6, targetCount) - 1; i++) {
    edges.push({
      id: `seed-edge-${i}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: 'retweet',
      weight: 3.5,
      timestamp: new Date().toISOString(),
      platform: 'x',
      sentiment: 0.5,
    });
  }

  // Preferential attachment for remaining nodes
  const attachmentList: number[] = [0, 1, 2, 3, 4, 5];

  for (let i = 6; i < targetCount; i++) {
    const communityId = (i % 4) + 1;
    const isKOL = i < 25;
    const isBridge = i % 20 === 0;

    const role = isKOL ? 'KOL' : isBridge ? 'Bridge' : 'Regular';
    const platform = platforms[i % platforms.length];
    const emotion = emotions[i % emotions.length];

    // Cluster distribution around community center
    const baseAngle = (communityId * Math.PI) / 2;
    const angle = baseAngle + (Math.random() - 0.5) * 1.4;
    const distance = 80 + Math.sqrt(Math.random()) * 520;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    nodes.push({
      id: `gpu-node-${i}`,
      label: `Follower ${i + 1}`,
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

    // Attach to 1-2 existing nodes
    const targetIdx = attachmentList[Math.floor(Math.random() * attachmentList.length)];
    if (targetIdx !== undefined && targetIdx < nodes.length) {
      edges.push({
        id: `gpu-edge-${i}-1`,
        source: nodes[i].id,
        target: nodes[targetIdx].id,
        type: 'retweet',
        weight: 1.2,
        timestamp: new Date().toISOString(),
        platform,
        sentiment: 0.3,
      });
      attachmentList.push(i, targetIdx);
    }
  }

  return { nodes, edges };
}

/**
 * WebGL 2.0 Shader sources for Nodes (Points)
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
    size += sin(u_time * 6.0) * 5.0;
  }
  gl_PointSize = max(4.0, size);
  
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
  
  // Smooth antialiased edge
  float alpha = smoothstep(0.5, 0.40, dist);
  
  // Radial glow gradient from center to perimeter
  vec3 color = v_color.rgb * (1.15 - dist * 0.5);
  
  // Neon infection pulse ring
  if (v_infected > 0.5 && dist > 0.36) {
    color = vec3(0.15, 0.85, 1.0); // Electric cyan ring
    alpha = 1.0;
  }
  
  // Outer highlight ring for regular nodes
  if (dist > 0.44) {
    color = mix(color, vec3(1.0), 0.4);
  }
  
  fragColor = vec4(color, alpha * v_color.a);
}
`;

/**
 * WebGL 2.0 Shader sources for Graph Edges (Lines)
 */
export const WEBGL_EDGE_VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
in vec4 a_color;
in float a_active;

uniform mat3 u_matrix;

out vec4 v_color;
out float v_active;

void main() {
  vec3 pos = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(pos.xy, 0.0, 1.0);
  v_color = a_color;
  v_active = a_active;
}
`;

export const WEBGL_EDGE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec4 v_color;
in float v_active;

out vec4 fragColor;

void main() {
  vec4 col = v_color;
  if (v_active > 0.5) {
    col = vec4(0.2, 0.85, 1.0, 0.85); // Vibrant cyan for cascade/active edges
  }
  fragColor = col;
}
`;
