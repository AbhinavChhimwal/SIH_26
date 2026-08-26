'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Platform } from '@/lib/types';
import {
  Twitter,
  Send,
  Instagram,
  Facebook,
  MessageSquare,
  Video,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Radio,
  Key,
} from 'lucide-react';

export const PlatformConnectorCards: React.FC = () => {
  const { ingestionState } = useAnalytics();
  const connectors = Object.values(ingestionState.connectors);

  const PLATFORM_ICONS: Record<Platform, any> = {
    x: Twitter,
    telegram: Send,
    instagram: Instagram,
    facebook: Facebook,
    reddit: MessageSquare,
    youtube: Video,
  };

  const PRIORITY_BADGES: Record<Platform, { label: string; color: string }> = {
    x: { label: 'Essential (Must-Have)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    telegram: { label: 'Essential (Must-Have)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    instagram: { label: 'Desirable (Good-to-Have)', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    facebook: { label: 'Desirable (Good-to-Have)', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    reddit: { label: 'Appreciable Addition', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    youtube: { label: 'Appreciable Addition (Video Context)', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Multi-Platform Data Ingestion Connectors (6 Sources)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time streaming adapters for posts, user interactions, comments, channel broadcasts, and video contexts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/ingestion/live-fetch');
                const data = await res.json();
                alert(`[Live API Fetch Result] Fetched ${data.count} genuine posts from external endpoints (Reddit live, Twitter/YouTube if keys configured).`);
              } catch (e) {
                alert(`Error fetching live API: ${(e as Error).message}`);
              }
            }}
            className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Test Live External APIs</span>
          </button>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>All 6 Adapters Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => {
          const Icon = PLATFORM_ICONS[c.platform] || Twitter;
          const priority = PRIORITY_BADGES[c.platform];

          return (
            <div
              key={c.platform}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-white">
                      <Icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{c.name}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Key className="h-2.5 w-2.5" /> Auth: {c.authType}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${
                      c.status === 'connected'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-2.5">
                  <span className={`rounded border px-2 py-0.5 text-[9px] font-bold ${priority.color}`}>
                    {priority.label}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Throughput:</span>
                  <span className="font-mono font-bold text-white">{c.ingestedPerMinute} msg/min</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Ingested:</span>
                  <span className="font-mono text-slate-200">{c.totalIngested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stream Latency:</span>
                  <span className="font-mono text-emerald-400">{c.latencyMs} ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Last Synchronization:</span>
                  <span className="text-slate-300">{c.lastSync}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
