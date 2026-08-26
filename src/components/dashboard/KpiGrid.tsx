'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import {
  Users,
  TrendingUp,
  SmilePlus,
  Share2,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';

export const KpiGrid: React.FC = () => {
  const { filteredPosts, filteredTrends, filteredNetwork, filteredDemographics, ingestionState } = useAnalytics();

  // Aggregate metrics
  const totalPosts = filteredPosts.length;
  const avgPolarity = totalPosts > 0
    ? filteredPosts.reduce((acc, p) => acc + p.sentiment.polarity, 0) / totalPosts
    : 0;

  const sarcasmCount = filteredPosts.filter(p => p.sentiment.sarcasmScore > 0.3).length;
  const sarcasmPct = totalPosts > 0 ? ((sarcasmCount / totalPosts) * 100).toFixed(0) : '0';

  const anxietyCount = filteredPosts.filter(p => p.sentiment.anxietyScore > 0.3).length;
  const anxietyPct = totalPosts > 0 ? ((anxietyCount / totalPosts) * 100).toFixed(0) : '0';

  const dominantEmotion = filteredPosts.length > 0
    ? filteredPosts.map(p => p.sentiment.dominantEmotion).sort((a, b) =>
        filteredPosts.filter(v => v.sentiment.dominantEmotion === a).length -
        filteredPosts.filter(v => v.sentiment.dominantEmotion === b).length
      ).pop()
    : 'neutral';

  const topTrend = filteredTrends[0] || { keyword: 'Nova-4X', velocity: 85, viralityScore: 92 };
  const kolCount = filteredNetwork.nodes.filter(n => n.role === 'KOL').length;
  const topKOL = filteredNetwork.nodes.sort((a, b) => b.influenceScore - a.influenceScore)[0]?.handle || '@influencer';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* KPI 1: Ingestion Volume & Audience Sample */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 relative overflow-hidden backdrop-blur shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Volume</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white tracking-tight">
            {totalPosts.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
            <span className="font-semibold">{ingestionState.throughputPerSecond} msg/s</span>
            <span className="text-slate-400 ml-1.5">active feed</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Net Polarity Score */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 relative overflow-hidden backdrop-blur shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Net Polarity</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <SmilePlus className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-bold tracking-tight ${avgPolarity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {avgPolarity >= 0 ? `+${avgPolarity.toFixed(2)}` : avgPolarity.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400">[-1.0 to +1.0]</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Status: <span className="font-medium text-slate-200">{avgPolarity > 0.2 ? 'Positive Sentiment' : (avgPolarity < -0.2 ? 'Hostile / Negative' : 'Mixed / Contested')}</span>
          </div>
        </div>
      </div>

      {/* KPI 3: Dominant Nuanced Emotion */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 relative overflow-hidden backdrop-blur shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Emotion Vector</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold text-white capitalize tracking-tight truncate">
            {dominantEmotion}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sarcasm: <strong className="text-amber-400">{sarcasmPct}%</strong></span>
            <span>Anxiety: <strong className="text-rose-400">{anxietyPct}%</strong></span>
          </div>
        </div>
      </div>

      {/* KPI 4: Audience Reach Sampled */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 relative overflow-hidden backdrop-blur shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Sampled Reach</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white tracking-tight">
            {(filteredDemographics.totalAudienceSampled / 1000).toFixed(1)}K
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Top Persona: <span className="font-medium text-slate-200">{filteredDemographics.personaClusters[0]?.name || 'Tech Evangelist'}</span>
          </div>
        </div>
      </div>

      {/* KPI 5: Top Rising Trend & Virality */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 relative overflow-hidden backdrop-blur shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Top Trend</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg font-bold text-white truncate tracking-tight">
            {topTrend.hashtag || topTrend.keyword}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-400">
            <Zap className="h-3 w-3 mr-0.5 fill-current" />
            <span>Virality {topTrend.viralityScore}/100</span>
            <span className="text-slate-400 ml-1">({topTrend.velocity > 0 ? `+${topTrend.velocity}%` : `${topTrend.velocity}%`})</span>
          </div>
        </div>
      </div>

      {/* KPI 6: Key Opinion Leaders (KOLs) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 relative overflow-hidden backdrop-blur shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">KOL Authority</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Share2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white tracking-tight">
            {kolCount} <span className="text-xs font-normal text-slate-400">KOL Nodes</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            Top Seed: <span className="font-semibold text-cyan-400">{topKOL}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
