'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Activity,
  Flame,
  Users,
  Radio,
  Zap,
  Sparkles,
} from 'lucide-react';

export const CascadeSimulatorControls: React.FC = () => {
  const {
    filteredNetwork,
    cascadeStep,
    setCascadeStep,
    isCascadePlaying,
    setIsCascadePlaying,
  } = useAnalytics();

  const steps = filteredNetwork.cascadeTimeline || [];
  const currentStepData = steps[cascadeStep] || steps[0];
  const maxStep = Math.max(0, steps.length - 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="h-4 w-4 text-sky-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Influence Cascade & Information Diffusion Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step epidemiological spread model tracing narrative infection from Seed KOL to saturation
          </p>
        </div>

        {/* Milestone Badge */}
        <div className="flex items-center space-x-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300 font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          <span>{currentStepData?.timeLabel || 'T+0m'}</span>
        </div>
      </div>

      {/* Narrative Milestone Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
        <span className="font-semibold text-slate-400">Diffusion Milestone: </span>
        <span className="text-slate-100 font-medium">{currentStepData?.narrativeMilestone}</span>
      </div>

      {/* Interactive Time Steps Scrubber */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Diffusion Progression (Step {cascadeStep + 1} of {steps.length})</span>
          <span className="font-mono text-slate-200">Time Delta: {currentStepData?.timeLabel}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {steps.map((s, idx) => {
            const isActive = idx === cascadeStep;
            const isPast = idx < cascadeStep;
            return (
              <button
                key={s.step}
                onClick={() => setCascadeStep(idx)}
                className={`flex flex-col items-center justify-center rounded-xl p-2 text-center transition border ${
                  isActive
                    ? 'border-sky-400 bg-sky-500/20 text-white ring-1 ring-sky-400 shadow-md shadow-sky-500/10'
                    : isPast
                    ? 'border-slate-700 bg-slate-900 text-slate-300'
                    : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <span className="text-[11px] font-bold">Step {idx + 1}</span>
                <span className="text-[9px] truncate w-full mt-0.5">{s.timeLabel.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Playback Controls & Key Diffusion Metrics */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
        {/* Play / Step Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCascadeStep(Math.max(0, cascadeStep - 1))}
            disabled={cascadeStep === 0}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-40 transition"
            title="Step Back"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsCascadePlaying(!isCascadePlaying)}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-md ${
              isCascadePlaying
                ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-amber-600/20'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
            }`}
          >
            {isCascadePlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            <span>{isCascadePlaying ? 'Pause Simulation' : 'Auto Play Cascade'}</span>
          </button>

          <button
            onClick={() => setCascadeStep(Math.min(maxStep, cascadeStep + 1))}
            disabled={cascadeStep === maxStep}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-40 transition"
            title="Step Forward"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Real-Time Metrics Strip */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-1.5 rounded-lg bg-slate-950 px-3 py-1.5 border border-slate-800">
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-slate-400">Reproduction Rate ($R_0$):</span>
            <span className="font-mono font-bold text-rose-300">{currentStepData?.reproductionRate}</span>
          </div>

          <div className="flex items-center space-x-1.5 rounded-lg bg-slate-950 px-3 py-1.5 border border-slate-800">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Cumulative Reach:</span>
            <span className="font-mono font-bold text-white">
              {((currentStepData?.cumulativeReach || 0) / 1000).toFixed(0)}K
            </span>
          </div>

          <div className="flex items-center space-x-1.5 rounded-lg bg-slate-950 px-3 py-1.5 border border-slate-800">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">Infected Nodes:</span>
            <span className="font-mono font-bold text-amber-300">
              {currentStepData?.activeNodes.length || 0} / {filteredNetwork.nodes.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
