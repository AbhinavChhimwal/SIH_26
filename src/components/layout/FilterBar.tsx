'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Platform, EmotionType } from '@/lib/types';
import {
  Twitter,
  Send,
  Instagram,
  Facebook,
  MessageSquare,
  Video,
  Filter,
  RotateCcw,
  Clock,
  Sparkles,
} from 'lucide-react';

const PLATFORM_CONFIGS: Array<{ platform: Platform; label: string; icon: any; color: string }> = [
  { platform: 'x', label: 'X (Twitter)', icon: Twitter, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { platform: 'telegram', label: 'Telegram', icon: Send, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { platform: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  { platform: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { platform: 'reddit', label: 'Reddit', icon: MessageSquare, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { platform: 'youtube', label: 'YouTube (Comments)', icon: Video, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
];

const EMOTION_BADGES: Array<{ emotion: EmotionType; label: string; bg: string; text: string }> = [
  { emotion: 'sarcasm', label: 'Sarcasm / Irony', bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-300' },
  { emotion: 'anxiety', label: 'Anxiety / Threat', bg: 'bg-rose-500/15 border-rose-500/30', text: 'text-rose-300' },
  { emotion: 'excitement', label: 'Excitement / Hype', bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-300' },
  { emotion: 'supportive', label: 'Supportive / Endorsement', bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-300' },
  { emotion: 'against', label: 'Hostile / Against', bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-300' },
  { emotion: 'joy', label: 'Joy / Delight', bg: 'bg-teal-500/15 border-teal-500/30', text: 'text-teal-300' },
  { emotion: 'anger', label: 'Anger / Outrage', bg: 'bg-red-600/15 border-red-600/30', text: 'text-red-400' },
  { emotion: 'confusion', label: 'Confusion', bg: 'bg-purple-500/15 border-purple-500/30', text: 'text-purple-300' },
  { emotion: 'trust', label: 'Trust / Credible', bg: 'bg-cyan-500/15 border-cyan-500/30', text: 'text-cyan-300' },
];

export const FilterBar: React.FC = () => {
  const {
    filters,
    togglePlatformFilter,
    toggleEmotionFilter,
    updateFilter,
    resetFilters,
    filteredPosts,
    activeScenario,
  } = useAnalytics();

  const isFiltered =
    filters.selectedPlatforms.length < 6 ||
    filters.selectedEmotions.length > 0 ||
    filters.timeRange !== 'all' ||
    filters.searchQuery.length > 0 ||
    filters.selectedCountry !== null ||
    filters.onlyKOLs;

  return (
    <div className="w-full border-b border-slate-800/80 bg-slate-950/70 px-6 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Platform Multi-Select Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Platforms:
          </span>
          {PLATFORM_CONFIGS.map((cfg) => {
            const isSelected = filters.selectedPlatforms.includes(cfg.platform);
            const Icon = cfg.icon;
            return (
              <button
                key={cfg.platform}
                onClick={() => togglePlatformFilter(cfg.platform)}
                className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  isSelected
                    ? `${cfg.color} border-current shadow-sm`
                    : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Time Range & Active Filter Count & Reset */}
        <div className="flex items-center space-x-3 ml-auto">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs">
            <Clock className="h-3.5 w-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {(['1h', '6h', '24h', '7d', 'all'] as const).map((tr) => (
              <button
                key={tr}
                onClick={() => updateFilter('timeRange', tr)}
                className={`rounded px-2 py-0.5 font-medium transition ${
                  filters.timeRange === tr
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tr === 'all' ? 'All Timeline' : tr}
              </button>
            ))}
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Matches Count Pill */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
            Posts: <span className="font-semibold text-white">{filteredPosts.length}</span> / {activeScenario.posts.length}
          </div>
        </div>
      </div>

      {/* Second Row: Emotion Chips */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/40">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-indigo-400" /> Nuanced Emotion Vectors:
        </span>
        {EMOTION_BADGES.map((badge) => {
          const isSelected = filters.selectedEmotions.includes(badge.emotion);
          return (
            <button
              key={badge.emotion}
              onClick={() => toggleEmotionFilter(badge.emotion)}
              className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition ${
                isSelected
                  ? `${badge.bg} ${badge.text} border-current ring-1 ring-current`
                  : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {badge.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
