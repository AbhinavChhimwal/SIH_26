import { NextRequest, NextResponse } from 'next/server';
import {
  fetchLiveTwitterPosts,
  fetchLiveYouTubeComments,
  fetchLiveRedditPosts,
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

  try {
    // 1. Reddit (Works immediately with zero auth keys)
    if (platform === 'all' || platform === 'reddit') {
      const redditPosts = await fetchLiveRedditPosts('technology');
      collectedPosts.push(...redditPosts);
    }

    // 2. Twitter / X (Uses TWITTER_BEARER_TOKEN if configured)
    if (platform === 'all' || platform === 'x') {
      const twitterPosts = await fetchLiveTwitterPosts(query);
      collectedPosts.push(...twitterPosts);
    }

    // 3. YouTube (Uses YOUTUBE_API_KEY if configured)
    if (platform === 'all' || platform === 'youtube') {
      const youtubeComments = await fetchLiveYouTubeComments();
      collectedPosts.push(...youtubeComments);
    }

    const trends = extractTrendsFromPosts(collectedPosts);
    const demographics = computeDemographicProfile(collectedPosts);

    return NextResponse.json({
      success: true,
      count: collectedPosts.length,
      isRealExternalData: collectedPosts.length > 0,
      posts: collectedPosts,
      trends,
      demographics,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
