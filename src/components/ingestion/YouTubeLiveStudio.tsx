'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { SocialPost } from '@/lib/types';
import {
  Youtube,
  CheckCircle2,
  Search,
  Sparkles,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Flame,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export const YouTubeLiveStudio: React.FC = () => {
  const { uploadCustomScenario } = useAnalytics();

  const [inputQuery, setInputQuery] = useState('https://www.youtube.com/watch?v=rw4SFwleSqA');
  const [maxResults, setMaxResults] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [fetchedData, setFetchedData] = useState<{
    videoId: string;
    videoTitle: string;
    channelTitle: string;
    count: number;
    posts: SocialPost[];
  } | null>(null);

  const [injectedSuccess, setInjectedSuccess] = useState(false);

  const handleFetch = async (queryToUse?: string) => {
    const q = queryToUse || inputQuery;
    if (!q.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setInjectedSuccess(false);

    try {
      const isUrlOrId = q.includes('youtube.com') || q.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(q.trim());
      const param = isUrlOrId ? `videoId=${encodeURIComponent(q.trim())}` : `query=${encodeURIComponent(q.trim())}`;

      const res = await fetch(`/api/ingestion/youtube-live?${param}&maxResults=${maxResults}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch YouTube comments');
      }

      setFetchedData({
        videoId: data.videoId,
        videoTitle: data.videoTitle,
        channelTitle: data.channelTitle,
        count: data.count,
        posts: data.posts || [],
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while calling the YouTube API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInjectIntoPlatform = () => {
    if (!fetchedData || fetchedData.posts.length === 0) return;

    // Ingest as a custom active workspace scenario
    uploadCustomScenario(
      `YouTube Live: ${fetchedData.videoTitle.slice(0, 35)}...`,
      fetchedData.posts
    );

    setInjectedSuccess(true);
    setTimeout(() => setInjectedSuccess(false), 4000);
  };

  // Compute live sentiment stats from fetched comments
  const stats = React.useMemo(() => {
    if (!fetchedData || fetchedData.posts.length === 0) return null;
    const posts = fetchedData.posts;
    const avgPolarity = posts.reduce((sum, p) => sum + p.sentiment.polarity, 0) / posts.length;
    const sarcasmCount = posts.filter((p) => p.sentiment.dominantEmotion === 'sarcasm').length;
    const excitementCount = posts.filter((p) => p.sentiment.dominantEmotion === 'excitement').length;
    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

    return {
      avgPolarity: avgPolarity.toFixed(2),
      sarcasmPct: Math.round((sarcasmCount / posts.length) * 100),
      excitementPct: Math.round((excitementCount / posts.length) * 100),
      totalLikes,
    };
  }, [fetchedData]);

  return (
    <div className="rounded-2xl border border-red-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900/90 p-5 backdrop-blur shadow-xl space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500 border border-red-500/30">
            <Youtube className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live YouTube Data API v3 Comments & Sentiment Studio
              </h3>
              <span className="flex items-center space-x-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" />
                <span>API Key Connected</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Google Cloud connection active (<code className="font-mono text-[11px] text-slate-300">AIzaSy...4KmfAyQ</code>). Pull real comments and run multi-dimensional AI sentiment analysis live.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            Daily Free Quota: 10,000 units
          </span>
        </div>
      </div>

      {/* Input Search / URL Form */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Paste any YouTube video link (e.g. youtube.com/watch?v=...) or search topic (e.g. 'OpenAI Launch')"
              className="w-full h-10 rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="h-10 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-300 focus:border-red-500 focus:outline-none cursor-pointer"
            >
              <option value={10}>10 Comments</option>
              <option value={20}>20 Comments</option>
              <option value={35}>35 Comments</option>
              <option value={50}>50 Comments</option>
            </select>

            <button
              onClick={() => handleFetch()}
              disabled={isLoading}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-bold text-white hover:from-red-500 hover:to-rose-500 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Querying YouTube API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Fetch Real Comments Live</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="text-slate-500 font-medium">Quick Presets:</span>
          {[
            { label: '🤖 AI Basics Tutorial', query: 'rw4SFwleSqA' },
            { label: '⚡ Quantum Computing', query: 'Quantum Computing breakthrough' },
            { label: '🛡️ Cyber Security Exploit', query: 'Cybersecurity ransom exploit' },
            { label: '🎵 Rick Astley (Classic)', query: 'dQw4w9WgXcQ' },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setInputQuery(preset.query);
                handleFetch(preset.query);
              }}
              className="rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-0.5 hover:border-slate-700 hover:text-white transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
          <strong>YouTube API Error:</strong> {errorMsg}
        </div>
      )}

      {/* Fetched Data Preview & AI Metrics */}
      {fetchedData && (
        <div className="space-y-4 pt-2">
          {/* Target Video Information Card */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <div>
              <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                Target YouTube Video
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{fetchedData.videoTitle}</h4>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                <span>Channel: <strong className="text-slate-200">{fetchedData.channelTitle}</strong></span>
                <span>•</span>
                <span>Video ID: <code className="font-mono text-slate-300">{fetchedData.videoId}</code></span>
                <span>•</span>
                <a
                  href={`https://www.youtube.com/watch?v=${fetchedData.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-red-400 hover:underline"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Action to Inject into Global Platform Feed */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInjectIntoPlatform}
                className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition shadow-md shadow-blue-600/20"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Inject Into Analytics Feed</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {injectedSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Success!</strong> Injected {fetchedData.posts.length} real YouTube comments into your active workspace. Check the <strong>Overview Dashboard</strong>, <strong>Sentiment Studio</strong>, and <strong>Demographics</strong> to see them analyzed live!
              </span>
            </div>
          )}

          {/* NLP Live Stats Summary */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[11px] text-slate-400">Total Comments Fetched</span>
                <div className="text-lg font-bold text-white mt-0.5">{fetchedData.count}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[11px] text-slate-400">Net Polarity Score</span>
                <div className={`text-lg font-bold mt-0.5 ${Number(stats.avgPolarity) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.avgPolarity}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[11px] text-slate-400">Sarcasm % (NLP)</span>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{stats.sarcasmPct}%</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[11px] text-slate-400">Viewer Likes Sum</span>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">{stats.totalLikes.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Stream of Fetched Comments */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
              <span>Live Fetched Comments ({fetchedData.posts.length}):</span>
              <span className="text-[10px] text-slate-500">Classified in real-time by Sentix NLP</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {fetchedData.posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-950 p-3 text-xs space-y-1.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="h-6 w-6 rounded-full border border-slate-800 object-cover"
                      />
                      <span className="font-bold text-white">{post.author.name}</span>
                      <span className="text-[11px] text-slate-500">{post.author.handle}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                          post.sentiment.dominantEmotion === 'excitement'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : post.sentiment.dominantEmotion === 'sarcasm'
                            ? 'bg-amber-500/20 text-amber-400'
                            : post.sentiment.dominantEmotion === 'anxiety'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {post.sentiment.dominantEmotion}
                      </span>
                      <span className="flex items-center space-x-1 text-slate-400 font-mono text-[10px]">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{post.likes}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
