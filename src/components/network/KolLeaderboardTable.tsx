'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { NetworkNode, Platform } from '@/lib/types';
import { Twitter, Send, Instagram, Facebook, MessageSquare, Video, Crown, Zap, Shield, ArrowUpDown } from 'lucide-react';

export const KolLeaderboardTable: React.FC<{ onSelectNode?: (node: NetworkNode) => void }> = ({ onSelectNode }) => {
  const { filteredNetwork } = useAnalytics();
  const [sortBy, setSortBy] = useState<'influenceScore' | 'pageRank' | 'betweennessCentrality' | 'followers'>('influenceScore');

  const sortedNodes = [...filteredNetwork.nodes].sort((a, b) => b[sortBy] - a[sortBy]);

  const platformIcons: Record<Platform, any> = {
    x: Twitter,
    telegram: Send,
    instagram: Instagram,
    facebook: Facebook,
    reddit: MessageSquare,
    youtube: Video,
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Key Opinion Leaders (KOLs) & Centrality Rankings
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Nodes of high authority ranked by PageRank, Betweenness Centrality (Bridge Power), and Audience Spread
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          <span className="text-slate-500 px-1 text-[11px]">Sort:</span>
          {(
            [
              { key: 'influenceScore', label: 'Composite Score' },
              { key: 'pageRank', label: 'PageRank' },
              { key: 'betweennessCentrality', label: 'Betweenness (Bridge)' },
              { key: 'followers', label: 'Followers' },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`rounded px-2 py-0.5 font-medium transition ${
                sortBy === s.key ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="pb-3 pl-2">Rank / Account</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Platform</th>
              <th className="pb-3 text-right">Composite Influence</th>
              <th className="pb-3 text-right">PageRank</th>
              <th className="pb-3 text-right">Betweenness</th>
              <th className="pb-3 text-right">In-Degree</th>
              <th className="pb-3 text-right pr-2">Followers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedNodes.map((node, index) => {
              const Icon = platformIcons[node.platform] || Twitter;
              return (
                <tr
                  key={node.id}
                  onClick={() => onSelectNode && onSelectNode(node)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <td className="py-2.5 pl-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-slate-500 w-4 text-[11px]">{index + 1}</span>
                      <img
                        src={node.avatar}
                        alt={node.label}
                        className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="font-bold text-white group-hover:text-blue-400 transition flex items-center space-x-1">
                          <span>{node.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{node.handle}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                        node.role === 'KOL'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : node.role === 'Bridge'
                          ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                          : node.role === 'Amplifier'
                          ? 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {node.role}
                    </span>
                  </td>

                  <td className="py-2.5">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      <span className="capitalize">{node.platform}</span>
                    </div>
                  </td>

                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-white">{node.influenceScore}</span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </div>
                  </td>

                  <td className="py-2.5 text-right font-mono text-slate-300">{node.pageRank}</td>
                  <td className="py-2.5 text-right font-mono text-slate-300">{node.betweennessCentrality}</td>
                  <td className="py-2.5 text-right font-mono text-slate-300">{node.inDegree}</td>
                  <td className="py-2.5 text-right pr-2 font-mono text-slate-400">
                    {node.followers.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
