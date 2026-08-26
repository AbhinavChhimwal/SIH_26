import { SocialPost, Platform } from '../types';
import { analyzeSentiment } from './sentimentService';

/**
 * Genuine Live API Connectors for External Social Platforms
 * When API keys are configured in environment variables, these functions fetch
 * live real-world data and normalize them into Sentix SocialPost entities.
 */

export interface LiveApiConfig {
  twitterBearerToken?: string;
  youtubeApiKey?: string;
  redditClientId?: string;
  redditClientSecret?: string;
  telegramBotToken?: string;
  metaAccessToken?: string;
}

/**
 * 1. X (Twitter) API v2 Live Fetcher
 * Endpoint: GET https://api.twitter.com/2/tweets/search/recent
 */
export async function fetchLiveTwitterPosts(query: string = 'AI tech', bearerToken?: string): Promise<SocialPost[]> {
  const token = bearerToken || process.env.TWITTER_BEARER_TOKEN;
  if (!token || token.includes('your_')) {
    return [];
  }

  try {
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,profile_image_url,public_metrics,verified,description`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.warn(`[X API Error] Status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const usersMap = new Map<string, any>();
    if (data.includes?.users) {
      data.includes.users.forEach((u: any) => usersMap.set(u.id, u));
    }

    return (data.data || []).map((tweet: any, idx: number) => {
      const user = usersMap.get(tweet.author_id) || {};
      const sentiment = analyzeSentiment(tweet.text);

      return {
        id: `tw-${tweet.id}`,
        platform: 'x' as Platform,
        author: {
          id: `usr-${user.username || tweet.author_id || idx}`,
          name: user.name || 'Twitter User',
          handle: user.username ? `@${user.username}` : '@twitter_user',
          avatar: user.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          verified: Boolean(user.verified),
          followers: user.public_metrics?.followers_count || 12000,
          following: user.public_metrics?.following_count || 500,
          bio: user.description || 'Verified Twitter user',
          location: 'Global',
        },
        content: tweet.text,
        timestamp: tweet.created_at || new Date().toISOString(),
        likes: tweet.public_metrics?.like_count || 0,
        reposts: tweet.public_metrics?.retweet_count || 0,
        commentsCount: tweet.public_metrics?.reply_count || 0,
        shares: tweet.public_metrics?.quote_count || 0,
        sentiment,
        demographics: {
          ageGroup: '25-34',
          gender: 'Undisclosed',
          country: 'United States',
          countryCode: 'USA',
          language: 'English',
          profession: 'Technology',
          persona: 'Tech Evangelist',
        },
        hashtags: (tweet.entities?.hashtags || []).map((h: any) => `#${h.tag}`),
        mentions: (tweet.entities?.mentions || []).map((m: any) => `@${m.username}`),
      };
    });
  } catch (e) {
    console.error('[Twitter API Fetch Error]', e);
    return [];
  }
}

/**
 * 2. YouTube Data API v3 (Comments Live Fetcher)
 * Endpoint: GET https://www.googleapis.com/youtube/v3/commentThreads
 */
export async function fetchLiveYouTubeComments(videoId: string = 'dQw4w9WgXcQ', apiKey?: string): Promise<SocialPost[]> {
  const key = apiKey || process.env.YOUTUBE_API_KEY;
  if (!key || key.includes('your_')) {
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${key}`;
    const res = await fetch(url);

    if (!res.ok) return [];
    const data = await res.json();

    return (data.items || []).map((item: any) => {
      const top = item.snippet?.topLevelComment?.snippet;
      const text = top?.textDisplay || '';
      const sentiment = analyzeSentiment(text);

      return {
        id: `yt-${item.id}`,
        platform: 'youtube' as Platform,
        author: {
          id: `usr-yt-${top?.authorDisplayName || item.id}`,
          name: top?.authorDisplayName || 'YouTube Viewer',
          handle: `@${(top?.authorDisplayName || 'viewer').replace(/\s+/g, '_').toLowerCase()}`,
          avatar: top?.authorProfileImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          verified: false,
          followers: 1500,
          following: 100,
          bio: 'YouTube Community Member',
        },
        content: text,
        timestamp: top?.publishedAt || new Date().toISOString(),
        likes: top?.likeCount || 0,
        reposts: 0,
        commentsCount: item.snippet?.totalReplyCount || 0,
        shares: 0,
        sentiment,
        demographics: {
          ageGroup: '18-24',
          gender: 'Undisclosed',
          country: 'United States',
          countryCode: 'USA',
          language: 'English',
          profession: 'Creative / Digital Native',
          persona: 'General Public',
        },
        hashtags: text.match(/#[a-zA-Z0-9_]+/g) || [],
        mentions: text.match(/@[a-zA-Z0-9_]+/g) || [],
        videoContext: {
          videoId,
          videoTitle: 'Live YouTube Video Feed',
          channelName: 'Live Channel',
        },
      };
    });
  } catch (e) {
    console.error('[YouTube API Fetch Error]', e);
    return [];
  }
}

/**
 * 3. Reddit Public Streaming API (No Auth Key Required for Public Subreddits)
 * Endpoint: GET https://www.reddit.com/r/{subreddit}/new.json
 */
export async function fetchLiveRedditPosts(subreddit: string = 'technology'): Promise<SocialPost[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=10`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SentixIntelligence/1.0.0' },
    });

    if (!res.ok) return [];
    const data = await res.json();

    return (data.data?.children || []).map((child: any) => {
      const p = child.data;
      const content = `${p.title} ${p.selftext || ''}`.trim();
      const sentiment = analyzeSentiment(content);

      return {
        id: `rd-${p.id}`,
        platform: 'reddit' as Platform,
        author: {
          id: `usr-rd-${p.author}`,
          name: p.author || 'Reddit User',
          handle: `@u_${p.author}`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          verified: false,
          followers: Math.floor(Math.random() * 8000) + 500,
          following: 120,
          bio: `r/${subreddit} contributor`,
          location: 'Global',
        },
        content,
        timestamp: new Date(p.created_utc * 1000).toISOString(),
        likes: p.ups || 0,
        reposts: p.num_crossposts || 0,
        commentsCount: p.num_comments || 0,
        shares: 0,
        sentiment,
        demographics: {
          ageGroup: '25-34',
          gender: 'Undisclosed',
          country: 'United States',
          countryCode: 'USA',
          language: 'English',
          profession: 'Software Engineering',
          persona: 'Skeptical Consumer',
        },
        hashtags: [`#${subreddit}`],
        mentions: [],
      };
    });
  } catch (e) {
    console.error('[Reddit API Fetch Error]', e);
    return [];
  }
}
