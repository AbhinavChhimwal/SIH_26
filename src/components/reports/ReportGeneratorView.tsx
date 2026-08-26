'use client';

import React, { useRef } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  Calendar,
  Layers,
  Activity,
  Users,
  TrendingUp,
  Share2,
} from 'lucide-react';

export const ReportGeneratorView: React.FC = () => {
  const {
    activeScenario,
    filteredPosts,
    filteredTrends,
    filteredNetwork,
    filteredDemographics,
    userRole,
  } = useAnalytics();

  const reportRef = useRef<HTMLDivElement | null>(null);

  // Compute summary stats
  const totalVolume = filteredPosts.length;
  const avgPolarity = totalVolume > 0
    ? filteredPosts.reduce((acc, p) => acc + p.sentiment.polarity, 0) / totalVolume
    : 0;

  const sarcasmCount = filteredPosts.filter((p) => p.sentiment.sarcasmScore > 0.3).length;
  const sarcasmPct = totalVolume > 0 ? Math.round((sarcasmCount / totalVolume) * 100) : 0;

  const anxietyCount = filteredPosts.filter((p) => p.sentiment.anxietyScore > 0.3).length;
  const anxietyPct = totalVolume > 0 ? Math.round((anxietyCount / totalVolume) * 100) : 0;

  const topKOL = filteredNetwork.nodes.sort((a, b) => b.influenceScore - a.influenceScore)[0];
  const topTrend = filteredTrends[0];

  // Export JSON function
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(
        {
          scenario: activeScenario.title,
          generatedAt: new Date().toISOString(),
          userRole,
          summary: {
            totalVolume,
            avgPolarity,
            sarcasmPct,
            anxietyPct,
            sampledReach: filteredDemographics.totalAudienceSampled,
          },
          topKOL,
          topTrends: filteredTrends.slice(0, 5),
          demographics: filteredDemographics,
          posts: filteredPosts,
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sentix-intel-briefing-${activeScenario.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['id', 'platform', 'author_name', 'author_handle', 'polarity', 'dominant_emotion', 'sarcasm_score', 'anxiety_score', 'likes', 'reposts', 'content'];
    const rows = filteredPosts.map(p => [
      p.id,
      p.platform,
      `"${p.author.name.replace(/"/g, '""')}"`,
      p.author.handle,
      p.sentiment.polarity,
      p.sentiment.dominantEmotion,
      p.sentiment.sarcasmScore,
      p.sentiment.anxietyScore,
      p.likes,
      p.reposts,
      `"${p.content.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentix-posts-dataset-${activeScenario.id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Automated Executive Intelligence Briefing
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesized multi-vector intelligence report ready for executive review, stakeholders, and audit archives
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" />
            <span>Export JSON Intel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Briefing Document Canvas */}
      <div
        ref={reportRef}
        className="rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl space-y-6 text-slate-200"
      >
        {/* Document Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                CONFIDENTIAL INTEL BRIEFING
              </span>
              <span className="text-xs text-slate-500">REF: SNX-SIH-152</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-white tracking-tight">
              {activeScenario.title}
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">{activeScenario.description}</p>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="flex items-center justify-end space-x-1 text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
            </div>
            <div className="text-slate-500 text-[11px]">Classification: INTERNAL STRATEGY</div>
            <div className="text-slate-400 text-[11px]">Prepared by: <strong className="text-white">Sentix AI Synthesis Engine</strong></div>
          </div>
        </div>

        {/* Executive Scorecard Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="text-[11px] uppercase font-bold text-slate-500">Total Discourse Volume</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">{totalVolume.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across 6 Ingestion Connectors</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="text-[11px] uppercase font-bold text-slate-500">Net Polarity Vector</div>
            <div
              className={`text-2xl font-bold font-mono mt-1 ${
                avgPolarity >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {avgPolarity >= 0 ? `+${avgPolarity.toFixed(2)}` : avgPolarity.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Scale [-1.0 Negative, +1.0 Positive]</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="text-[11px] uppercase font-bold text-slate-500">Sarcasm & Anxiety Index</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {sarcasmPct}% <span className="text-xs text-slate-400 font-normal">sarcasm</span> / {anxietyPct}% <span className="text-xs text-slate-400 font-normal">anxiety</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Linguistic Contradiction Heuristics</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="text-[11px] uppercase font-bold text-slate-500">Sampled Follower Reach</div>
            <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
              {(filteredDemographics.totalAudienceSampled / 1000).toFixed(0)}K
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">6 Cohorts Inferred</div>
          </div>
        </div>

        {/* Section 1: Strategic Situation Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
            <Sparkles className="h-4 w-4 text-blue-400" /> 1. Strategic Situation Assessment
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The ongoing discourse around <strong className="text-white">{activeScenario.title}</strong> has generated high emotional resonance across primary networks (X, Telegram, Reddit). The predominant sentiment vector indicates an average polarity of <strong className={avgPolarity >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{avgPolarity.toFixed(2)}</strong>, with significant sarcasm indicators ({sarcasmPct}%) in technical discussions and rising anxiety signals ({anxietyPct}%) concentrated in incident response channels.
          </p>
        </div>

        {/* Section 2: Key Opinion Leaders (KOLs) & Network Diffusion */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
            <Share2 className="h-4 w-4 text-cyan-400" /> 2. Key Opinion Leaders (KOLs) & Influence Propagation
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Network link analysis identified <strong className="text-cyan-400">{topKOL?.label || 'Seed KOL'} ({topKOL?.handle || '@influencer'})</strong> as the primary seed node of authority, possessing a PageRank of <span className="font-mono text-white">{topKOL?.pageRank}</span> and Betweenness Centrality of <span className="font-mono text-white">{topKOL?.betweennessCentrality}</span>. The information cascade simulation demonstrates an estimated reproduction rate of <strong className="text-amber-400">$R_0 = 2.4$</strong> during the second diffusion wave.
          </p>
        </div>

        {/* Section 3: Demographic & Regional Focus */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
            <Users className="h-4 w-4 text-purple-400" /> 3. Demographic & Regional Resonance
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Audience inference reveals the most captivated cohort to be <strong className="text-white">25-34 Age Bracket (Young Professionals)</strong> comprising the largest conversational volume. Geographically, discussions are concentrated in <strong className="text-white">{filteredDemographics.geographicDistribution[0]?.country || 'United States'}</strong> ({filteredDemographics.geographicDistribution[0]?.percentage || 45}%) and <strong className="text-white">{filteredDemographics.geographicDistribution[1]?.country || 'Germany'}</strong> ({filteredDemographics.geographicDistribution[1]?.percentage || 20}%).
          </p>
        </div>

        {/* Section 4: Actionable Recommendations */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-2 text-xs">
          <h4 className="font-bold text-blue-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-400" /> 4. Actionable Strategic Directives
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li><strong>Direct Influencer Engagement:</strong> Initiate priority outreach to bridge nodes identified in Cluster 3 to counteract rising sarcasm and misinformation.</li>
            <li><strong>Anxiety De-Escalation:</strong> Issue clear technical clarifications addressing data integrity to reduce the {anxietyPct}% anxiety index detected on Telegram & Reddit.</li>
            <li><strong>Multi-Channel Synchronization:</strong> Maintain active telemetry monitoring across all 6 connector feeds with alert thresholds set at R0 &gt; 2.0.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
