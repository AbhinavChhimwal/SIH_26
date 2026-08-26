'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { NarrativeStage } from '@/lib/types';
import { ArrowRight, Layers, Flame, CheckCircle2, Sparkles } from 'lucide-react';

export const NarrativeEvolutionFlow: React.FC = () => {
  const { filteredTrends, activeScenario } = useAnalytics();

  const STAGES: Array<{
    stage: NarrativeStage;
    label: string;
    description: string;
    badgeColor: string;
  }> = [
    {
      stage: 'Origin',
      label: '1. Seed & Origin Trigger',
      description: 'Initial disclosure / announcement by seed Key Opinion Leader.',
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    },
    {
      stage: 'Amplification',
      label: '2. Community Amplification',
      description: 'Broadcasting across tech creators, Telegram channels, and Reddit forums.',
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    },
    {
      stage: 'Peak Controversy',
      label: '3. Peak Viral Controversy',
      description: 'Mainstream press, regulatory inquiries, skepticism, and intense anxiety spikes.',
      badgeColor: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    },
    {
      stage: 'Resolution',
      label: '4. Stabilization & Resolution',
      description: 'Official patches, regulatory hearing dates set, long-term consensus formed.',
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Narrative Lifecycle & Evolution Tracker
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological stage mapping of shifting topic clusters from initial trigger through viral climax to resolution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {STAGES.map((s, idx) => {
          const matchingTrends = filteredTrends.filter((t) => t.narrativeStage === s.stage);

          return (
            <div
              key={s.stage}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 relative"
            >
              <div>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${s.badgeColor}`}>
                  {s.label}
                </span>
                <p className="mt-2 text-xs text-slate-400">{s.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300">Active Topics in Stage:</div>
                <div className="space-y-1.5">
                  {matchingTrends.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg bg-slate-900 border border-slate-800/80 p-2 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-white truncate max-w-[120px]">
                        {t.hashtag || t.keyword}
                      </span>
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        V-{t.viralityScore}
                      </span>
                    </div>
                  ))}
                  {matchingTrends.length === 0 && (
                    <div className="text-[10px] text-slate-500 italic">No topics currently in this phase.</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
