import { Platform, PlatformConnectorStatus, SocialPost, IngestionState } from '../types';
import { analyzeSentiment } from './sentimentService';

export const INITIAL_PLATFORM_CONNECTORS: Record<Platform, PlatformConnectorStatus> = {
  x: {
    platform: 'x',
    name: 'X (formerly Twitter)',
    icon: 'Twitter',
    status: 'connected',
    ingestedPerMinute: 420,
    totalIngested: 148200,
    lastSync: 'Just now',
    latencyMs: 120,
    authType: 'OAuth 2.0',
    isConfigured: true,
  },
  telegram: {
    platform: 'telegram',
    name: 'Telegram Broadcasts & Groups',
    icon: 'Send',
    status: 'connected',
    ingestedPerMinute: 215,
    totalIngested: 86400,
    lastSync: 'Just now',
    latencyMs: 85,
    authType: 'Bot Token',
    isConfigured: true,
  },
  instagram: {
    platform: 'instagram',
    name: 'Instagram Graph API',
    icon: 'Instagram',
    status: 'simulating',
    ingestedPerMinute: 180,
    totalIngested: 54100,
    lastSync: '2s ago',
    latencyMs: 140,
    authType: 'OAuth 2.0',
    isConfigured: true,
  },
  facebook: {
    platform: 'facebook',
    name: 'Facebook Public Pages API',
    icon: 'Facebook',
    status: 'simulating',
    ingestedPerMinute: 95,
    totalIngested: 31200,
    lastSync: '5s ago',
    latencyMs: 190,
    authType: 'OAuth 2.0',
    isConfigured: true,
  },
  reddit: {
    platform: 'reddit',
    name: 'Reddit Streaming API',
    icon: 'MessageSquare',
    status: 'connected',
    ingestedPerMinute: 310,
    totalIngested: 92700,
    lastSync: '1s ago',
    latencyMs: 110,
    authType: 'API Key',
    isConfigured: true,
  },
  youtube: {
    platform: 'youtube',
    name: 'YouTube Data API v3 (Comments)',
    icon: 'Video',
    status: 'connected',
    ingestedPerMinute: 160,
    totalIngested: 48900,
    lastSync: 'Just now',
    latencyMs: 165,
    authType: 'API Key',
    isConfigured: true,
  },
};

const LIVE_STREAM_TEMPLATES: Array<{
  platform: Platform;
  authorName: string;
  handle: string;
  avatar: string;
  content: string;
  hashtags: string[];
  demographics: {
    ageGroup: '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
    gender: 'Female' | 'Male' | 'Non-Binary' | 'Undisclosed';
    country: string;
    language: string;
    profession: string;
    persona: string;
  };
  channelTitle?: string;
  videoContext?: { videoId: string; videoTitle: string; channelName: string };
}> = [
  {
    platform: 'x',
    authorName: 'TechCrunch Live',
    handle: '@techcrunch_feed',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    content: 'BREAKING: Global tech regulatory coalition opens antitrust compliance investigation into autonomous AI deployment models. Emergency oversight briefing set for Friday.',
    hashtags: ['#TechNews', '#Regulation', '#AI'],
    demographics: { ageGroup: '35-44', gender: 'Male', country: 'United States', language: 'English', profession: 'Journalism', persona: 'Tech Evangelist' }
  },
  {
    platform: 'telegram',
    authorName: 'Infosec Pulse Channel',
    handle: '@infosec_pulse',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    content: '⚠️ Real-time packet telemetry confirms 30% latency spike across Tier-1 transit hubs. SRE teams rolling back recent DNS edge routing updates.',
    hashtags: ['#NetOps', '#DDoS', '#Latency'],
    demographics: { ageGroup: '25-34', gender: 'Female', country: 'Germany', language: 'English', profession: 'Cybersecurity', persona: 'Security Researcher' },
    channelTitle: 'Infosec Global Alerts'
  },
  {
    platform: 'reddit',
    authorName: 'CloudArchitect_99',
    handle: '@u_CloudArchitect_99',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    content: 'Love it when high-availability guarantees vanish the minute cloud edge nodes hiccup. Best feature ever!',
    hashtags: ['#SRE', '#CloudArchitecture'],
    demographics: { ageGroup: '25-34', gender: 'Male', country: 'United Kingdom', language: 'English', profession: 'Software Engineering', persona: 'Skeptical Consumer' }
  },
  {
    platform: 'youtube',
    authorName: 'DeepLearning Labs',
    handle: '@dl_labs_yt',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'The inference latency on quantized weights is remarkably low. Truly phenomenal optimization work by the open-source community.',
    hashtags: ['#OpenSource', '#Quantization', '#AI'],
    demographics: { ageGroup: '18-24', gender: 'Male', country: 'India', language: 'English', profession: 'Data Science', persona: 'Tech Evangelist' },
    videoContext: { videoId: 'yt-benchmarks', videoTitle: 'Quantized LLM Speed Test', channelName: 'DeepLearning Labs' }
  },
  {
    platform: 'instagram',
    authorName: 'Samantha Green',
    handle: '@sam_eco_style',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    content: 'Testing out the recycled solar watch in direct sunlight today. Mindblown by how light and elegant it looks on the wrist!',
    hashtags: ['#EcoFashion', '#TechStyle', '#CleanTech'],
    demographics: { ageGroup: '18-24', gender: 'Female', country: 'United States', language: 'English', profession: 'Creative & Design', persona: 'Brand Advocate' }
  },
  {
    platform: 'facebook',
    authorName: 'Consumer Rights Group',
    handle: '@consumer_watch_global',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    content: 'We are receiving hundreds of user complaints regarding unannounced subscription price hikes and locked accounts. Legal action under review.',
    hashtags: ['#ConsumerRights', '#FairPricing', '#Advocacy'],
    demographics: { ageGroup: '45-54', gender: 'Male', country: 'Canada', language: 'English', profession: 'Legal & Policy', persona: 'Activist Critic' }
  }
];

export function generateNextLiveStreamPost(): SocialPost {
  const template = LIVE_STREAM_TEMPLATES[Math.floor(Math.random() * LIVE_STREAM_TEMPLATES.length)];
  const id = `live-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const sentiment = analyzeSentiment(template.content);

  return {
    id,
    platform: template.platform,
    author: {
      id: `usr-${template.handle.replace('@', '')}`,
      name: template.authorName,
      handle: template.handle,
      avatar: template.avatar,
      verified: Math.random() > 0.4,
      followers: Math.floor(Math.random() * 250000) + 5000,
      following: Math.floor(Math.random() * 1500) + 100,
      bio: 'Live feed contributor & community analyst.',
      location: template.demographics.country,
      inferredAge: template.demographics.ageGroup,
      inferredProfession: template.demographics.profession,
      inferredGender: template.demographics.gender,
    },
    content: template.content,
    timestamp: new Date().toISOString(),
    likes: Math.floor(Math.random() * 4000) + 120,
    reposts: Math.floor(Math.random() * 1200) + 45,
    commentsCount: Math.floor(Math.random() * 500) + 15,
    shares: Math.floor(Math.random() * 600) + 30,
    sentiment,
    demographics: {
      ...template.demographics,
      countryCode: template.demographics.country.slice(0, 3).toUpperCase(),
    },
    hashtags: template.hashtags,
    mentions: [],
    channelTitle: template.channelTitle,
    videoContext: template.videoContext,
  };
}

/**
 * Parses user-uploaded CSV or JSON datasets
 */
export function parseUploadedDataset(rawText: string, format: 'json' | 'csv'): SocialPost[] {
  if (format === 'json') {
    try {
      const data = JSON.parse(rawText);
      const items = Array.isArray(data) ? data : [data];
      return items.map((item, idx) => {
        const content = item.content || item.text || item.message || 'Sample social post';
        const platform = (['x', 'telegram', 'instagram', 'facebook', 'reddit', 'youtube'].includes(item.platform) 
          ? item.platform 
          : 'x') as Platform;
        const sentiment = item.sentiment && item.sentiment.polarity !== undefined 
          ? item.sentiment 
          : analyzeSentiment(content);

        return {
          id: item.id || `up-${Date.now()}-${idx}`,
          platform,
          author: {
            id: item.author?.id || `usr-${idx}`,
            name: item.author?.name || item.author_name || 'Uploaded User',
            handle: item.author?.handle || `@user_${idx}`,
            avatar: item.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            verified: Boolean(item.author?.verified),
            followers: item.author?.followers || 5000,
            following: item.author?.following || 300,
            bio: item.author?.bio || 'Uploaded profile',
            location: item.author?.location || 'United States',
          },
          content,
          timestamp: item.timestamp || new Date().toISOString(),
          likes: item.likes || Math.floor(Math.random() * 1000),
          reposts: item.reposts || Math.floor(Math.random() * 200),
          commentsCount: item.commentsCount || Math.floor(Math.random() * 50),
          shares: item.shares || Math.floor(Math.random() * 80),
          sentiment,
          demographics: item.demographics || {
            ageGroup: '25-34',
            gender: 'Undisclosed',
            country: 'United States',
            countryCode: 'USA',
            language: 'English',
            profession: 'Technology',
            persona: 'Tech Evangelist',
          },
          hashtags: item.hashtags || [],
          mentions: item.mentions || [],
        };
      });
    } catch (e) {
      throw new Error(`Failed to parse JSON dataset: ${(e as Error).message}`);
    }
  } else {
    // Basic CSV Parser
    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data row.');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const contentIdx = headers.findIndex(h => h.includes('content') || h.includes('text') || h.includes('post') || h.includes('message'));
    const platformIdx = headers.findIndex(h => h.includes('platform'));
    const authorIdx = headers.findIndex(h => h.includes('author') || h.includes('user'));

    if (contentIdx === -1) {
      throw new Error('CSV must contain a column for "content" or "text".');
    }

    return lines.slice(1).map((line, idx) => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const content = cols[contentIdx] || 'Sample text';
      const rawPlat = platformIdx !== -1 ? cols[platformIdx]?.toLowerCase() : 'x';
      const platform: Platform = ['x', 'telegram', 'instagram', 'facebook', 'reddit', 'youtube'].includes(rawPlat) 
        ? rawPlat as Platform 
        : 'x';
      const author = authorIdx !== -1 ? cols[authorIdx] : `Analyst_${idx + 1}`;

      const sentiment = analyzeSentiment(content);

      return {
        id: `csv-${Date.now()}-${idx}`,
        platform,
        author: {
          id: `usr-csv-${idx}`,
          name: author || `User ${idx + 1}`,
          handle: `@${(author || 'user').toLowerCase().replace(/\s+/g, '_')}`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          verified: false,
          followers: 12000,
          following: 450,
          bio: 'Custom dataset entry',
          location: 'Global',
        },
        content,
        timestamp: new Date().toISOString(),
        likes: 150,
        reposts: 35,
        commentsCount: 12,
        shares: 20,
        sentiment,
        demographics: {
          ageGroup: '25-34',
          gender: 'Undisclosed',
          country: 'United States',
          countryCode: 'USA',
          language: 'English',
          profession: 'Technology',
          persona: 'General Public',
        },
        hashtags: content.match(/#[a-zA-Z0-9_]+/g) || [],
        mentions: content.match(/@[a-zA-Z0-9_]+/g) || [],
      };
    });
  }
}
