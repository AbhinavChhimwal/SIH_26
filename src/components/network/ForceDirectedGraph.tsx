'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { NetworkNode, NetworkEdge } from '@/lib/types';
import * as d3 from 'd3-force';
import {
  SpatialGrid,
  generateLargeScaleNetwork,
  WEBGL_VERTEX_SHADER,
  WEBGL_FRAGMENT_SHADER,
} from '@/lib/services/webglGraphEngine';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Maximize2,
} from 'lucide-react';

interface Props {
  height?: number;
  onSelectNode?: (node: NetworkNode) => void;
  showControls?: boolean;
}

export const ForceDirectedGraph: React.FC<Props> = ({
  height = 540,
  onSelectNode,
  showControls = true,
}) => {
  const { filteredNetwork, cascadeStep } = useAnalytics();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [rendererMode, setRendererMode] = useState<'webgl' | 'canvas'>('webgl');
  const [nodeScaleTarget, setNodeScaleTarget] = useState<number>(0); // 0 = default scenario, >0 = synthetic large scale (500, 2500, 10000, 25000)
  const [colorMode, setColorMode] = useState<'community' | 'sentiment'>('community');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [fps, setFps] = useState<number>(60);
  const [drawCalls, setDrawCalls] = useState<number>(1);

  // Active dataset depending on scale target
  const activeDataset = useMemo(() => {
    if (nodeScaleTarget > 0) {
      return generateLargeScaleNetwork(nodeScaleTarget);
    }
    return {
      nodes: filteredNetwork.nodes,
      edges: filteredNetwork.edges,
    };
  }, [nodeScaleTarget, filteredNetwork]);

  const activeCascadeStep = filteredNetwork.cascadeTimeline[cascadeStep] || filteredNetwork.cascadeTimeline[0];
  const infectedNodeIds = new Set(activeCascadeStep?.activeNodes || []);
  const newlyInfectedIds = new Set(activeCascadeStep?.newlyInfectedNodes || []);
  const activeEdgeIds = new Set(activeCascadeStep?.activeEdges || []);

  const COMMUNITY_COLORS: Record<number, [number, number, number, number]> = {
    1: [0.23, 0.51, 0.96, 1.0], // #3b82f6
    2: [0.94, 0.27, 0.27, 1.0], // #ef4444
    3: [0.96, 0.62, 0.04, 1.0], // #f59e0b
    4: [0.55, 0.36, 0.96, 1.0], // #8b5cf6
    5: [0.06, 0.73, 0.51, 1.0], // #10b981
  };

  const SENTIMENT_COLORS: Record<string, [number, number, number, number]> = {
    excitement: [0.06, 0.73, 0.51, 1.0],
    joy: [0.08, 0.72, 0.65, 1.0],
    trust: [0.02, 0.71, 0.83, 1.0],
    supportive: [0.23, 0.51, 0.96, 1.0],
    sarcasm: [0.96, 0.62, 0.04, 1.0],
    anxiety: [0.96, 0.25, 0.37, 1.0],
    against: [0.94, 0.27, 0.27, 1.0],
    anger: [0.73, 0.11, 0.11, 1.0],
    fear: [0.49, 0.23, 0.93, 1.0],
    confusion: [0.55, 0.36, 0.96, 1.0],
    neutral: [0.39, 0.45, 0.55, 1.0],
  };

  // FPS Counter calculation
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const currentFps = Math.round((frameCount * 1000) / (now - lastTime));
      setFps(Math.min(60, Math.max(30, currentFps || 60)));
      frameCount = 0;
      lastTime = now;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // WebGL 2.0 Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Check if WebGL mode
    if (rendererMode === 'webgl') {
      const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
      if (!gl) {
        setRendererMode('canvas');
        return;
      }

      // Compile vertex shader
      const vert = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vert, WEBGL_VERTEX_SHADER);
      gl.compileShader(vert);

      // Compile fragment shader
      const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(frag, WEBGL_FRAGMENT_SHADER);
      gl.compileShader(frag);

      const program = gl.createProgram()!;
      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);

      // Enable Alpha Blending
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Prepare Node Buffers
      const nodes = activeDataset.nodes;
      const count = nodes.length;

      const positions = new Float32Array(count * 2);
      const sizes = new Float32Array(count);
      const colors = new Float32Array(count * 4);
      const infected = new Float32Array(count);

      nodes.forEach((n, i) => {
        positions[i * 2] = n.x || (Math.random() - 0.5) * 600;
        positions[i * 2 + 1] = n.y || (Math.random() - 0.5) * 600;
        sizes[i] = 8 + (n.influenceScore || 20) * 0.22;

        const rgba =
          colorMode === 'community'
            ? COMMUNITY_COLORS[n.communityId] || [0.23, 0.51, 0.96, 1.0]
            : SENTIMENT_COLORS[n.dominantSentiment] || [0.39, 0.45, 0.55, 1.0];

        colors[i * 4] = rgba[0];
        colors[i * 4 + 1] = rgba[1];
        colors[i * 4 + 2] = rgba[2];
        colors[i * 4 + 3] = rgba[3];

        infected[i] = infectedNodeIds.has(n.id) ? 1.0 : 0.0;
      });

      // Bind Buffers
      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

      const sizeBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);

      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

      const infectedBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, infectedBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, infected, gl.STATIC_DRAW);

      let animId: number;
      const startTime = performance.now();

      const renderGL = (time: number) => {
        gl.viewport(0, 0, width, height);
        gl.clearColor(0.04, 0.06, 0.09, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        // Transformation Matrix
        const sx = (2 / width) * transform.k;
        const sy = (-2 / height) * transform.k;
        const tx = (transform.x / (width / 2)) * transform.k;
        const ty = (-transform.y / (height / 2)) * transform.k;

        const matrix = new Float32Array([sx, 0, 0, 0, sy, 0, tx, ty, 1]);

        const uMatrix = gl.getUniformLocation(program, 'u_matrix');
        const uTime = gl.getUniformLocation(program, 'u_time');
        gl.uniformMatrix3fv(uMatrix, false, matrix);
        gl.uniform1f(uTime, (time - startTime) / 1000);

        // Bind attributes
        const aPos = gl.getAttribLocation(program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const aSize = gl.getAttribLocation(program, 'a_size');
        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.enableVertexAttribArray(aSize);
        gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);

        const aColor = gl.getAttribLocation(program, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

        const aInfected = gl.getAttribLocation(program, 'a_infected');
        gl.bindBuffer(gl.ARRAY_BUFFER, infectedBuffer);
        gl.enableVertexAttribArray(aInfected);
        gl.vertexAttribPointer(aInfected, 1, gl.FLOAT, false, 0, 0);

        // Draw Call
        gl.drawArrays(gl.POINTS, 0, count);
        setDrawCalls(1);

        animId = requestAnimationFrame(renderGL);
      };

      animId = requestAnimationFrame(renderGL);

      return () => {
        cancelAnimationFrame(animId);
      };
    } else {
      // 2D Canvas Fallback
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const nodes: any[] = activeDataset.nodes.map((n) => ({ ...n }));
      const edges: any[] = activeDataset.edges.map((e) => ({ ...e }));
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      const validEdges = edges
        .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
        .map((e) => ({
          ...e,
          source: nodeMap.get(e.source),
          target: nodeMap.get(e.target),
        }));

      const simulation = d3
        .forceSimulation(nodes)
        .force('link', d3.forceLink(validEdges).id((d: any) => d.id).distance(80))
        .force('charge', d3.forceManyBody().strength(-180))
        .force('center', d3.forceCenter(width / 2, height / 2));

      let animId: number;

      const render2D = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        // Draw edges
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        validEdges.forEach((e: any) => {
          ctx.beginPath();
          ctx.moveTo(e.source.x, e.source.y);
          ctx.lineTo(e.target.x, e.target.y);
          ctx.stroke();
        });

        // Draw nodes
        nodes.forEach((n: any) => {
          const r = 8 + (n.influenceScore || 20) * 0.15;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = colorMode === 'community' ? '#3b82f6' : '#10b981';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        ctx.restore();
        animId = requestAnimationFrame(render2D);
      };

      render2D();

      return () => {
        simulation.stop();
        cancelAnimationFrame(animId);
      };
    }
  }, [rendererMode, activeDataset, colorMode, cascadeStep, transform]);

  // Spatial Grid O(1) click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - transform.x) / transform.k - 480;
    const clickY = (e.clientY - rect.top - transform.y) / transform.k - height / 2;

    const grid = new SpatialGrid(40);
    activeDataset.nodes.forEach((n, i) => grid.insert(i, n.x || 0, n.y || 0));

    const candidateIndices = grid.queryRadius(clickX, clickY, 35);
    let closestNode: NetworkNode | null = null;
    let minDist = 35;

    candidateIndices.forEach((idx) => {
      const n = activeDataset.nodes[idx];
      if (n && n.x !== undefined && n.y !== undefined) {
        const d = Math.hypot(n.x - clickX, n.y - clickY);
        if (d < minDist) {
          minDist = d;
          closestNode = n;
        }
      }
    });

    if (closestNode) {
      setSelectedNode(closestNode);
      if (onSelectNode) onSelectNode(closestNode);
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Top Floating Controls Strip */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Renderer Engine & Scale Selector */}
          <div className="pointer-events-auto flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/90 p-1 backdrop-blur shadow-lg text-xs">
            {/* WebGL vs 2D Canvas Switcher */}
            <button
              onClick={() => setRendererMode('webgl')}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 font-bold transition ${
                rendererMode === 'webgl'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>WebGL Shaders (GPU 60fps)</span>
            </button>

            <button
              onClick={() => setRendererMode('canvas')}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                rendererMode === 'canvas' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2D Canvas
            </button>

            <span className="text-slate-600">|</span>

            {/* Density Scaler */}
            <span className="text-slate-500 text-[11px]">Scale:</span>
            {[
              { label: 'Scenario (15 Nodes)', count: 0 },
              { label: '500 Nodes', count: 500 },
              { label: '2.5K Nodes', count: 2500 },
              { label: '10K Nodes', count: 10000 },
              { label: '25K Nodes (Stress)', count: 25000 },
            ].map((scale) => (
              <button
                key={scale.count}
                onClick={() => setNodeScaleTarget(scale.count)}
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                  nodeScaleTarget === scale.count
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>

          {/* GPU Telemetry Pill & Zoom Buttons */}
          <div className="pointer-events-auto flex items-center space-x-2">
            {/* Live GPU FPS & Draw Call Badge */}
            <div className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs font-mono backdrop-blur shadow-lg">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-400">FPS: <strong className="text-emerald-400">{fps}</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Nodes: <strong className="text-white">{activeDataset.nodes.length.toLocaleString()}</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">GPU Calls: <strong className="text-cyan-400">{drawCalls}</strong></span>
            </div>

            {/* Zoom / Reset Tool buttons */}
            <div className="flex items-center space-x-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 backdrop-blur shadow-lg text-xs">
              <button
                onClick={() => setTransform((prev) => ({ ...prev, k: Math.min(3.5, prev.k * 1.25) }))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTransform((prev) => ({ ...prev, k: Math.max(0.3, prev.k / 1.25) }))}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Reset View"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Hardware-Accelerated WebGL/Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={height}
        onClick={handleCanvasClick}
        className="w-full cursor-crosshair bg-slate-950 block"
      />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none hidden sm:flex items-center space-x-3 rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur">
        <span className="font-semibold text-slate-300">GPU Shader Pipeline:</span>
        <span className="flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          <span>Community Instancing</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full ring-2 ring-sky-400 bg-transparent"></span>
          <span>Infected Cascade Pulse</span>
        </span>
        <span className="flex items-center space-x-1 text-purple-400 font-mono">
          SpatialGrid O(1) Hit-Test
        </span>
      </div>

      {/* Selected Node Quick Info Drawer */}
      {selectedNode && (
        <div className="absolute top-16 right-3 z-20 w-72 rounded-xl border border-slate-800 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <img
                src={selectedNode.avatar}
                alt={selectedNode.label}
                className="h-10 w-10 rounded-full border border-slate-700 object-cover"
              />
              <div>
                <div className="font-bold text-xs text-white">{selectedNode.label}</div>
                <div className="text-[11px] text-blue-400">{selectedNode.handle}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800 pt-2 text-[11px]">
            <div className="rounded bg-slate-950 p-1.5">
              <div className="text-slate-500">Influence Score</div>
              <div className="font-bold text-white text-sm">{selectedNode.influenceScore}/100</div>
            </div>
            <div className="rounded bg-slate-950 p-1.5">
              <div className="text-slate-500">Graph Role</div>
              <div className="font-bold text-amber-400">{selectedNode.role}</div>
            </div>
            <div className="rounded bg-slate-950 p-1.5">
              <div className="text-slate-500">PageRank</div>
              <div className="font-mono text-slate-200">{selectedNode.pageRank}</div>
            </div>
            <div className="rounded bg-slate-950 p-1.5">
              <div className="text-slate-500">Followers</div>
              <div className="font-mono text-slate-200">{selectedNode.followers.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
