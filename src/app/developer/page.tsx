'use client';

import React from 'react';
import { ApiPlayground } from '@/components/developer/ApiPlayground';
import { Code, Terminal, Sparkles } from 'lucide-react';

export default function DeveloperPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-blue-950/30 p-6 backdrop-blur shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Code className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Developer OpenAPI & Analytics API Playground
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Programmatic REST APIs, Server-Sent Events (SSE), and cURL payloads for enterprise pipeline integration
            </p>
          </div>
        </div>
      </div>

      <ApiPlayground />
    </div>
  );
}
