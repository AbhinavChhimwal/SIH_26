'use client';

import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, Copy, Sparkles, Code, Play } from 'lucide-react';

interface EndpointConfig {
  method: 'POST' | 'GET';
  path: string;
  title: string;
  description: string;
  defaultPayload?: string;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    method: 'POST',
    path: '/api/analytics/sentiment',
    title: 'Multi-Dimensional Sentiment NLP',
    description: 'Classifies arbitrary social text into 10 emotion vectors, polarity, and sarcasm score.',
    defaultPayload: JSON.stringify(
      {
        text: 'Oh great, another "revolutionary" update that crashed our entire cloud cluster. Brilliant engineering!',
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/analytics/network',
    title: 'Network Graph Topology & Cascade Diffusion',
    description: 'Computes PageRank, Betweenness Centrality, and step-by-step information diffusion cascades.',
    defaultPayload: JSON.stringify(
      {
        nodes: [
          { id: 'node-1', label: 'Dr. Elena Rostova', handle: '@elena_ai', platform: 'x', followers: 340000, role: 'KOL' },
          { id: 'node-2', label: 'DarkNet Leaks', handle: '@deepnet_leaks', platform: 'telegram', followers: 180000, role: 'Regular' },
          { id: 'node-3', label: 'Marcus Vance', handle: '@marcus_vance', platform: 'x', followers: 195000, role: 'KOL' },
        ],
        edges: [
          { id: 'e1', source: 'node-1', target: 'node-3', type: 'retweet', weight: 4.5, platform: 'x', sentiment: 0.8 },
          { id: 'e2', source: 'node-2', target: 'node-1', type: 'forward', weight: 3.2, platform: 'telegram', sentiment: -0.6 },
        ],
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/analytics/trends',
    title: 'Real-Time Trend & Topic Evolution',
    description: 'Extracts bursty keywords, calculates growth velocity %/hr, and predicts virality index.',
    defaultPayload: JSON.stringify(
      {
        posts: [
          { id: 'p1', content: 'Nova-4X AI model is revolutionary! #AI #Nova4X', timestamp: new Date().toISOString(), platform: 'x', hashtags: ['#AI', '#Nova4X'], sentiment: { polarity: 0.8, dominantEmotion: 'excitement' } },
          { id: 'p2', content: 'Testing Nova-4X coding capabilities #Nova4X', timestamp: new Date().toISOString(), platform: 'reddit', hashtags: ['#Nova4X'], sentiment: { polarity: 0.5, dominantEmotion: 'trust' } },
        ],
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/analytics/demographics',
    title: 'Automated Demographic Profiling',
    description: 'Synthesizes aggregate age cohorts, country distributions, languages, and user persona archetypes.',
    defaultPayload: JSON.stringify(
      {
        posts: [
          { id: 'p1', author: { bio: 'AI Researcher at Lab' }, demographics: { ageGroup: '25-34', country: 'United States', language: 'English', profession: 'AI Research', persona: 'Tech Evangelist' }, sentiment: { polarity: 0.7, dominantEmotion: 'excitement' } },
          { id: 'p2', author: { bio: 'Cybersecurity Analyst' }, demographics: { ageGroup: '35-44', country: 'Germany', language: 'English', profession: 'Cybersecurity', persona: 'Security Researcher' }, sentiment: { polarity: -0.6, dominantEmotion: 'anxiety' } },
        ],
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/stream',
    title: 'Server-Sent Events (SSE) Live Telemetry Stream',
    description: 'Streams live social events with real-time NLP classification and platform latency stamps.',
  },
];

export const ApiPlayground: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [payloadText, setPayloadText] = useState<string>(ENDPOINTS[0].defaultPayload || '');
  const [responseOutput, setResponseOutput] = useState<string>('Click "Execute API Request" to test endpoint...');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setPayloadText(ep.defaultPayload || '');
    setResponseOutput('Click "Execute API Request" to test endpoint...');
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseOutput('Executing request...');

    try {
      if (selectedEndpoint.method === 'GET') {
        const res = await fetch(selectedEndpoint.path);
        setResponseOutput(`HTTP ${res.status} ${res.statusText}\nContent-Type: ${res.headers.get('content-type')}\n\n[SSE Stream Active - Receiving live telemetry packets]`);
      } else {
        const res = await fetch(selectedEndpoint.path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadText,
        });
        const data = await res.json();
        setResponseOutput(JSON.stringify(data, null, 2));
      }
    } catch (e) {
      setResponseOutput(`Error executing request: ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCurl = () => {
    const curl = selectedEndpoint.method === 'GET'
      ? `curl -X GET "http://localhost:3000${selectedEndpoint.path}"`
      : `curl -X POST "http://localhost:3000${selectedEndpoint.path}" \\\n  -H "Content-Type: application/json" \\\n  -d '${payloadText.replace(/'/g, "\\'")}'`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Developer OpenAPI & Interactive REST Playground
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test Sentix AI analytics endpoints directly in the browser or copy production cURL/SDK snippets
          </p>
        </div>
        <button
          onClick={handleCopyCurl}
          className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied cURL!' : 'Copy cURL'}</span>
        </button>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {ENDPOINTS.map((ep) => (
          <button
            key={ep.path}
            onClick={() => handleSelectEndpoint(ep)}
            className={`flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold transition border ${
              selectedEndpoint.path === ep.path
                ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500 shadow-md shadow-cyan-500/10'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <span
              className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {ep.method}
            </span>
            <span>{ep.title}</span>
          </button>
        ))}
      </div>

      {/* Endpoint Details */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-cyan-400">{selectedEndpoint.method}</span>
          <span className="font-mono text-xs text-white">{selectedEndpoint.path}</span>
        </div>
        <p className="text-xs text-slate-400">{selectedEndpoint.description}</p>
      </div>

      {/* Request & Response Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request Payload Editor */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>JSON Request Body:</span>
            <span className="text-[10px] text-slate-500 font-mono">application/json</span>
          </div>
          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            rows={12}
            disabled={selectedEndpoint.method === 'GET'}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Live Response Viewer */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Live Response Output:</span>
            <span className="text-[10px] text-slate-500 font-mono">200 OK</span>
          </div>
          <pre className="w-full h-[240px] rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap">
            {responseOutput}
          </pre>
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={isLoading}
        className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-bold text-white hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-600/20 disabled:opacity-50"
      >
        <Play className="h-4 w-4 fill-current" />
        <span>{isLoading ? 'Executing Request...' : 'Execute API Request'}</span>
      </button>
    </div>
  );
};
