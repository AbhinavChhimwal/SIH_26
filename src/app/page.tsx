'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { KpiGrid } from '@/components/dashboard/KpiGrid';
import { SentimentStreamTimeline } from '@/components/dashboard/SentimentStreamTimeline';
import { TopTrendsWidget } from '@/components/dashboard/TopTrendsWidget';
import { RecentCrossPlatformPosts } from '@/components/dashboard/RecentCrossPlatformPosts';
import { ForceDirectedGraph } from '@/components/network/ForceDirectedGraph';
import { AlertDispatcherModal } from '@/components/dashboard/AlertDispatcherModal';
import { Share2, ArrowUpRight, Sparkles, Layers, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const { activeScenario, userRole } = useAnalytics();

  return (
    <div className="space-y-6">
      {/* Top Welcome & Scenario Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-purple-950/40 p-6 backdrop-blur shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                ACTIVE INTELLIGENCE WORKSPACE
              </span>
              <span className="text-xs text-slate-400">Role: <strong className="text-white capitalize">{userRole}</strong></span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {activeScenario.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {activeScenario.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/network"
              className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
            >
              <Share2 className="h-4 w-4" />
              <span>Launch Link Analysis & WebGL</span>
            </Link>
            <Link
              href="/reports"
              className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <span>Export Intel Briefing</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Core Real-Time KPI Cards */}
      <KpiGrid />

      {/* Grid: Timeline Fluctuation & Top Trending Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SentimentStreamTimeline />
        </div>
        <div>
          <TopTrendsWidget />
        </div>
      </div>

      {/* Hardware-Accelerated Network Topology Snapshot */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Hardware-Accelerated Network Topology (WebGL 60fps / 25K Scale Engine)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive GPU point instancing with PageRank sizing, community clustering, and spatial collision indexing
            </p>
          </div>
          <Link
            href="/network"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center"
          >
            Full Graph Studio <ArrowUpRight className="h-3 w-3 ml-0.5" />
          </Link>
        </div>

        <ForceDirectedGraph height={380} showControls={true} />
      </div>

      {/* Automated AI Crisis Alerting & Webhook Dispatcher */}
      <AlertDispatcherModal />

      {/* Cross-Platform Chronological Stream Feed */}
      <RecentCrossPlatformPosts />
    </div>
  );
}
