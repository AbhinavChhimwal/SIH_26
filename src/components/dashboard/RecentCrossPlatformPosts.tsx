'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Platform, EmotionType } from '@/lib/types';
import {
  Twitter,
  Send,
  Instagram,
  Facebook,
  MessageSquare,
  Video,
  Heart,
  Repeat,
  MessageCircle,
  Share2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const PLATFORM_ICONS: Record<Platform, { icon: any; color: string; label: string }> = {
  x: { icon: Twitter, color: 'text-sky-400', label: 'X (Twitter)' },
  telegram: { icon: Send, color: 'text-blue-400', label: 'Telegram' },
  instagram: { icon: Instagram, color: 'text-pink-400', label: 'Instagram' },
  facebook: { icon: Facebook, color: 'text-indigo-400', label: 'Facebook' },
  reddit: { icon: MessageSquare, color: 'text-orange-400', label: 'Reddit' },
  youtube: { icon: Video, color: 'text-red-400', label: 'YouTube' },
};

const EMOTION_COLORS: Record<EmotionType, { bg: string; text: string; border: string }> = {
  sarcasm: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
  anxiety: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30' },
  excitement: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  supportive: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/30' },
  against: { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/30' },
  joy: { bg: 'bg-teal-500/10', text: 'text-teal-300', border: 'border-teal-500/30' },
  anger: { bg: 'bg-red-600/10', text: 'text-red-400', border: 'border-red-600/30' },
  fear: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30' },
  confusion: { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/30' },
  trust: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  neutral: { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' },
};

export const RecentCrossPlatformPosts: React.FC = () => {
  const { filteredPosts } = useAnalytics();

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            Cross-Platform Ingestion Stream & Chronological Feed
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Normalized multi-source feed with AI emotion attribution, polarity scoring, and demographic metadata
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-400">
          Showing <span className="font-semibold text-white">{filteredPosts.length}</span> verified posts
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[680px] overflow-y-auto pr-1">
        {filteredPosts.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-500">
            No posts match the current filter selection. Try resetting filters.
          </div>
        ) : (
          filteredPosts.map((post) => {
            const platformConfig = PLATFORM_ICONS[post.platform] || PLATFORM_ICONS.x;
            const PlatformIcon = platformConfig.icon;
            const emotionStyle = EMOTION_COLORS[post.sentiment.dominantEmotion] || EMOTION_COLORS.neutral;

            return (
              <div
                key={post.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 hover:border-slate-700 transition"
              >
                <div>
                  {/* Header: Author + Platform Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-xs text-white">{post.author.name}</span>
                          {post.author.verified && (
                            <span className="rounded-full bg-blue-500/20 px-1 text-[9px] font-bold text-blue-400">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <span>{post.author.handle}</span>
                          <span>•</span>
                          <span>{post.author.followers.toLocaleString()} followers</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs">
                      <PlatformIcon className={`h-3.5 w-3.5 ${platformConfig.color}`} />
                      <span className="text-[11px] font-medium text-slate-300">{platformConfig.label}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="mt-3 text-xs text-slate-200 leading-relaxed">{post.content}</p>

                  {/* Video context for YouTube */}
                  {post.videoContext && (
                    <div className="mt-2 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2 text-[11px] text-slate-300 flex items-center space-x-2">
                      <Video className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <span className="truncate">
                        Commented on: <strong className="text-white">{post.videoContext.videoTitle}</strong>
                      </span>
                    </div>
                  )}

                  {/* Channel Title for Telegram */}
                  {post.channelTitle && (
                    <div className="mt-2 text-[10px] text-blue-400 font-medium">
                      Broadcast Channel: {post.channelTitle}
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.hashtags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer: Sentiment Analysis & Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${emotionStyle.bg} ${emotionStyle.text} ${emotionStyle.border}`}
                      >
                        {post.sentiment.dominantEmotion}
                      </span>
                      {post.sentiment.sarcasmScore > 0.4 && (
                        <span className="flex items-center space-x-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          <span>Sarcasm {Math.round(post.sentiment.sarcasmScore * 100)}%</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="text-slate-400">Polarity:</span>
                      <span
                        className={`font-mono font-bold ${
                          post.sentiment.polarity >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {post.sentiment.polarity >= 0 ? `+${post.sentiment.polarity}` : post.sentiment.polarity}
                      </span>
                    </div>
                  </div>

                  {/* Engagement Counts */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1 hover:text-slate-300">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1 hover:text-slate-300">
                        <Repeat className="h-3 w-3" />
                        <span>{post.reposts.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1 hover:text-slate-300">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.commentsCount.toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      {post.demographics.country} • {post.demographics.profession}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
