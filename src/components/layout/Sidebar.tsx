'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  SmilePlus,
  Users,
  TrendingUp,
  Share2,
  Radio,
  FileText,
  Database,
  Cpu,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Overview & Synthesis',
    icon: LayoutDashboard,
    badge: 'Live',
  },
  {
    href: '/sentiment',
    label: 'Multi-Dim Sentiment',
    icon: SmilePlus,
    badge: 'NLP',
  },
  {
    href: '/demographics',
    label: 'Demographics & Geo',
    icon: Users,
    badge: 'Maps',
  },
  {
    href: '/trends',
    label: 'Trend & Topic Evolution',
    icon: TrendingUp,
    badge: 'AI',
  },
  {
    href: '/network',
    label: 'Link Analysis & Cascade',
    icon: Share2,
    badge: 'Graph',
  },
  {
    href: '/ingestion',
    label: 'Data Pipeline & Stream',
    icon: Radio,
    badge: '6 Feeds',
  },
  {
    href: '/reports',
    label: 'Briefings & Reports',
    icon: FileText,
    badge: 'PDF/CSV',
  },
  {
    href: '/developer',
    label: 'API & Developer Studio',
    icon: Cpu,
    badge: 'REST/SSE',
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 hidden md:flex h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Intelligence Vectors
          </div>
          <nav className="mt-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600/15 border border-blue-500/40 text-blue-400 shadow-sm shadow-blue-500/10'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`h-4 w-4 transition ${
                        isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Engine Pipeline Status Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              <span>AI Engine Metrics</span>
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>Sentiment Latency:</span>
              <span className="font-mono text-slate-200">14.2 ms</span>
            </div>
            <div className="flex justify-between">
              <span>Graph Modularity:</span>
              <span className="font-mono text-slate-200">Q = 0.68</span>
            </div>
            <div className="flex justify-between">
              <span>Demographic Confidence:</span>
              <span className="font-mono text-emerald-400">92.4%</span>
            </div>
            <div className="flex justify-between">
              <span>Timeline Resolution:</span>
              <span className="font-mono text-slate-200">Minute-bucket</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Database className="h-3.5 w-3.5 text-blue-400" />
            <span>Sentix Multi-Vector</span>
          </div>
          <span>SIH-152 MVP</span>
        </div>
      </div>
    </aside>
  );
};
