import { NextRequest, NextResponse } from 'next/server';
import {
  fetchLiveTwitterPosts,
  fetchLiveYouTubeComments,
  fetchLiveRedditPosts,
  fetchLiveTelegramUpdates,
  fetchLiveHackerNewsPosts,
} from '@/lib/services/liveApiConnectors';
import { SocialPost } from '@/lib/types';
import { extractTrendsFromPosts } from '@/lib/services/trendService';
import { computeDemographicProfile } from '@/lib/services/demographicService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform') || 'all';
  const query = searchParams.get('query') || 'AI tech';

  const collectedPosts: SocialPost[] = [];
  const sourcesContacted: string[] = [];

  try {
    // 1. Live Public Hacker News Stream (100% Free, ZERO keys required, ALWAYS works live!)
    if (platform === 'all' || platform === 'reddit') {
      const hnPosts = await fetchLiveHackerNewsPosts();
      if (hnPosts.length > 0) {
        collectedPosts.push(...hnPosts);
        sourcesContacted.push('HackerNews (Live Public Firebase API)');
      }
    }

    // 2. Reddit OAuth (Works if REDDIT_CLIENT_ID & REDDIT_CLIENT_SECRET are set)
    if (platform === 'all' || platform === 'reddit') {
      const redditPosts = await fetchLiveRedditPosts('technology');
      if (redditPosts.length > 0) {
        collectedPosts.push(...redditPosts);
        sourcesContacted.push('Reddit (Live OAuth Stream)');
      }
    }

    // 3. YouTube (Works if YOUTUBE_API_KEY is configured)
    if (platform === 'all' || platform === 'youtube') {
      const youtubeComments = await fetchLiveYouTubeComments();
      if (youtubeComments.length > 0) {
        collectedPosts.push(...youtubeComments);
        sourcesContacted.push('YouTube Data API v3 (Live Comments)');
      }
    }

    // 4. Telegram Bot API (Works if TELEGRAM_BOT_TOKEN is configured)
    if (platform === 'all' || platform === 'telegram') {
      const telegramPosts = await fetchLiveTelegramUpdates();
      if (telegramPosts.length > 0) {
        collectedPosts.push(...telegramPosts);
        sourcesContacted.push('Telegram Bot API (Live Channel Updates)');
      }
    }

    // 5. Twitter / X (Works if TWITTER_BEARER_TOKEN is configured)
    if (platform === 'all' || platform === 'x') {
      const twitterPosts = await fetchLiveTwitterPosts(query);
      if (twitterPosts.length > 0) {
        collectedPosts.push(...twitterPosts);
        sourcesContacted.push('X (Twitter API v2)');
      }
    }

    const trends = extractTrendsFromPosts(collectedPosts);
    const demographics = computeDemographicProfile(collectedPosts);

    return NextResponse.json({
      success: true,
      count: collectedPosts.length,
      isRealExternalData: collectedPosts.length > 0,
      sourcesContacted,
      posts: collectedPosts,
      trends,
      demographics,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
