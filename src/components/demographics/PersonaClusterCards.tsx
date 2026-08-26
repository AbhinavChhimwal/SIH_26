'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Users, Sparkles, SmilePlus, Quote } from 'lucide-react';

export const PersonaClusterCards: React.FC = () => {
  const { filteredDemographics } = useAnalytics();
  const personas = filteredDemographics.personaClusters || [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Automated Follower Persona Clusters & Behavioral Archetypes
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Unsupervised clustering of user bios, language styles, and interaction networks into actionable audience personas
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/30">
          {personas.length} Distinct Archetypes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <div
            key={persona.id}
            className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  {persona.sizePercentage}% of Conversation
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    persona.sentimentPolarity >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  Polarity: {persona.sentimentPolarity >= 0 ? `+${persona.sentimentPolarity}` : persona.sentimentPolarity}
                </span>
              </div>

              <h4 className="mt-2.5 text-sm font-bold text-white">{persona.name}</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{persona.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-[11px]">
              <div>
                <span className="text-slate-500">Dominant Emotion Vectors: </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {persona.topEmotions.map((e) => (
                    <span
                      key={e}
                      className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] uppercase font-semibold text-slate-300"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {persona.sampleBios.length > 0 && (
                <div className="rounded bg-slate-900/80 p-2 text-[10px] text-slate-400 italic border border-slate-800/60 flex items-start space-x-1.5">
                  <Quote className="h-3 w-3 text-slate-500 shrink-0 mt-0.5" />
                  <span className="truncate">Sample bio: "{persona.sampleBios[0]}"</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
