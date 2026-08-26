export type Platform = 'x' | 'telegram' | 'instagram' | 'facebook' | 'reddit' | 'youtube';

export type EmotionType =
  | 'sarcasm'
  | 'anxiety'
  | 'excitement'
  | 'supportive'
  | 'against'
  | 'anger'
  | 'joy'
  | 'fear'
  | 'confusion'
  | 'trust'
  | 'neutral';

export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface EmotionScore {
  emotion: EmotionType;
  score: number; // 0.0 to 1.0
  color: string;
}

export interface TriggerToken {
  token: string;
  emotion: EmotionType;
  weight: number; // relative importance
}

export interface SentimentAnalysis {
  polarity: number; // -1.0 to 1.0
  label: SentimentLabel;
  confidence: number; // 0 to 100%
  subjectivity: number; // 0.0 to 1.0
  emotions: Record<EmotionType, number>;
  dominantEmotion: EmotionType;
  sarcasmScore: number; // 0.0 to 1.0
  anxietyScore: number; // 0.0 to 1.0
  supportiveScore: number; // 0.0 to 1.0
  againstScore: number; // 0.0 to 1.0
  triggerTokens: TriggerToken[];
}

export interface AuthorProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  followers: number;
  following: number;
  bio: string;
  location?: string;
  inferredAge?: string;
  inferredProfession?: string;
  inferredGender?: string;
}

export interface SocialPost {
  id: string;
  platform: Platform;
  author: AuthorProfile;
  content: string;
  timestamp: string; // ISO 8601
  mediaUrl?: string;
  likes: number;
  reposts: number;
  commentsCount: number;
  shares: number;
  sentiment: SentimentAnalysis;
  demographics: {
    ageGroup: '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
    gender: 'Female' | 'Male' | 'Non-Binary' | 'Undisclosed';
    country: string;
    countryCode: string;
    language: string;
    profession: string;
    persona: string;
  };
  hashtags: string[];
  mentions: string[];
  replyToPostId?: string;
  quotedPostId?: string;
  channelTitle?: string;
  videoContext?: {
    videoId: string;
    videoTitle: string;
    channelName: string;
  };
  threadReplies?: SocialPost[];
}

export interface DemographicProfile {
  totalAudienceSampled: number;
  ageDistribution: Array<{
    range: '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
    percentage: number;
    count: number;
  }>;
  genderDistribution: Array<{
    gender: string;
    percentage: number;
    count: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    countryCode: string;
    count: number;
    percentage: number;
    lat: number;
    lng: number;
    sentimentScore: number; // -1.0 to 1.0
    dominantEmotion: EmotionType;
  }>;
  languageDistribution: Array<{
    language: string;
    code: string;
    count: number;
    percentage: number;
  }>;
  professionalInterests: Array<{
    category: string;
    count: number;
    percentage: number;
    topKeywords: string[];
  }>;
  personaClusters: Array<{
    id: string;
    name: string;
    tagline: string;
    description: string;
    sizePercentage: number;
    topEmotions: EmotionType[];
    sentimentPolarity: number;
    sampleBios: string[];
    dominantPlatforms: Platform[];
  }>;
}

export type TrendStatus = 'emerging' | 'peaking' | 'stabilizing' | 'declining';
export type NarrativeStage = 'Origin' | 'Amplification' | 'Peak Controversy' | 'Resolution';

export interface TrendTopic {
  id: string;
  keyword: string;
  hashtag: string;
  category: string;
  volume: number;
  velocity: number; // % change per hour
  acceleration: number; // delta velocity
  status: TrendStatus;
  viralityScore: number; // 0 to 100
  sentimentScore: number; // -1.0 to 1.0
  dominantEmotion: EmotionType;
  topEmotions: Array<{ emotion: EmotionType; weight: number }>;
  timelineData: Array<{
    timestamp: string;
    volume: number;
    sentiment: number;
    sarcasm: number;
    anxiety: number;
  }>;
  coOccurringKeywords: string[];
  narrativeStage: NarrativeStage;
  keyOpinionLeader: string;
  samplePosts: string[];
}

export interface NetworkNode {
  id: string;
  label: string;
  handle: string;
  platform: Platform;
  followers: number;
  influenceScore: number; // 0 - 100
  pageRank: number; // relative graph rank
  betweennessCentrality: number;
  inDegree: number;
  outDegree: number;
  eigenvectorCentrality: number;
  communityId: number;
  communityName: string;
  dominantSentiment: EmotionType;
  sentimentPolarity: number;
  avatar: string;
  role: 'KOL' | 'Amplifier' | 'Bridge' | 'Regular' | 'Bot/Spammer';
  infectedAtStep?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: 'retweet' | 'mention' | 'reply' | 'quote' | 'forward' | 'comment';
  weight: number;
  timestamp: string;
  platform: Platform;
  sentiment: number;
}

export interface CommunityInfo {
  id: number;
  name: string;
  color: string;
  size: number;
  percentage: number;
  topNodes: string[];
  dominantTheme: string;
  sentimentAvg: number;
  dominantEmotion: EmotionType;
}

export interface CascadeStep {
  step: number;
  timeLabel: string;
  timestamp: string;
  activeNodes: string[];
  newlyInfectedNodes: string[];
  activeEdges: string[];
  cumulativeReach: number;
  reproductionRate: number; // R0 estimation
  dominantEmotion: EmotionType;
  narrativeMilestone: string;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  communities: CommunityInfo[];
  cascadeTimeline: CascadeStep[];
}

export interface IntelligenceScenario {
  id: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  coverImage?: string;
  posts: SocialPost[];
  trends: TrendTopic[];
  network: NetworkGraph;
  demographics: DemographicProfile;
}

export type UserRole = 'admin' | 'analyst' | 'manager' | 'viewer';

export interface FilterState {
  selectedPlatforms: Platform[];
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' | 'all';
  selectedEmotions: EmotionType[];
  searchQuery: string;
  selectedCountry: string | null;
  selectedCommunity: number | null;
  minInfluence: number;
  onlyKOLs: boolean;
}

export interface PlatformConnectorStatus {
  platform: Platform;
  name: string;
  icon: string;
  status: 'connected' | 'simulating' | 'degraded' | 'rate-limited' | 'disconnected';
  ingestedPerMinute: number;
  totalIngested: number;
  lastSync: string;
  latencyMs: number;
  authType: 'API Key' | 'OAuth 2.0' | 'Bot Token' | 'Synthetic Live Feed';
  isConfigured: boolean;
}

export interface IngestionState {
  isStreaming: boolean;
  streamSpeedMultiplier: number; // 1x, 2x, 5x, 10x
  totalIngestedCount: number;
  bufferSize: number;
  throughputPerSecond: number;
  connectors: Record<Platform, PlatformConnectorStatus>;
  recentStream: SocialPost[];
}
