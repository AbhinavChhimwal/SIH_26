'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { parseUploadedDataset } from '@/lib/services/ingestionService';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const DatasetUploadModal: React.FC = () => {
  const { uploadCustomScenario } = useAnalytics();

  const [datasetTitle, setDatasetTitle] = useState('Custom Tech Outage Investigation');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [rawText, setRawText] = useState(`[
  {
    "platform": "x",
    "author_name": "Dr. Sarah Jenkins",
    "author_handle": "@sarah_cyber",
    "content": "Zero-day exploit confirmed in edge CDN routing. Urgent patch required immediately! Panicking.",
    "likes": 1250,
    "reposts": 480
  },
  {
    "platform": "telegram",
    "author_name": "Dark Threat Intel",
    "author_handle": "@dark_threat",
    "content": "Dump of compromised credentials verified on hacker forums. High severity threat alert.",
    "likes": 3400,
    "reposts": 1200
  },
  {
    "platform": "reddit",
    "author_name": "DevOpsVeteran",
    "author_handle": "@u_devops_vet",
    "content": "Oh wonderful, 99.99% SLA down the drain while the auth cluster crashes. Brilliant move!",
    "likes": 890,
    "reposts": 120
  },
  {
    "platform": "youtube",
    "author_name": "CodeWithKavita",
    "author_handle": "@kavita_yt",
    "content": "Deep dive breakdown on how today's edge DNS glitch happened and how engineers fixed it.",
    "likes": 8900,
    "reposts": 410
  }
]`);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProcessUpload = () => {
    try {
      setStatusMessage(null);
      const parsedPosts = parseUploadedDataset(rawText, format);
      uploadCustomScenario(datasetTitle, parsedPosts);
      setStatusMessage({
        type: 'success',
        text: `Successfully ingested and analyzed ${parsedPosts.length} posts! Switched active scenario to "${datasetTitle}".`,
      });
    } catch (e) {
      setStatusMessage({
        type: 'error',
        text: (e as Error).message,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith('.csv');
    setFormat(isCsv ? 'csv' : 'json');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <UploadCloud className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Custom Dataset Batch Ingestion & Dynamic Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Import raw JSON/CSV social dumps to immediately run the complete AI sentiment, demographic, trend, and network cascade algorithms
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Title & Format Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Dataset Investigation Title
            </label>
            <input
              type="text"
              value={datasetTitle}
              onChange={(e) => setDatasetTitle(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Data Format
            </label>
            <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`flex-1 rounded-lg py-1 font-bold transition ${
                  format === 'json' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                JSON Array
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex-1 rounded-lg py-1 font-bold transition ${
                  format === 'csv' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                CSV Table
              </button>
            </div>
          </div>
        </div>

        {/* File Input & Paste Area */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Raw Payload (Paste or Upload File)
            </label>
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`rounded-xl border p-3 text-xs flex items-center space-x-2 ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <button
          onClick={handleProcessUpload}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-xs font-bold text-white hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-600/20"
        >
          <Sparkles className="h-4 w-4" />
          <span>Process & Synthesize Dataset with AI Pipeline</span>
        </button>
      </div>
    </div>
  );
};
