'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { TrendStatus } from '@/lib/types';
import { TrendingUp, Zap, Flame, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

export const TopTrendsWidget: React.FC = () => {
  const { filteredTrends } = useAnalytics();

  const statusBadges: Record<TrendStatus, { label: string; bg: string; text: string }> = {
    emerging: { label: 'Emerging', bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400' },
    peaking: { label: 'Viral Peak', bg: 'bg-rose-500/15 border-rose-500/30', text: 'text-rose-400' },
    stabilizing: { label: 'Stabilizing', bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-400' },
    declining: { label: 'Declining', bg: 'bg-slate-500/15 border-slate-500/30', text: 'text-slate-400' },
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Flame className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Real-Time Trending Topics</h3>
          </div>
          <Link
            href="/trends"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center"
          >
            Full Matrix <ArrowUpRight className="h-3 w-3 ml-0.5" />
          </Link>
        </div>

        <div className="mt-3 space-y-2.5">
          {filteredTrends.slice(0, 5).map((trend, idx) => {
            const badge = statusBadges[trend.status] || statusBadges.stabilizing;
            return (
              <div
                key={trend.id}
                className="group flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 p-2.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-slate-500 w-4">{idx + 1}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-white group-hover:text-blue-400 transition">
                        {trend.hashtag || trend.keyword}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span>Vol: {trend.volume.toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-slate-300">Stage: {trend.narrativeStage}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="font-mono text-xs font-bold text-white">{trend.viralityScore}</span>
                    <span className="text-[10px] text-slate-500">/100</span>
                  </div>
                  <div className={`text-[10px] font-medium ${trend.velocity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trend.velocity >= 0 ? `+${trend.velocity}%` : `${trend.velocity}%`} vel
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Burstiness Model: <strong className="text-slate-300">Kleinberg TF-IDF</strong></span>
        <span>Acceleration Index: <strong className="text-emerald-400">+18.4%</strong></span>
      </div>
    </div>
  );
};
