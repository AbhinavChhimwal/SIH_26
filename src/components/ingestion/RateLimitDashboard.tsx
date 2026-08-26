'use client';

import React, { useState, useEffect } from 'react';
import { globalRateLimiter, PlatformRateLimitConfig } from '@/lib/services/rateLimiterService';
import { Platform } from '@/lib/types';
import {
  ShieldAlert,
  Zap,
  RotateCcw,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Server,
  Layers,
} from 'lucide-react';

export const RateLimitDashboard: React.FC = () => {
  const [configs, setConfigs] = useState<Record<Platform, PlatformRateLimitConfig>>(() =>
    globalRateLimiter.getAllConfigs()
  );

  const [testResult, setTestResult] = useState<{
    platform: Platform;
    allowed: boolean;
    remaining: number;
    limit: number;
    resetSeconds: number;
    circuitState: string;
    reason?: string;
  } | null>(null);

  // Poll token refills
  useEffect(() => {
    const timer = setInterval(() => {
      setConfigs(globalRateLimiter.getAllConfigs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTestConsume = (platform: Platform) => {
    const result = globalRateLimiter.tryConsume(platform, 1);
    setTestResult({ platform, ...result });
    setConfigs(globalRateLimiter.getAllConfigs());
  };

  const handleSimulateBurst = (platform: Platform) => {
    globalRateLimiter.simulateBurst(platform, 60);
    const result = globalRateLimiter.tryConsume(platform, 1);
    setTestResult({ platform, ...result });
    setConfigs(globalRateLimiter.getAllConfigs());
  };

  const handleReset = (platform: Platform) => {
    globalRateLimiter.resetPlatform(platform);
    setConfigs(globalRateLimiter.getAllConfigs());
    setTestResult(null);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Enterprise Rate-Limit & Token Quota Management (Redis Token Bucket)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time token capacity, burst protection, and circuit breakers preventing 429 rate limit bans across social APIs
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
          Token Bucket Engine: ACTIVE
        </div>
      </div>

      {/* Test Feedback Banner */}
      {testResult && (
        <div
          className={`rounded-xl border p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            testResult.allowed
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {testResult.allowed ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>
              <strong>[{testResult.platform.toUpperCase()}]</strong>{' '}
              {testResult.allowed
                ? 'Request Allowed (200 OK)'
                : `Request Blocked: ${testResult.reason || 'Rate limit exceeded'}`}
            </span>
          </div>

          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>Remaining: {testResult.remaining}</span>
            <span>Reset: {testResult.resetSeconds}s</span>
            <span
              className={`rounded px-1.5 py-0.2 font-bold ${
                testResult.circuitState === 'CLOSED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              Circuit: {testResult.circuitState}
            </span>
          </div>
        </div>
      )}

      {/* Grid of Platform Rate Limiters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(configs).map((cfg) => {
          const fillPct = Math.min(100, Math.round((cfg.currentTokens / cfg.capacity) * 100));
          const isTrip = cfg.circuitState === 'OPEN';

          return (
            <div
              key={cfg.platform}
              className={`flex flex-col justify-between rounded-xl border p-4 transition ${
                isTrip
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white">{cfg.name}</h4>
                    <span className="text-[10px] text-slate-400">{cfg.tier}</span>
                  </div>

                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${
                      cfg.circuitState === 'CLOSED'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {cfg.circuitState}
                  </span>
                </div>

                {/* Progress Bar of Bucket Capacity */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Token Bucket:</span>
                    <span className="font-mono font-bold text-white">
                      {Math.floor(cfg.currentTokens)} / {cfg.capacity} tokens
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${fillPct}%` }}
                      className={`h-full transition-all duration-300 ${
                        fillPct > 50 ? 'bg-emerald-500' : fillPct > 20 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Quota Telemetry */}
                <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Refill Velocity:</span>
                    <span className="font-mono text-slate-200">+{cfg.refillRatePerSecond} tokens/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Quota Consumed:</span>
                    <span className="font-mono text-slate-200">{cfg.dailyQuotaConsumed.toLocaleString()} / {cfg.dailyQuotaLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost / Req:</span>
                    <span className="font-mono text-slate-200">{cfg.costPerRequest} token(s)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTestConsume(cfg.platform)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-800 transition"
                >
                  Send 1 Req
                </button>
                <button
                  onClick={() => handleSimulateBurst(cfg.platform)}
                  className="flex-1 rounded-lg border border-amber-500/30 bg-amber-500/10 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                  title="Simulate high-volume flood"
                >
                  Burst 60
                </button>
                <button
                  onClick={() => handleReset(cfg.platform)}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-1 text-slate-400 hover:text-white transition"
                  title="Reset Bucket"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
