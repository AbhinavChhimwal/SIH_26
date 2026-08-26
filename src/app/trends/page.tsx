'use client';

import React from 'react';
import { TrendVelocityMatrix } from '@/components/trends/TrendVelocityMatrix';
import { NarrativeEvolutionFlow } from '@/components/trends/NarrativeEvolutionFlow';
import { TopTrendsWidget } from '@/components/dashboard/TopTrendsWidget';
import { TrendingUp, Flame, Zap } from 'lucide-react';

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-pink-950/30 via-slate-900/60 to-purple-950/30 p-6 backdrop-blur shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/30">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Vector D: Real-Time Trend & Topic Evolution Studio
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated ranking, burstiness modeling, virality index scoring, and chronological narrative shift tracking
            </p>
          </div>
        </div>
      </div>

      {/* Trend Velocity Matrix (Scatter Plot) */}
      <TrendVelocityMatrix />

      {/* Narrative Lifecycle Evolution (Origin -> Amplification -> Peak -> Resolution) */}
      <NarrativeEvolutionFlow />

      {/* Real-Time Ranking Widget */}
      <TopTrendsWidget />
    </div>
  );
}
