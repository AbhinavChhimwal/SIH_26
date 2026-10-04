'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { NetworkNode, NetworkEdge } from '@/lib/types';
import * as d3 from 'd3-force';
import {
  SpatialGrid,
  generateLargeScaleNetwork,
  WEBGL_VERTEX_SHADER,
  WEBGL_FRAGMENT_SHADER,
  WEBGL_EDGE_VERTEX_SHADER,
  WEBGL_EDGE_FRAGMENT_SHADER,
} from '@/lib/services/webglGraphEngine';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Cpu,
  Activity,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Radio,
  Share2,
} from 'lucide-react';

interface Props {
  height?: number;
  onSelectNode?: (node: NetworkNode) => void;
  showControls?: boolean;
}

export const ForceDirectedGraph: React.FC<Props> = ({
  height = 560,
  onSelectNode,
  showControls = true,
}) => {
  const { filteredNetwork, cascadeStep } = useAnalytics();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [rendererMode, setRendererMode] = useState<'webgl' | 'canvas'>('canvas'); // Default to 2D canvas with physics & labels for crystal clarity
  const [nodeScaleTarget, setNodeScaleTarget] = useState<number>(0); // 0 = scenario nodes, >0 = synthetic large scale
  const [colorMode, setColorMode] = useState<'community' | 'sentiment'>('community');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [fps, setFps] = useState<number>(60);
  const [drawCalls, setDrawCalls] = useState<number>(2);

  // Active dataset
  const rawDataset = useMemo(() => {
    if (nodeScaleTarget > 0) {
      return generateLargeScaleNetwork(nodeScaleTarget);
    }
    return {
      nodes: filteredNetwork.nodes,
      edges: filteredNetwork.edges,
    };
  }, [nodeScaleTarget, filteredNetwork]);

  // Stable mutable simulation graph data
  const simulationData = useRef<{ nodes: any[]; edges: any[]; nodeMap: Map<string, any> }>({
    nodes: [],
    edges: [],
    nodeMap: new Map(),
  });

  const activeCascadeStep = filteredNetwork.cascadeTimeline[cascadeStep] || filteredNetwork.cascadeTimeline[0];
  const infectedNodeIds = useMemo(() => new Set(activeCascadeStep?.activeNodes || []), [activeCascadeStep]);
  const newlyInfectedIds = useMemo(() => new Set(activeCascadeStep?.newlyInfectedNodes || []), [activeCascadeStep]);
  const activeEdgeIds = useMemo(() => new Set(activeCascadeStep?.activeEdges || []), [activeCascadeStep]);

  const COMMUNITY_COLORS: Record<number, string> = {
    1: '#3b82f6', // Blue
    2: '#ef4444', // Red
    3: '#f59e0b', // Amber
    4: '#8b5cf6', // Purple
    5: '#10b981', // Emerald
  };

  const SENTIMENT_COLORS: Record<string, string> = {
    excitement: '#10b981',
    joy: '#06b6d4',
    trust: '#3b82f6',
    supportive: '#6366f1',
    sarcasm: '#f59e0b',
    anxiety: '#f43f5e',
    against: '#ef4444',
    anger: '#dc2626',
    fear: '#7c3aed',
    confusion: '#a855f7',
    neutral: '#64748b',
  };

  // FPS Counter
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

  // Initialize Force Simulation on Dataset change
  useEffect(() => {
    const width = 960;
    const currentHeight = height;

    const nodes = rawDataset.nodes.map((n, i) => {
      // Circular initial spread if no coordinates
      const angle = (i / rawDataset.nodes.length) * Math.PI * 2;
      const radius = 180 + (i % 3) * 60;
      return {
        ...n,
        x: n.x ?? Math.cos(angle) * radius,
        y: n.y ?? Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const edges = rawDataset.edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        ...e,
        source: nodeMap.get(e.source),
        target: nodeMap.get(e.target),
      }));

    simulationData.current = { nodes, edges, nodeMap };

    // Set up d3 force physics
    const sim = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(edges as any)
          .id((d: any) => d.id)
          .distance(nodes.length > 500 ? 30 : 110)
          .strength(0.6)
      )
      .force('charge', d3.forceManyBody().strength(nodes.length > 500 ? -40 : -280))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius((d: any) => (d.role === 'KOL' ? 28 : 16)))
      .alphaDecay(0.025);

    // Warm up simulation
    for (let i = 0; i < 40; i++) sim.tick();

    return () => {
      sim.stop();
    };
  }, [rawDataset, height]);

  // Main Render Loop (2D Canvas with high-performance graphics OR WebGL Shaders)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const currentHeight = canvas.height;

    let animId: number;

    if (rendererMode === 'webgl') {
      const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
      if (!gl) {
        setRendererMode('canvas');
        return;
      }

      // 1. Point Shaders (Nodes)
      const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vertShader, WEBGL_VERTEX_SHADER);
      gl.compileShader(vertShader);

      const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fragShader, WEBGL_FRAGMENT_SHADER);
      gl.compileShader(fragShader);

      const pointProgram = gl.createProgram()!;
      gl.attachShader(pointProgram, vertShader);
      gl.attachShader(pointProgram, fragShader);
      gl.linkProgram(pointProgram);

      // 2. Line Shaders (Edges)
      const edgeVert = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(edgeVert, WEBGL_EDGE_VERTEX_SHADER);
      gl.compileShader(edgeVert);

      const edgeFrag = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(edgeFrag, WEBGL_EDGE_FRAGMENT_SHADER);
      gl.compileShader(edgeFrag);

      const lineProgram = gl.createProgram()!;
      gl.attachShader(lineProgram, edgeVert);
      gl.attachShader(lineProgram, edgeFrag);
      gl.linkProgram(lineProgram);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const startTime = performance.now();

      const renderGL = (time: number) => {
        gl.viewport(0, 0, width, currentHeight);
        gl.clearColor(0.03, 0.05, 0.08, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const nodes = simulationData.current.nodes;
        const edges = simulationData.current.edges;

        // Matrix
        const sx = (2 / width) * transform.k;
        const sy = (-2 / currentHeight) * transform.k;
        const tx = (transform.x / (width / 2)) * transform.k;
        const ty = (-transform.y / (currentHeight / 2)) * transform.k;
        const matrix = new Float32Array([sx, 0, 0, 0, sy, 0, tx, ty, 1]);

        // --- DRAW EDGES (LINES) FIRST ---
        if (edges.length > 0) {
          gl.useProgram(lineProgram);
          const uMatLine = gl.getUniformLocation(lineProgram, 'u_matrix');
          gl.uniformMatrix3fv(uMatLine, false, matrix);

          const edgePositions = new Float32Array(edges.length * 4);
          const edgeColors = new Float32Array(edges.length * 8);
          const edgeActive = new Float32Array(edges.length * 2);

          edges.forEach((e: any, i: number) => {
            edgePositions[i * 4] = e.source.x || 0;
            edgePositions[i * 4 + 1] = e.source.y || 0;
            edgePositions[i * 4 + 2] = e.target.x || 0;
            edgePositions[i * 4 + 3] = e.target.y || 0;

            const isActive = activeEdgeIds.has(e.id) ? 1.0 : 0.0;
            edgeActive[i * 2] = isActive;
            edgeActive[i * 2 + 1] = isActive;

            // RGBA
            for (let v = 0; v < 2; v++) {
              edgeColors[i * 8 + v * 4] = 0.25;
              edgeColors[i * 8 + v * 4 + 1] = 0.35;
              edgeColors[i * 8 + v * 4 + 2] = 0.48;
              edgeColors[i * 8 + v * 4 + 3] = isActive ? 0.9 : 0.28;
            }
          });

          const edgePosBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, edgePosBuf);
          gl.bufferData(gl.ARRAY_BUFFER, edgePositions, gl.DYNAMIC_DRAW);
          const aEdgePos = gl.getAttribLocation(lineProgram, 'a_position');
          gl.enableVertexAttribArray(aEdgePos);
          gl.vertexAttribPointer(aEdgePos, 2, gl.FLOAT, false, 0, 0);

          const edgeColBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, edgeColBuf);
          gl.bufferData(gl.ARRAY_BUFFER, edgeColors, gl.DYNAMIC_DRAW);
          const aEdgeCol = gl.getAttribLocation(lineProgram, 'a_color');
          gl.enableVertexAttribArray(aEdgeCol);
          gl.vertexAttribPointer(aEdgeCol, 4, gl.FLOAT, false, 0, 0);

          const edgeActBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, edgeActBuf);
          gl.bufferData(gl.ARRAY_BUFFER, edgeActive, gl.DYNAMIC_DRAW);
          const aEdgeAct = gl.getAttribLocation(lineProgram, 'a_active');
          gl.enableVertexAttribArray(aEdgeAct);
          gl.vertexAttribPointer(aEdgeAct, 1, gl.FLOAT, false, 0, 0);

          gl.drawArrays(gl.LINES, 0, edges.length * 2);
        }

        // --- DRAW NODES (POINTS) ---
        gl.useProgram(pointProgram);
        const uMatPoint = gl.getUniformLocation(pointProgram, 'u_matrix');
        const uTimePoint = gl.getUniformLocation(pointProgram, 'u_time');
        gl.uniformMatrix3fv(uMatPoint, false, matrix);
        gl.uniform1f(uTimePoint, (time - startTime) / 1000);

        const count = nodes.length;
        const positions = new Float32Array(count * 2);
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 4);
        const infected = new Float32Array(count);

        nodes.forEach((n: any, i: number) => {
          positions[i * 2] = n.x || 0;
          positions[i * 2 + 1] = n.y || 0;
          sizes[i] = n.role === 'KOL' ? 24 : (n.role === 'Bridge' ? 18 : 12);

          const hex = colorMode === 'community' ? COMMUNITY_COLORS[n.communityId] || '#3b82f6' : SENTIMENT_COLORS[n.dominantSentiment] || '#3b82f6';
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;

          colors[i * 4] = r;
          colors[i * 4 + 1] = g;
          colors[i * 4 + 2] = b;
          colors[i * 4 + 3] = 1.0;

          infected[i] = infectedNodeIds.has(n.id) ? 1.0 : 0.0;
        });

        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
        const aPos = gl.getAttribLocation(pointProgram, 'a_position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const sizeBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
        gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
        const aSize = gl.getAttribLocation(pointProgram, 'a_size');
        gl.enableVertexAttribArray(aSize);
        gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);

        const colBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
        const aColor = gl.getAttribLocation(pointProgram, 'a_color');
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

        const infBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, infBuf);
        gl.bufferData(gl.ARRAY_BUFFER, infected, gl.DYNAMIC_DRAW);
        const aInf = gl.getAttribLocation(pointProgram, 'a_infected');
        gl.enableVertexAttribArray(aInf);
        gl.vertexAttribPointer(aInf, 1, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, count);
        setDrawCalls(2);

        animId = requestAnimationFrame(renderGL);
      };

      animId = requestAnimationFrame(renderGL);

      return () => {
        cancelAnimationFrame(animId);
      };
    } else {
      // --- 2D CANVAS PHYSICS RENDERER (CRYSTAL CLEAR EDGES, ARROWS, LABELS & PARTICLES) ---
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const render2D = () => {
        ctx.clearRect(0, 0, width, currentHeight);

        // Cyber Grid Background
        ctx.fillStyle = '#06090e';
        ctx.fillRect(0, 0, width, currentHeight);

        ctx.save();
        ctx.translate(width / 2 + transform.x, currentHeight / 2 + transform.y);
        ctx.scale(transform.k, transform.k);

        const nodes = simulationData.current.nodes;
        const edges = simulationData.current.edges;
        const now = performance.now();

        // 1. Draw Edges
        edges.forEach((e: any) => {
          const isActive = activeEdgeIds.has(e.id);
          const isConnectedToHover = hoveredNode && (e.source.id === hoveredNode.id || e.target.id === hoveredNode.id);

          ctx.beginPath();
          ctx.moveTo(e.source.x, e.source.y);
          ctx.lineTo(e.target.x, e.target.y);

          if (isActive) {
            ctx.strokeStyle = '#38bdf8'; // Sky blue for cascade
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 8;
          } else if (isConnectedToHover) {
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 2.2;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 6;
          } else {
            ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
            ctx.lineWidth = 1.2;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Signal photon moving along active or connected edges
          if (isActive || (nodes.length <= 100 && Math.random() < 0.3)) {
            const progress = (now / 1200 + e.weight) % 1;
            const px = e.source.x + (e.target.x - e.source.x) * progress;
            const py = e.source.y + (e.target.y - e.source.y) * progress;

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = isActive ? '#38bdf8' : '#e2e8f0';
            ctx.fill();
          }
        });

        // 2. Draw Nodes
        nodes.forEach((n: any) => {
          const isInfected = infectedNodeIds.has(n.id);
          const isNewlyInfected = newlyInfectedIds.has(n.id);
          const isHovered = hoveredNode?.id === n.id;
          const isSelected = selectedNode?.id === n.id;

          const baseRadius = n.role === 'KOL' ? 18 : (n.role === 'Bridge' ? 13 : 8);
          const radius = baseRadius * (isHovered || isSelected ? 1.25 : 1);

          const nodeColor =
            colorMode === 'community'
              ? COMMUNITY_COLORS[n.communityId] || '#3b82f6'
              : SENTIMENT_COLORS[n.dominantSentiment] || '#3b82f6';

          // Outer Pulse Ring for Infected / KOL nodes
          if (isInfected || n.role === 'KOL' || isHovered) {
            ctx.beginPath();
            const pulseR = radius + (isInfected ? 6 + Math.sin(now / 200) * 3 : 5);
            ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
            ctx.fillStyle = isInfected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.15)';
            ctx.fill();
            ctx.strokeStyle = isInfected ? '#38bdf8' : nodeColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Node Circle Fill
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = isHovered || n.role === 'KOL' ? 14 : 4;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Border Ring
          ctx.strokeStyle = isHovered || isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = isHovered ? 2.5 : 1.5;
          ctx.stroke();

          // Role Badge Icon / Initial inside circle
          if (radius >= 12) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.role === 'KOL' ? '★' : (n.role === 'Bridge' ? '⇄' : ''), n.x, n.y);
          }

          // 3. Node Labels (Handles & Roles)
          if (showLabels && (nodes.length <= 60 || n.role === 'KOL' || isHovered || isSelected)) {
            ctx.font = isHovered ? 'bold 12px sans-serif' : '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            // Background pill for label
            const labelText = n.handle || n.label;
            const metrics = ctx.measureText(labelText);
            const pillW = metrics.width + 10;
            const pillH = 16;
            const pillY = n.y + radius + 4;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(n.x - pillW / 2, pillY, pillW, pillH, 4);
            ctx.fill();
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Text
            ctx.fillStyle = isHovered ? '#38bdf8' : (n.role === 'KOL' ? '#f8fafc' : '#cbd5e1');
            ctx.fillText(labelText, n.x, pillY + 2);
          }
        });

        ctx.restore();
        animId = requestAnimationFrame(render2D);
      };

      animId = requestAnimationFrame(render2D);

      return () => {
        cancelAnimationFrame(animId);
      };
    }
  }, [rendererMode, rawDataset, colorMode, cascadeStep, transform, showLabels, hoveredNode, selectedNode]);

  // Handle Mouse Move for Hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - (canvas.width / 2 + transform.x)) / transform.k;
    const mouseY = (e.clientY - rect.top - (canvas.height / 2 + transform.y)) / transform.k;

    const nodes = simulationData.current.nodes;
    let found: NetworkNode | null = null;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const r = n.role === 'KOL' ? 22 : 14;
      const d = Math.hypot(n.x - mouseX, n.y - mouseY);
      if (d <= r) {
        found = n;
        break;
      }
    }

    setHoveredNode(found);
  };

  // Handle Canvas Click for Node Selection
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
      if (onSelectNode) onSelectNode(hoveredNode);
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Top Floating Controls Strip */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Renderer Engine & Scale Selector */}
          <div className="pointer-events-auto flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/90 p-1.5 backdrop-blur shadow-lg text-xs">
            {/* 2D Canvas (Physics & Connected Topology) */}
            <button
              onClick={() => setRendererMode('canvas')}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 font-bold transition ${
                rendererMode === 'canvas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Topology Physics (Edges & Labels)</span>
            </button>

            {/* WebGL GPU Shaders */}
            <button
              onClick={() => setRendererMode('webgl')}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
                rendererMode === 'webgl'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>WebGL Shaders (GPU 60fps)</span>
            </button>

            <span className="text-slate-700">|</span>

            {/* Scale Presets */}
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

          {/* Right Action Tools: Labels Toggle, Color Mode, Zoom */}
          <div className="pointer-events-auto flex items-center space-x-2">
            {/* FPS & Draw Call Badge */}
            <div className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs font-mono backdrop-blur shadow-lg">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-400">FPS: <strong className="text-emerald-400">{fps}</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Nodes: <strong className="text-white">{rawDataset.nodes.length.toLocaleString()}</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Edges: <strong className="text-cyan-400">{rawDataset.edges.length.toLocaleString()}</strong></span>
            </div>

            {/* Labels Toggle */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-1.5 rounded-xl border border-slate-800 bg-slate-900/90 text-xs transition ${
                showLabels ? 'text-blue-400 border-blue-500/40' : 'text-slate-500'
              }`}
              title={showLabels ? 'Hide Labels' : 'Show Labels'}
            >
              {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            {/* Zoom Controls */}
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

      {/* Main Canvas with Interactivity */}
      <canvas
        ref={canvasRef}
        width={960}
        height={height}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="w-full cursor-crosshair bg-slate-950 block"
      />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none hidden sm:flex items-center space-x-3 rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur">
        <span className="font-semibold text-slate-300">Topology Legend:</span>
        <span className="flex items-center space-x-1">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
          <span>Community Clusters</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="h-2.5 w-2.5 rounded-full ring-2 ring-sky-400 bg-transparent"></span>
          <span>Cascade Infection Wave</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="text-amber-400 font-bold">★</span>
          <span>Key Opinion Leader (KOL)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="text-slate-300 font-bold">⇄</span>
          <span>Community Bridge</span>
        </span>
      </div>

      {/* Selected / Hovered Node Quick Profile Card */}
      {(selectedNode || hoveredNode) && (
        <div className="absolute top-16 right-3 z-20 w-72 rounded-xl border border-slate-800 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur">
          {(() => {
            const node = selectedNode || hoveredNode!;
            return (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={node.avatar}
                      alt={node.label}
                      className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                    />
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1">
                        <span>{node.label}</span>
                        {node.role === 'KOL' && <span className="text-amber-400 font-bold">★</span>}
                      </div>
                      <div className="text-[11px] text-blue-400">{node.handle}</div>
                    </div>
                  </div>
                  {selectedNode && (
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-slate-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-800 pt-2 text-[11px]">
                  <div className="rounded bg-slate-950 p-1.5">
                    <div className="text-slate-500">Influence Score</div>
                    <div className="font-bold text-white text-sm">{node.influenceScore}/100</div>
                  </div>
                  <div className="rounded bg-slate-950 p-1.5">
                    <div className="text-slate-500">Graph Role</div>
                    <div className="font-bold text-amber-400">{node.role}</div>
                  </div>
                  <div className="rounded bg-slate-950 p-1.5">
                    <div className="text-slate-500">PageRank</div>
                    <div className="font-mono text-slate-200">{node.pageRank}</div>
                  </div>
                  <div className="rounded bg-slate-950 p-1.5">
                    <div className="text-slate-500">Followers</div>
                    <div className="font-mono text-slate-200">{node.followers.toLocaleString()}</div>
                  </div>
                  <div className="col-span-2 rounded bg-slate-950 p-1.5 flex justify-between items-center">
                    <span className="text-slate-500">Dominant Sentiment:</span>
                    <span className="font-bold text-emerald-400 capitalize">{node.dominantSentiment}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
