'use client';

import React from 'react';
import { ForceDirectedGraph } from '@/components/network/ForceDirectedGraph';
import { CascadeSimulatorControls } from '@/components/network/CascadeSimulatorControls';
import { KolLeaderboardTable } from '@/components/network/KolLeaderboardTable';
import { CommunityClustersView } from '@/components/network/CommunityClustersView';
import { Share2, Radio, Crown, Layers } from 'lucide-react';

export default function NetworkPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-blue-950/30 p-6 backdrop-blur shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Vector E: Link Analysis, Network Topology & Influence Cascade
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Force-directed relationship graphs, Key Opinion Leader (KOL) centralities, Louvain community modularity, and step-by-step diffusion simulation
            </p>
          </div>
        </div>
      </div>

      {/* Main Force-Directed Topology Graph */}
      <ForceDirectedGraph height={540} showControls={true} />

      {/* Step-by-Step Cascade Diffusion Controls */}
      <CascadeSimulatorControls />

      {/* Louvain Modularity Community Clusters */}
      <CommunityClustersView />

      {/* Key Opinion Leaders Leaderboard */}
      <KolLeaderboardTable />
    </div>
  );
}
