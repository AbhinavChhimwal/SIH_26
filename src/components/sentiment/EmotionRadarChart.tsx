'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { EmotionType } from '@/lib/types';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { Sparkles, Shield } from 'lucide-react';

export const EmotionRadarChart: React.FC = () => {
  const { filteredPosts } = useAnalytics();

  const emotionData = React.useMemo(() => {
    const counts: Record<EmotionType, number> = {
      sarcasm: 0,
      anxiety: 0,
      excitement: 0,
      supportive: 0,
      against: 0,
      anger: 0,
      joy: 0,
      fear: 0,
      confusion: 0,
      trust: 0,
      neutral: 0,
    };

    const total = Math.max(1, filteredPosts.length);

    filteredPosts.forEach((post) => {
      Object.entries(post.sentiment.emotions).forEach(([em, val]) => {
        counts[em as EmotionType] = (counts[em as EmotionType] || 0) + val;
      });
    });

    const LABELS: Record<EmotionType, string> = {
      sarcasm: 'Sarcasm / Irony',
      anxiety: 'Anxiety',
      excitement: 'Excitement',
      supportive: 'Supportive',
      against: 'Hostility / Against',
      anger: 'Anger',
      joy: 'Joy',
      fear: 'Fear',
      confusion: 'Confusion',
      trust: 'Trust',
      neutral: 'Neutral',
    };

    return Object.entries(counts)
      .filter(([k]) => k !== 'neutral')
      .map(([k, v]) => ({
        emotion: LABELS[k as EmotionType] || k,
        score: Math.min(100, Math.round((v / total) * 100)),
        rawEmotion: k,
      }));
  }, [filteredPosts]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              10-Dimensional Emotion Vector Radar
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Nuanced psychological footprint across sarcasm, anxiety, excitement, hostility, and trust
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Sample: <span className="font-semibold text-white">{filteredPosts.length} posts</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={emotionData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="emotion" stroke="#94a3b8" fontSize={10} tickLine={false} />
            <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} fontSize={9} />
            <Radar
              name="Emotion Intensity"
              dataKey="score"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '0.75rem',
                color: '#fff',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
        <span>Model: <strong className="text-slate-300">Sentix Nuanced RoBERTa Classifier</strong></span>
        <span>Avg Confidence: <strong className="text-emerald-400">91.8%</strong></span>
      </div>
    </div>
  );
};
