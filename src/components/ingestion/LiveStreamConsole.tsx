'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Play, Pause, FastForward, Activity, Sparkles, Terminal } from 'lucide-react';

export const LiveStreamConsole: React.FC = () => {
  const {
    ingestionState,
    toggleStreaming,
    setStreamSpeedMultiplier,
  } = useAnalytics();

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Live Ingestion Telemetry & Stream Controller
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time packet ingestion console with throttle rate control and emotion tagging buffer
          </p>
        </div>

        {/* Stream Speed & Pause/Play Buttons */}
        <div className="flex items-center space-x-2">
          {/* Speed multiplier */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
            <span className="text-slate-500 px-1 text-[11px]">Speed:</span>
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setStreamSpeedMultiplier(spd)}
                className={`rounded px-2 py-0.5 font-bold transition ${
                  ingestionState.streamSpeedMultiplier === spd
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={toggleStreaming}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-md ${
              ingestionState.isStreaming
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-amber-600 text-white hover:bg-amber-500'
            }`}
          >
            {ingestionState.isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>{ingestionState.isStreaming ? 'Streaming' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Streaming Console Output */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs max-h-72 overflow-y-auto space-y-2">
        <div className="text-[10px] text-slate-500 pb-1 border-b border-slate-900 flex justify-between">
          <span>[SYSTEM_PIPELINE_READY] Socket connected. Ingesting multi-platform events...</span>
          <span className="text-emerald-400">Buffer: {ingestionState.recentStream.length} items</span>
        </div>

        {ingestionState.recentStream.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-[11px]">
            Waiting for next stream event packet...
          </div>
        ) : (
          ingestionState.recentStream.map((post) => (
            <div
              key={post.id}
              className="flex items-start space-x-2 text-[11px] hover:bg-slate-900/60 p-1.5 rounded transition"
            >
              <span className="text-slate-500 shrink-0">
                {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="font-bold text-sky-400 shrink-0 uppercase">[{post.platform}]</span>
              <span className="text-indigo-300 font-semibold shrink-0">{post.author.handle}:</span>
              <span className="text-slate-300 truncate flex-1">{post.content}</span>
              <span className="text-[10px] font-bold text-amber-400 shrink-0 capitalize">
                [{post.sentiment.dominantEmotion}]
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
