'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { TrendTopic, TrendStatus } from '@/lib/types';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Zap, Flame, Sparkles } from 'lucide-react';

export const TrendVelocityMatrix: React.FC = () => {
  const { filteredTrends } = useAnalytics();
  const [selectedTopic, setSelectedTopic] = useState<TrendTopic | null>(filteredTrends[0] || null);

  const scatterData = filteredTrends.map((t) => ({
    name: t.hashtag || t.keyword,
    volume: t.volume,
    velocity: t.velocity,
    viralityScore: t.viralityScore,
    status: t.status,
    sentiment: t.sentimentScore,
    raw: t,
  }));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Trend Velocity & Acceleration Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            2D phase space mapping conversation Volume (X-axis) against Growth Velocity % (Y-axis) with Virality bubble radius
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scatter Matrix Chart */}
        <div className="lg:col-span-2 h-80 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                dataKey="volume"
                name="Volume"
                stroke="#64748b"
                fontSize={11}
                unit=" posts"
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="velocity"
                name="Velocity"
                stroke="#64748b"
                fontSize={11}
                unit="%"
                tickLine={false}
              />
              <ZAxis type="number" dataKey="viralityScore" range={[60, 400]} name="Virality Score" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white shadow-xl">
                        <div className="font-bold text-pink-400">{data.name}</div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          Volume: {data.volume} posts | Velocity: {data.velocity}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Virality Score: {data.viralityScore}/100 | Status: {data.status}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Topics"
                data={scatterData}
                fill="#ec4899"
                onClick={(e) => e && e.raw && setSelectedTopic(e.raw)}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Trend Detail Card */}
        {selectedTopic && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-pink-500/10 border border-pink-500/30 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                  {selectedTopic.status.toUpperCase()}
                </span>
                <span className="font-mono text-xs text-slate-400 font-semibold">
                  Stage: {selectedTopic.narrativeStage}
                </span>
              </div>

              <h4 className="mt-2 text-base font-bold text-white">
                {selectedTopic.hashtag || selectedTopic.keyword}
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                Key Opinion Leader: <strong className="text-blue-400">{selectedTopic.keyOpinionLeader}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3">
              <div className="rounded bg-slate-900 p-2 border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Virality Index</div>
                <div className="font-bold text-amber-400 text-lg font-mono">{selectedTopic.viralityScore}/100</div>
              </div>
              <div className="rounded bg-slate-900 p-2 border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Hourly Velocity</div>
                <div className="font-bold text-emerald-400 text-lg font-mono">
                  {selectedTopic.velocity >= 0 ? `+${selectedTopic.velocity}%` : `${selectedTopic.velocity}%`}
                </div>
              </div>
            </div>

            {selectedTopic.coOccurringKeywords.length > 0 && (
              <div className="text-[11px] pt-1">
                <div className="text-slate-500 mb-1">Co-Occurring Keywords:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTopic.coOccurringKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
