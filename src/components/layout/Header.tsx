'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { UserRole } from '@/lib/types';
import {
  Activity,
  Shield,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  Zap,
  Play,
  Pause,
  Layers,
  AlertTriangle,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeScenario,
    allScenarios,
    setScenarioId,
    userRole,
    setUserRole,
    filters,
    updateFilter,
    ingestionState,
    toggleStreaming,
    systemAlerts,
    dismissAlert,
  } = useAnalytics();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    admin: { label: 'Chief Intelligence Officer (Admin)', badge: 'ADMIN', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    analyst: { label: 'Senior Intelligence Analyst', badge: 'ANALYST', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    manager: { label: 'Crisis & Brand Manager', badge: 'MANAGER', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    viewer: { label: 'Executive Viewer', badge: 'VIEWER', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 backdrop-blur-md">
      {/* Brand & Active Scenario Switcher */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20">
            <Activity className="h-5 w-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider text-white">SENTIX</span>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/30">
                v2.5 AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Multi-Vector Social Media Intelligence</p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

        {/* Scenario Selector */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
            className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-700 transition"
          >
            <Layers className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-medium text-slate-400">Scenario:</span>
            <span className="font-semibold text-white max-w-[200px] truncate">{activeScenario.title}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showScenarioDropdown && (
            <div className="absolute left-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Intelligence Benchmark Scenarios
              </div>
              <div className="mt-1 space-y-1">
                {allScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setScenarioId(sc.id);
                      setShowScenarioDropdown(false);
                    }}
                    className={`w-full rounded-lg p-2 text-left transition ${
                      sc.id === activeScenario.id
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-medium text-xs text-white">{sc.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{sc.tagline}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Telemetry Indicator */}
      <div className="hidden xl:flex items-center space-x-4">
        <div className="flex items-center space-x-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs">
          <button
            onClick={toggleStreaming}
            className={`flex items-center space-x-1.5 rounded-full px-2 py-0.5 font-medium transition ${
              ingestionState.isStreaming
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {ingestionState.isStreaming ? <Play className="h-3 w-3 fill-emerald-400" /> : <Pause className="h-3 w-3" />}
            <span>{ingestionState.isStreaming ? 'STREAMING LIVE' : 'STREAM PAUSED'}</span>
          </button>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            <span className="font-semibold text-white">{ingestionState.throughputPerSecond}</span> msg/s
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Total: <span className="font-semibold text-white">{ingestionState.totalIngestedCount.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Right Controls: Search, Alerts, Role Selector */}
      <div className="flex items-center space-x-3">
        {/* Global Keyword Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search keywords, #tags, @users..."
            className="h-8 w-48 lg:w-60 rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* System Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {systemAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {systemAlerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Active Intelligence Alerts</span>
                <span className="text-[10px] text-slate-400">{systemAlerts.length} active</span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {systemAlerts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No active anomalies detected.</p>
                ) : (
                  systemAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="relative rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-xs transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-1.5 font-medium text-white">
                          {alert.severity === 'critical' || alert.severity === 'warning' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          )}
                          <span className="text-[11px] font-semibold">{alert.title}</span>
                        </div>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-slate-500 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">{alert.message}</p>
                      <span className="mt-1 block text-[9px] text-slate-500">{alert.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="h-8 rounded-lg border border-slate-800 bg-slate-900 px-2.5 text-xs font-medium text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="analyst">Analyst Role</option>
            <option value="manager">Crisis Manager</option>
            <option value="admin">CIO / Admin</option>
            <option value="viewer">Executive</option>
          </select>
        </div>
      </div>
    </header>
  );
};
