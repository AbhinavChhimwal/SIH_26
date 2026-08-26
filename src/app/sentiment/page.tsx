'use client';

import React from 'react';
import { EmotionRadarChart } from '@/components/sentiment/EmotionRadarChart';
import { SentimentStreamTimeline } from '@/components/dashboard/SentimentStreamTimeline';
import { SarcasmAnxietyBreakdown } from '@/components/sentiment/SarcasmAnxietyBreakdown';
import { ExplainablePostInspector } from '@/components/sentiment/ExplainablePostInspector';
import { ModelTuningStudio } from '@/components/sentiment/ModelTuningStudio';
import { RecentCrossPlatformPosts } from '@/components/dashboard/RecentCrossPlatformPosts';
import { SmilePlus, Sparkles, AlertTriangle } from 'lucide-react';

export default function SentimentPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-blue-950/30 p-6 backdrop-blur shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <SmilePlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Vector B: Multi-Dimensional Sentiment & Emotion NLP Studio
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Deep natural language processing inferring nuanced emotional vectors (sarcasm, anxiety, excitement, supportive, against) and temporal sentiment shifts
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart & Fluctuation Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <EmotionRadarChart />
        </div>
        <div className="lg:col-span-2">
          <SentimentStreamTimeline />
        </div>
      </div>

      {/* Sarcasm & Anxiety Linguistic Diagnostics */}
      <SarcasmAnxietyBreakdown />

      {/* Live Model Calibration & Heuristic Lexicon Studio */}
      <ModelTuningStudio />

      {/* Live Token Explainability Tester */}
      <ExplainablePostInspector />

      {/* Filtered Posts Feed */}
      <RecentCrossPlatformPosts />
    </div>
  );
}
