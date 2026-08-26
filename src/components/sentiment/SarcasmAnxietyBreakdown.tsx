'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { AlertTriangle, ShieldAlert, CheckCircle2, Flame, HelpCircle } from 'lucide-react';

export const SarcasmAnxietyBreakdown: React.FC = () => {
  const { filteredPosts } = useAnalytics();

  const total = Math.max(1, filteredPosts.length);
  const sarcasticPosts = filteredPosts.filter((p) => p.sentiment.sarcasmScore > 0.3);
  const anxiousPosts = filteredPosts.filter((p) => p.sentiment.anxietyScore > 0.3);

  const sarcasmPct = Math.round((sarcasticPosts.length / total) * 100);
  const anxietyPct = Math.round((anxiousPosts.length / total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Sarcasm & Irony Diagnostics */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Sarcasm & Irony Linguistic Diagnostics
            </h3>
          </div>
          <div className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
            {sarcasmPct}% of Volume
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Identifies syntactic contrast (e.g. praising terms with crash/bug tokens), exaggerated hyperbolic punctuation, and quote-wrapped praise.
        </p>

        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-300">Top Sarcastic Utterances Detected:</div>
          {sarcasticPosts.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{p.author.handle}</span>
                <span className="font-mono text-[10px] text-amber-400 font-bold">
                  Sarcasm: {Math.round(p.sentiment.sarcasmScore * 100)}%
                </span>
              </div>
              <p className="text-slate-300 italic">"{p.content}"</p>
              <div className="text-[10px] text-slate-500">
                Trigger Heuristic: <span className="text-amber-300 font-medium">Contradictory sentiment clauses</span>
              </div>
            </div>
          ))}
          {sarcasticPosts.length === 0 && (
            <p className="text-xs text-slate-500 py-4 text-center">No high-sarcasm posts in active filter.</p>
          )}
        </div>
      </div>

      {/* Anxiety & Crisis Signals */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Anxiety & Threat Volatility Signals
            </h3>
          </div>
          <div className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
            {anxietyPct}% of Volume
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Monitors sudden surges in threat terminology, catastrophic anticipation, zero-day leak references, and security panic.
        </p>

        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-300">Top Anxiety Utterances Detected:</div>
          {anxiousPosts.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{p.author.handle}</span>
                <span className="font-mono text-[10px] text-rose-400 font-bold">
                  Anxiety: {Math.round(p.sentiment.anxietyScore * 100)}%
                </span>
              </div>
              <p className="text-slate-300 italic">"{p.content}"</p>
              <div className="text-[10px] text-slate-500">
                Trigger Heuristic: <span className="text-rose-300 font-medium">Critical vulnerability & panic keywords</span>
              </div>
            </div>
          ))}
          {anxiousPosts.length === 0 && (
            <p className="text-xs text-slate-500 py-4 text-center">No high-anxiety posts in active filter.</p>
          )}
        </div>
      </div>
    </div>
  );
};
