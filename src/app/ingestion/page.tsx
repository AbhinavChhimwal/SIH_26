'use client';

import React from 'react';
import { PlatformConnectorCards } from '@/components/ingestion/PlatformConnectorCards';
import { YouTubeLiveStudio } from '@/components/ingestion/YouTubeLiveStudio';
import { RateLimitDashboard } from '@/components/ingestion/RateLimitDashboard';
import { LiveStreamConsole } from '@/components/ingestion/LiveStreamConsole';
import { DatasetUploadModal } from '@/components/ingestion/DatasetUploadModal';
import { Radio, Database, UploadCloud, Server } from 'lucide-react';

export default function IngestionPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-indigo-950/30 p-6 backdrop-blur shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Vector A: Continuous Data Collection & Rate-Limit Quota Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-platform ingestion architecture connecting X, Telegram, Instagram, Facebook, Reddit, and YouTube with token bucket rate limiting and batch CSV/JSON ingestion
            </p>
          </div>
        </div>
      </div>

      {/* 6 Platform Connector Cards */}
      <PlatformConnectorCards />

      {/* Live YouTube Data API v3 Studio & Comments Analyzer */}
      <YouTubeLiveStudio />

      {/* Enterprise Rate Limiting & Token Quota Dashboard */}
      <RateLimitDashboard />

      {/* Live Stream Telemetry Console */}
      <LiveStreamConsole />

      {/* Custom Batch Dataset Uploader (JSON/CSV) */}
      <DatasetUploadModal />
    </div>
  );
}
