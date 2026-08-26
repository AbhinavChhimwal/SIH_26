'use client';

import React, { useState } from 'react';
import { analyzeSentiment } from '@/lib/services/sentimentService';
import { SentimentAnalysis, EmotionType } from '@/lib/types';
import { Sparkles, Send, CheckCircle2, AlertTriangle, HelpCircle, Activity } from 'lucide-react';

export const ExplainablePostInspector: React.FC = () => {
  const [customText, setCustomText] = useState(
    'Oh great, the "revolutionary" update just crashed our entire authentication cluster during peak market hours! What a brilliant engineering feat.'
  );

  const [analysis, setAnalysis] = useState<SentimentAnalysis>(() => analyzeSentiment(customText));

  const handleAnalyze = () => {
    if (!customText.trim()) return;
    setAnalysis(analyzeSentiment(customText));
  };

  const samplePrompts = [
    'Revolutionary milestone! Nova-4X outperforms all coding benchmarks. Mindblown by the speed and precision.',
    'Oh great, another "revolutionary" closed model that happens to hallucinate citations on basic calculus. "Working flawlessly" as if.',
    '⚠️ ALERT: Root credentials leaked to public torrents. Threat actors are exploiting zero-day bypasses right now. Panicking.',
    'We fully support the antitrust lawsuit against unverified training data scraping. Unacceptable privacy violations.',
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Live NLP Sentiment & Token Explainability Studio
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test arbitrary text strings or analyze social posts with token-level emotion attribution and sarcasm heuristics
          </p>
        </div>
        <div className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/30">
          Confidence: {analysis.confidence}%
        </div>
      </div>

      {/* Input Text Box */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            placeholder="Type any custom social media post or comment to inspect..."
          />
          <button
            onClick={handleAnalyze}
            className="flex flex-col items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-500 transition shrink-0 shadow-lg shadow-blue-600/20"
          >
            <Send className="h-4 w-4 mb-1" />
            <span>Analyze</span>
          </button>
        </div>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Sample Prompts:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomText(p);
                setAnalysis(analyzeSentiment(p));
              }}
              className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition truncate max-w-[200px]"
            >
              {p.slice(0, 35)}...
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Output Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
        {/* Metric 1: Net Polarity */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Net Polarity</div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              analysis.polarity >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {analysis.polarity >= 0 ? `+${analysis.polarity}` : analysis.polarity}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 capitalize">{analysis.label} Tone</div>
        </div>

        {/* Metric 2: Dominant Emotion */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Dominant Emotion</div>
          <div className="text-xl font-bold text-white capitalize mt-1 truncate">
            {analysis.dominantEmotion}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Top classified vector</div>
        </div>

        {/* Metric 3: Sarcasm Score */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Sarcasm Probability</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {Math.round(analysis.sarcasmScore * 100)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {analysis.sarcasmScore > 0.4 ? 'Irony Detected' : 'Literal Tone'}
          </div>
        </div>

        {/* Metric 4: Subjectivity */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Subjectivity Index</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">
            {analysis.subjectivity}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Opinion vs Fact balance</div>
        </div>
      </div>

      {/* Token Attribution & Triggers */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Token-Level Emotion Attribution Triggers:</span>
          <span className="text-[10px] text-slate-500">Explainable AI (XAI)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.triggerTokens.length === 0 ? (
            <span className="text-xs text-slate-500">No strong emotional anchor tokens found.</span>
          ) : (
            analysis.triggerTokens.map((t, idx) => (
              <span
                key={idx}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs"
              >
                <span className="font-semibold text-white">"{t.token}"</span>
                <span className="text-slate-500">→</span>
                <span className="font-semibold uppercase text-[10px] text-blue-400">{t.emotion}</span>
                <span className="font-mono text-[9px] text-slate-400">({Math.round(t.weight * 100)}%)</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
