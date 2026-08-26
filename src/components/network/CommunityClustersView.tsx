'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Users, Layers, MessageSquare, Sparkles } from 'lucide-react';

export const CommunityClustersView: React.FC = () => {
  const { filteredNetwork, filters, updateFilter } = useAnalytics();
  const communities = filteredNetwork.communities || [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Louvain Modularity Community Detection
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Algorithmic partitioning of follower networks into dense topical and demographic sub-clusters
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
          Modularity Index Q = 0.68
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {communities.map((comm) => {
          const isSelected = filters.selectedCommunity === comm.id;
          return (
            <div
              key={comm.id}
              onClick={() => updateFilter('selectedCommunity', isSelected ? null : comm.id)}
              className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition ${
                isSelected
                  ? 'border-blue-500 bg-blue-600/15 ring-1 ring-blue-500 shadow-md shadow-blue-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: comm.color }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cluster {comm.id}
                  </span>
                </div>

                <h4 className="mt-2 text-xs font-bold text-white">{comm.name}</h4>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{comm.dominantTheme}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Graph Share:</span>
                  <span className="font-bold text-slate-200">{comm.percentage}% ({comm.size} nodes)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Avg Polarity:</span>
                  <span
                    className={`font-mono font-bold ${
                      comm.sentimentAvg >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {comm.sentimentAvg >= 0 ? `+${comm.sentimentAvg}` : comm.sentimentAvg}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {comm.topNodes.map((n) => (
                    <span
                      key={n}
                      className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-blue-400"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
