'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Bell, Send, CheckCircle2, AlertTriangle, Radio, ShieldAlert, Sparkles } from 'lucide-react';

export const AlertDispatcherModal: React.FC = () => {
  const { filteredPosts, activeScenario } = useAnalytics();

  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX');
  const [targetChannel, setTargetChannel] = useState<'slack' | 'discord' | 'pagerduty'>('slack');
  const [anxietyThreshold, setAnxietyThreshold] = useState<number>(35);
  const [viralityThreshold, setViralityThreshold] = useState<number>(80);
  const [r0Threshold, setR0Threshold] = useState<number>(2.0);

  const [dispatchLogs, setDispatchLogs] = useState<Array<{
    id: string;
    target: string;
    triggerReason: string;
    payload: any;
    status: 'DELIVERED (200 OK)' | 'PENDING';
    timestamp: string;
  }>>([
    {
      id: 'disp-1',
      target: 'Slack (#incident-war-room)',
      triggerReason: 'Anxiety index surged past 35% on Telegram/Reddit channels.',
      payload: { channel: '#incident-war-room', text: '🚨 CRITICAL SENTIX ALERT: High-anxiety wave detected (42% volume). Immediate response required.' },
      status: 'DELIVERED (200 OK)',
      timestamp: '5 mins ago',
    }
  ]);

  const handleTestDispatch = () => {
    const newLog = {
      id: `disp-${Date.now()}`,
      target: targetChannel === 'slack' ? 'Slack (#intel-alerts)' : (targetChannel === 'discord' ? 'Discord (#threat-intel)' : 'PagerDuty (High Severity P1)'),
      triggerReason: `Manual test trigger for scenario "${activeScenario.title}"`,
      payload: {
        event: 'AI_CRISIS_EARLY_WARNING',
        scenario: activeScenario.title,
        metrics: {
          anxietyThreshold: `${anxietyThreshold}%`,
          viralityThreshold: `${viralityThreshold}/100`,
          r0Threshold,
        },
        webhook: webhookUrl,
      },
      status: 'DELIVERED (200 OK)' as const,
      timestamp: 'Just now',
    };

    setDispatchLogs([newLog, ...dispatchLogs]);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Automated AI Crisis Alerting & Webhook Dispatcher
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dispatches automated incident alerts to Slack, Discord, or PagerDuty when emotion spikes or virality breaches threshold limits
          </p>
        </div>
        <div className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
          Auto-Dispatcher: ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rule 1: Anxiety Spike */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-200">
            <span>Anxiety Spike Trigger</span>
            <span className="text-rose-400 font-mono">&gt; {anxietyThreshold}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={anxietyThreshold}
            onChange={(e) => setAnxietyThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <p className="text-[10px] text-slate-500">Triggers when discourse volume anxiety exceeds threshold.</p>
        </div>

        {/* Rule 2: Virality Index */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-200">
            <span>Virality Velocity Trigger</span>
            <span className="text-amber-400 font-mono">&gt; {viralityThreshold}/100</span>
          </div>
          <input
            type="range"
            min="40"
            max="95"
            value={viralityThreshold}
            onChange={(e) => setViralityThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <p className="text-[10px] text-slate-500">Triggers on rapid exponential keyword compounding.</p>
        </div>

        {/* Rule 3: Reproduction Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-200">
            <span>Diffusion $R_0$ Trigger</span>
            <span className="text-sky-400 font-mono">&gt; {r0Threshold.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="4.0"
            step="0.1"
            value={r0Threshold}
            onChange={(e) => setR0Threshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <p className="text-[10px] text-slate-500">Triggers when network cascade exhibits viral infection rates.</p>
        </div>
      </div>

      {/* Webhook Dispatch Config & Test */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Target Incoming Webhook Endpoint
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Target Channel
            </label>
            <select
              value={targetChannel}
              onChange={(e) => setTargetChannel(e.target.value as any)}
              className="w-full h-9 rounded-xl border border-slate-800 bg-slate-900 px-2.5 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="slack">Slack Webhook</option>
              <option value="discord">Discord Alert Bot</option>
              <option value="pagerduty">PagerDuty P1 Incident</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleTestDispatch}
          className="flex items-center justify-center space-x-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 transition shadow-md shadow-amber-600/20"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Dispatch Simulated Test Alert</span>
        </button>
      </div>

      {/* Dispatch Audit Logs */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400">Recent Webhook Dispatch Receipts:</div>
        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {dispatchLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs"
            >
              <div>
                <div className="font-bold text-white flex items-center space-x-2">
                  <span>{log.target}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">[{log.status}]</span>
                </div>
                <div className="text-[11px] text-slate-400">{log.triggerReason}</div>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
