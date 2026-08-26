import { IntelligenceScenario, SocialPost, NetworkGraph, Platform, EmotionType } from '../types';
import { analyzeSentiment } from '../services/sentimentService';
import { enrichGraphWithMetrics } from '../services/networkService';
import { extractTrendsFromPosts } from '../services/trendService';
import { computeDemographicProfile } from '../services/demographicService';
import { simulateInformationCascade } from '../services/cascadeService';

// Raw generator helper to produce rich, realistic posts
function createPost(
  id: string,
  platform: Platform,
  name: string,
  handle: string,
  avatar: string,
  bio: string,
  followers: number,
  content: string,
  minutesAgo: number,
  metrics: { likes: number; reposts: number; comments: number; shares: number },
  demographics: {
    ageGroup: '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
    gender: 'Female' | 'Male' | 'Non-Binary' | 'Undisclosed';
    country: string;
    language: string;
    profession: string;
    persona: string;
  },
  hashtags: string[],
  mentions: string[] = [],
  channelTitle?: string,
  videoContext?: { videoId: string; videoTitle: string; channelName: string }
): SocialPost {
  const timestamp = new Date(Date.now() - minutesAgo * 60000).toISOString();
  const sentiment = analyzeSentiment(content);

  return {
    id,
    platform,
    author: {
      id: `usr-${handle.replace('@', '')}`,
      name,
      handle,
      avatar,
      verified: followers > 50000,
      followers,
      following: Math.floor(followers / 20) + 120,
      bio,
      location: demographics.country,
      inferredAge: demographics.ageGroup,
      inferredProfession: demographics.profession,
      inferredGender: demographics.gender,
    },
    content,
    timestamp,
    likes: metrics.likes,
    reposts: metrics.reposts,
    commentsCount: metrics.comments,
    shares: metrics.shares,
    sentiment,
    demographics: {
      ...demographics,
      countryCode: demographics.country.slice(0, 3).toUpperCase(),
    },
    hashtags,
    mentions,
    channelTitle,
    videoContext,
  };
}

// ----------------------------------------------------
// SCENARIO 1: Global AI Frontier Model Launch & Regulatory Backlash
// ----------------------------------------------------
const SCENARIO_1_POSTS: SocialPost[] = [
  createPost(
    'p1-1', 'x', 'Dr. Elena Rostova', '@elena_ai', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'Chief AI Scientist @ NovaLabs. Neural architecture & alignment.', 340000,
    'Today we are unveiling Nova-4X! 🚀 It crushes human benchmarks across complex reasoning and multi-modal synthesis. Revolutionary milestone for autonomous agents.',
    720, { likes: 24500, reposts: 7800, comments: 2100, shares: 3200 },
    { ageGroup: '35-44', gender: 'Female', country: 'United States', language: 'English', profession: 'AI Research', persona: 'Tech Evangelist' },
    ['#Nova4X', '#AI', '#DeepLearning', '#AGI'], ['@NovaLabs']
  ),
  createPost(
    'p1-2', 'telegram', 'DeepNet AI Leaks', '@deepnet_leaks', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    'Uncensored model weights, benchmark leaks and zero-day AI weights.', 180000,
    '⚠️ ALERT: Nova-4X model weights and raw training dataset hashes have leaked to private torrents. Sarcasm filters and safety bounds appear disabled in leaked release.',
    660, { likes: 8900, reposts: 3400, comments: 1250, shares: 4100 },
    { ageGroup: '25-34', gender: 'Male', country: 'Germany', language: 'English', profession: 'Security Researcher', persona: 'Security Researcher' },
    ['#ModelLeak', '#Nova4X', '#Torrents'], [], 'DeepNet AI Leaks Broadcast'
  ),
  createPost(
    'p1-3', 'x', 'Marcus Vance', '@marcus_vance_tech', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'Venture Partner @ HorizonScale. Investing in frontier compute.', 195000,
    'If Nova-4X benchmarks hold up, every legacy SaaS workflow is officially obsolete by Q3. The velocity of capability compounding is terrifying and unbelievable.',
    600, { likes: 14200, reposts: 3100, comments: 890, shares: 1400 },
    { ageGroup: '35-44', gender: 'Male', country: 'United States', language: 'English', profession: 'Venture Capital', persona: 'Tech Evangelist' },
    ['#Nova4X', '#SaaS', '#VentureCapital']
  ),
  createPost(
    'p1-4', 'reddit', 'NeuralHacker99', '@u_NeuralHacker99', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'Open source tinkerer, r/MachineLearning moderator.', 42000,
    'Oh great, another "revolutionary" closed model that happens to hallucinate citations on basic calculus. "Working flawlessly" as if we won\'t inspect the benchmarks ourselves.',
    540, { likes: 3200, reposts: 480, comments: 670, shares: 520 },
    { ageGroup: '25-34', gender: 'Male', country: 'United Kingdom', language: 'English', profession: 'Software Engineering', persona: 'Skeptical Consumer' },
    ['#Nova4X', '#Benchmarks', '#Hallucination']
  ),
  createPost(
    'p1-5', 'youtube', 'Kavita Sundaram', '@kavita_tech_reviews', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    'AI Engineer & YouTube Creator. Demystifying neural networks.', 520000,
    'I ran Nova-4X through 100 edge-case coding prompts. It is legitimately a game changer for distributed backend architecture. Video breakdown live now!',
    480, { likes: 31000, reposts: 6400, comments: 2400, shares: 5100 },
    { ageGroup: '25-34', gender: 'Female', country: 'India', language: 'English', profession: 'Developer / Creator', persona: 'Tech Evangelist' },
    ['#Nova4X', '#CodingAI', '#TechReview'], [], undefined,
    { videoId: 'yt-nv4x-review', videoTitle: 'Nova-4X Tested: Game Changer or Hype?', channelName: 'Kavita Tech Labs' }
  ),
  createPost(
    'p1-6', 'x', 'Sen. Jonathan Miller', '@senator_miller', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'Senate Committee on Technology, Privacy and National Security.', 480000,
    'Reports of unverified frontier AI weights leaking into wild torrents without safety compliance pose an unacceptable threat. We are calling emergency oversight hearings.',
    420, { likes: 18900, reposts: 9200, comments: 3900, shares: 4800 },
    { ageGroup: '55+', gender: 'Male', country: 'United States', language: 'English', profession: 'Government & Policy', persona: 'Activist Critic' },
    ['#AIRegulation', '#Nova4X', '#NationalSecurity', '#Safety']
  ),
  createPost(
    'p1-7', 'reddit', 'PrivacyAdvocate_EU', '@u_PrivacyAdvocate_EU', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    'GDPR compliance analyst & digital rights watcher.', 29000,
    'NovaLabs scraped copyrighted research papers and private medical repositories without consent. We fully support the immediate EU antitrust injunction. Lawsuit incoming.',
    360, { likes: 5800, reposts: 1400, comments: 920, shares: 1100 },
    { ageGroup: '35-44', gender: 'Female', country: 'France', language: 'English', profession: 'Legal & Compliance', persona: 'Activist Critic' },
    ['#EU', '#GDPR', '#Copyright', '#Nova4X']
  ),
  createPost(
    'p1-8', 'instagram', 'Chloe Chen', '@chloechen_design', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'Design Lead & generative visual explorer.', 160000,
    'Generated this entire 3D architectural render in 4 seconds using Nova-4X. Mindblown by the lighting fidelity! Pure genius engineering.',
    300, { likes: 45000, reposts: 3200, comments: 1100, shares: 8900 },
    { ageGroup: '18-24', gender: 'Female', country: 'Singapore', language: 'English', profession: 'Creative & Design', persona: 'Brand Advocate' },
    ['#Nova4X', '#GenerativeArt', '#Design', '#3D']
  ),
  createPost(
    'p1-9', 'telegram', 'Crypto & Quant Ops', '@quant_ops', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    'High frequency algorithmic trading & autonomous execution bots.', 95000,
    'Nova-4X latency is down to 42ms on speculative decoding. Integrating into real-time order routing. Massive win for algorithmic execution.',
    240, { likes: 4200, reposts: 890, comments: 340, shares: 1200 },
    { ageGroup: '25-34', gender: 'Male', country: 'United States', language: 'English', profession: 'Finance & Trading', persona: 'Tech Evangelist' },
    ['#Nova4X', '#AlgorithmicTrading', '#FinTech'], [], 'Crypto & Quant Ops'
  ),
  createPost(
    'p1-10', 'facebook', 'Prof. Thomas Sterling', '@prof_t_sterling', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    'Professor of Computational Linguistics & Ethics.', 72000,
    'While the engineering achievements of Nova-4X are admirable, the lack of transparent bias audits is deeply troubling. Academic peers must demand raw evaluation data.',
    180, { likes: 3100, reposts: 980, comments: 450, shares: 760 },
    { ageGroup: '45-54', gender: 'Male', country: 'Canada', language: 'English', profession: 'Academia', persona: 'Skeptical Consumer' },
    ['#Ethics', '#AIBias', '#Nova4X']
  ),
  createPost(
    'p1-11', 'x', 'Yuki Tanaka', '@yuki_tokyo_dev', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    'Fullstack TypeScript & WebGPU engineer in Tokyo.', 88000,
    'Tested Nova-4X with Japanese nuance and slang. Translation is flawless and captures subtle cultural irony without breakdown! Superb achievement.',
    120, { likes: 11200, reposts: 2300, comments: 410, shares: 1900 },
    { ageGroup: '25-34', gender: 'Male', country: 'Japan', language: 'English', profession: 'Software Engineering', persona: 'Brand Advocate' },
    ['#Nova4X', '#WebGPU', '#Tokyo']
  ),
  createPost(
    'p1-12', 'x', 'Sarah Jenkins', '@sarah_cybersec', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    'Threat Intel Director. Dissecting autonomous prompt injection.', 210000,
    'Confirmed: Leaked Nova-4X weights contain severe jailbreak vectors allowing automated phishing campaign generation. Patching firewall heuristics right now. High anxiety.',
    60, { likes: 19400, reposts: 7600, comments: 2800, shares: 6200 },
    { ageGroup: '35-44', gender: 'Female', country: 'United States', language: 'English', profession: 'Cybersecurity', persona: 'Security Researcher' },
    ['#CyberSecurity', '#Nova4X', '#Jailbreak', '#ThreatAlert']
  ),
];

const SCENARIO_1_RAW_NODES = [
  { id: 'n1', label: 'Elena Rostova', handle: '@elena_ai', platform: 'x' as Platform, followers: 340000, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', communityId: 1, communityName: 'Core AI Creators & Lab', dominantSentiment: 'excitement' as EmotionType, sentimentPolarity: 0.82 },
  { id: 'n2', label: 'DeepNet Leaks', handle: '@deepnet_leaks', platform: 'telegram' as Platform, followers: 180000, avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150', communityId: 2, communityName: 'Threat Intel & Hackers', dominantSentiment: 'anxiety' as EmotionType, sentimentPolarity: -0.65 },
  { id: 'n3', label: 'Marcus Vance', handle: '@marcus_vance_tech', platform: 'x' as Platform, followers: 195000, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', communityId: 1, communityName: 'Core AI Creators & Lab', dominantSentiment: 'excitement' as EmotionType, sentimentPolarity: 0.74 },
  { id: 'n4', label: 'NeuralHacker99', handle: '@u_NeuralHacker99', platform: 'reddit' as Platform, followers: 42000, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', communityId: 3, communityName: 'Open-Source & Skeptics', dominantSentiment: 'sarcasm' as EmotionType, sentimentPolarity: -0.48 },
  { id: 'n5', label: 'Kavita Sundaram', handle: '@kavita_tech_reviews', platform: 'youtube' as Platform, followers: 520000, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', communityId: 1, communityName: 'Core AI Creators & Lab', dominantSentiment: 'excitement' as EmotionType, sentimentPolarity: 0.88 },
  { id: 'n6', label: 'Sen. Jonathan Miller', handle: '@senator_miller', platform: 'x' as Platform, followers: 480000, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', communityId: 4, communityName: 'Policy & Regulatory Oversight', dominantSentiment: 'against' as EmotionType, sentimentPolarity: -0.72 },
  { id: 'n7', label: 'PrivacyAdvocate_EU', handle: '@u_PrivacyAdvocate_EU', platform: 'reddit' as Platform, followers: 29000, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', communityId: 4, communityName: 'Policy & Regulatory Oversight', dominantSentiment: 'against' as EmotionType, sentimentPolarity: -0.78 },
  { id: 'n8', label: 'Chloe Chen', handle: '@chloechen_design', platform: 'instagram' as Platform, followers: 160000, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', communityId: 1, communityName: 'Core AI Creators & Lab', dominantSentiment: 'joy' as EmotionType, sentimentPolarity: 0.91 },
  { id: 'n9', label: 'Quant Ops', handle: '@quant_ops', platform: 'telegram' as Platform, followers: 95000, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', communityId: 1, communityName: 'Core AI Creators & Lab', dominantSentiment: 'trust' as EmotionType, sentimentPolarity: 0.62 },
  { id: 'n10', label: 'Prof. Thomas Sterling', handle: '@prof_t_sterling', platform: 'facebook' as Platform, followers: 72000, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', communityId: 3, communityName: 'Open-Source & Skeptics', dominantSentiment: 'anxiety' as EmotionType, sentimentPolarity: -0.35 },
  { id: 'n11', label: 'Yuki Tanaka', handle: '@yuki_tokyo_dev', platform: 'x' as Platform, followers: 88000, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', communityId: 1, communityName: 'Core AI Creators & Lab', dominantSentiment: 'supportive' as EmotionType, sentimentPolarity: 0.79 },
  { id: 'n12', label: 'Sarah Jenkins', handle: '@sarah_cybersec', platform: 'x' as Platform, followers: 210000, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', communityId: 2, communityName: 'Threat Intel & Hackers', dominantSentiment: 'anxiety' as EmotionType, sentimentPolarity: -0.58 },
  { id: 'n13', label: 'Alex Thorne', handle: '@thorne_code', platform: 'x' as Platform, followers: 45000, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', communityId: 3, communityName: 'Open-Source & Skeptics', dominantSentiment: 'sarcasm' as EmotionType, sentimentPolarity: -0.40 },
  { id: 'n14', label: 'TechInquirer', handle: '@tech_inquirer', platform: 'x' as Platform, followers: 640000, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', communityId: 4, communityName: 'Policy & Regulatory Oversight', dominantSentiment: 'neutral' as EmotionType, sentimentPolarity: 0.05 },
  { id: 'n15', label: 'ByteStream Daily', handle: '@bytestream', platform: 'youtube' as Platform, followers: 390000, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', communityId: 1, communityName: 'Core AI Creators & Lab', dominantSentiment: 'excitement' as EmotionType, sentimentPolarity: 0.68 },
];

const SCENARIO_1_RAW_EDGES = [
  { id: 'e1', source: 'n1', target: 'n3', type: 'retweet' as const, weight: 4.5, timestamp: '2026-08-26T02:00:00Z', platform: 'x' as Platform, sentiment: 0.8 },
  { id: 'e2', source: 'n1', target: 'n5', type: 'mention' as const, weight: 3.8, timestamp: '2026-08-26T02:05:00Z', platform: 'x' as Platform, sentiment: 0.9 },
  { id: 'e3', source: 'n2', target: 'n12', type: 'forward' as const, weight: 5.0, timestamp: '2026-08-26T02:15:00Z', platform: 'telegram' as Platform, sentiment: -0.7 },
  { id: 'e4', source: 'n12', target: 'n6', type: 'quote' as const, weight: 4.2, timestamp: '2026-08-26T02:30:00Z', platform: 'x' as Platform, sentiment: -0.6 },
  { id: 'e5', source: 'n6', target: 'n7', type: 'reply' as const, weight: 3.5, timestamp: '2026-08-26T02:45:00Z', platform: 'x' as Platform, sentiment: -0.8 },
  { id: 'e6', source: 'n4', target: 'n13', type: 'reply' as const, weight: 2.9, timestamp: '2026-08-26T03:00:00Z', platform: 'reddit' as Platform, sentiment: -0.5 },
  { id: 'e7', source: 'n13', target: 'n10', type: 'mention' as const, weight: 2.1, timestamp: '2026-08-26T03:10:00Z', platform: 'x' as Platform, sentiment: -0.3 },
  { id: 'e8', source: 'n5', target: 'n15', type: 'mention' as const, weight: 3.9, timestamp: '2026-08-26T03:20:00Z', platform: 'youtube' as Platform, sentiment: 0.7 },
  { id: 'e9', source: 'n3', target: 'n9', type: 'forward' as const, weight: 2.4, timestamp: '2026-08-26T03:30:00Z', platform: 'telegram' as Platform, sentiment: 0.6 },
  { id: 'e10', source: 'n8', target: 'n1', type: 'reply' as const, weight: 3.1, timestamp: '2026-08-26T03:40:00Z', platform: 'instagram' as Platform, sentiment: 0.9 },
  { id: 'e11', source: 'n11', target: 'n1', type: 'quote' as const, weight: 2.8, timestamp: '2026-08-26T03:50:00Z', platform: 'x' as Platform, sentiment: 0.8 },
  { id: 'e12', source: 'n14', target: 'n6', type: 'mention' as const, weight: 4.8, timestamp: '2026-08-26T04:00:00Z', platform: 'x' as Platform, sentiment: 0.0 },
  { id: 'e13', source: 'n14', target: 'n1', type: 'quote' as const, weight: 4.0, timestamp: '2026-08-26T04:10:00Z', platform: 'x' as Platform, sentiment: 0.1 },
  { id: 'e14', source: 'n12', target: 'n4', type: 'reply' as const, weight: 3.2, timestamp: '2026-08-26T04:20:00Z', platform: 'reddit' as Platform, sentiment: -0.4 },
  { id: 'e15', source: 'n7', target: 'n10', type: 'forward' as const, weight: 2.5, timestamp: '2026-08-26T04:30:00Z', platform: 'facebook' as Platform, sentiment: -0.6 },
];

const SCENARIO_1_COMMUNITIES = [
  { id: 1, name: 'Core AI Creators & Venture Labs', color: '#3b82f6', size: 6, percentage: 40.0, topNodes: ['@elena_ai', '@kavita_tech_reviews', '@marcus_vance_tech'], dominantTheme: 'Benchmark Breakthroughs & Compute Scale', sentimentAvg: 0.79, dominantEmotion: 'excitement' as EmotionType },
  { id: 2, name: 'Threat Intel & Security Red-Team', color: '#ef4444', size: 3, percentage: 20.0, topNodes: ['@deepnet_leaks', '@sarah_cybersec'], dominantTheme: 'Jailbreak Vectors & Model Torrent Leaks', sentimentAvg: -0.62, dominantEmotion: 'anxiety' as EmotionType },
  { id: 3, name: 'Open-Source & Skeptical Devs', color: '#f59e0b', size: 3, percentage: 20.0, topNodes: ['@u_NeuralHacker99', '@prof_t_sterling', '@thorne_code'], dominantTheme: 'Benchmark Scrutiny & Hallucination Critiques', sentimentAvg: -0.41, dominantEmotion: 'sarcasm' as EmotionType },
  { id: 4, name: 'Policy & Regulatory Oversight', color: '#8b5cf6', size: 3, percentage: 20.0, topNodes: ['@senator_miller', '@tech_inquirer', '@u_PrivacyAdvocate_EU'], dominantTheme: 'Antitrust Injunctions & Safety Hearings', sentimentAvg: -0.48, dominantEmotion: 'against' as EmotionType },
];

// Helper to assemble full scenario with enriched calculations
export function buildScenario(
  id: string,
  title: string,
  tagline: string,
  category: string,
  description: string,
  posts: SocialPost[],
  rawNodes: any[],
  rawEdges: any[],
  communities: any[]
): IntelligenceScenario {
  const { nodes, edges } = enrichGraphWithMetrics(rawNodes as any, rawEdges as any);
  const cascadeTimeline = simulateInformationCascade(nodes, edges);
  const trends = extractTrendsFromPosts(posts);
  const demographics = computeDemographicProfile(posts);

  const network: NetworkGraph = {
    nodes,
    edges,
    communities,
    cascadeTimeline,
  };

  return {
    id,
    title,
    tagline,
    category,
    description,
    posts,
    trends,
    network,
    demographics,
  };
}

export const SCENARIO_1_AI_LAUNCH = buildScenario(
  'scenario-ai-launch',
  'Global Frontier AI Launch & Safety Backlash',
  'Multi-platform tracking of Nova-4X foundation model release and regulatory fallout',
  'AI & Frontier Tech',
  'Real-time intelligence mapping across X, Telegram, Reddit, YouTube, Instagram, and Facebook following NovaLabs frontier model announcement, subsequent torrent weights leak, and Senate committee response.',
  SCENARIO_1_POSTS,
  SCENARIO_1_RAW_NODES,
  SCENARIO_1_RAW_EDGES,
  SCENARIO_1_COMMUNITIES
);

// ----------------------------------------------------
// SCENARIO 2: Global Cloud Infrastructure Outage & Ransomware Threat
// ----------------------------------------------------
const SCENARIO_2_POSTS: SocialPost[] = [
  createPost(
    'p2-1', 'telegram', 'DarkVortex Intel', '@dark_vortex', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150',
    'Encrypted cyber intelligence & threat actor monitoring.', 145000,
    '🚨 CRITICAL: DarkVortex ransomware group claims compromise of top Tier-1 DNS & Edge Cloud backbone. Demanding 500 BTC or root certificate keys will be dumped publicly.',
    420, { likes: 9800, reposts: 4100, comments: 1800, shares: 3900 },
    { ageGroup: '25-34', gender: 'Male', country: 'Germany', language: 'English', profession: 'Cybersecurity', persona: 'Security Researcher' },
    ['#Ransomware', '#ZeroDay', '#CyberAttack', '#DarkVortex'], [], 'DarkVortex Alert Channel'
  ),
  createPost(
    'p2-2', 'x', 'CloudStatus Ops', '@cloud_status_live', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150',
    'Automated global internet backbone & CDN telemetry.', 410000,
    'Major global outage detected across US-East, EU-Central, and AP-South. Over 45,000 enterprise applications experiencing 504 Gateway Timeouts. Investigating root cause.',
    380, { likes: 32000, reposts: 18400, comments: 4500, shares: 7800 },
    { ageGroup: '35-44', gender: 'Male', country: 'United States', language: 'English', profession: 'Cloud & DevOps', persona: 'Tech Evangelist' },
    ['#CloudOutage', '#AWS', '#Cloudflare', '#DownDetector', '#504Gateway']
  ),
  createPost(
    'p2-3', 'reddit', 'SysadminNightmare', '@u_SysadminNightmare', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'Senior Site Reliability Engineer, r/sysadmin veteran.', 38000,
    'Oh wonderful, on-call pager went off at 3:14 AM. Our entire microservice mesh collapsed because the auth provider DNS vanished. "99.999% SLA" is pure comedy right now.',
    340, { likes: 8400, reposts: 1200, comments: 2100, shares: 950 },
    { ageGroup: '25-34', gender: 'Male', country: 'United Kingdom', language: 'English', profession: 'Cloud & DevOps', persona: 'Skeptical Consumer' },
    ['#Sysadmin', '#CloudOutage', '#OnCall', '#SLA']
  ),
  createPost(
    'p2-4', 'x', 'Mira Patel', '@mira_fintech', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
    'FinTech correspondent & banking infrastructure analyst.', 220000,
    'Payment gateways down across 6 major banking apps. Panicking retail traders locked out of trading accounts during market volatility. Serious regulatory backlash imminent.',
    300, { likes: 17500, reposts: 6900, comments: 3100, shares: 4200 },
    { ageGroup: '25-34', gender: 'Female', country: 'India', language: 'English', profession: 'Finance & Banking', persona: 'Activist Critic' },
    ['#FinTech', '#BankingCrisis', '#CloudOutage', '#Payments']
  ),
  createPost(
    'p2-5', 'youtube', 'CyberSec Explained', '@cybersec_explained', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    'Ex-NSA security researcher explaining high-profile cyber warfare.', 680000,
    'Deep-dive teardown into the BGP hijack routing anomaly that caused today\'s global cloud blackout. Is it nation-state or ransomware? Analysis inside.',
    240, { likes: 41000, reposts: 9200, comments: 3800, shares: 8400 },
    { ageGroup: '35-44', gender: 'Male', country: 'United States', language: 'English', profession: 'Cybersecurity', persona: 'Security Researcher' },
    ['#CyberWarfare', '#BGPHijack', '#Infosec'], [], undefined,
    { videoId: 'yt-bgp-cloud-outage', videoTitle: 'How BGP Routing Took Down Half The Internet', channelName: 'CyberSec Explained' }
  ),
  createPost(
    'p2-6', 'x', 'CISA Cyber Alerts', '@cisa_official_feed', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'Official emergency cybersecurity advisory notices.', 890000,
    'ADVISORY: Organizations must immediately rotate API tokens and verify DNSSEC signatures. Federal incident response teams are coordinating mitigation with cloud providers.',
    180, { likes: 28400, reposts: 14200, comments: 2400, shares: 9100 },
    { ageGroup: '45-54', gender: 'Undisclosed', country: 'United States', language: 'English', profession: 'Government & Policy', persona: 'Security Researcher' },
    ['#CISA', '#CyberAdvisory', '#IncidentResponse', '#DNSSEC']
  ),
  createPost(
    'p2-7', 'x', 'Liam O\'Connor', '@liam_devops_guru', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'Principal SRE & multi-cloud disaster recovery architect.', 115000,
    'Our automated multi-region failover to bare-metal clusters succeeded in 38 seconds with zero data loss. Solid engineering and disaster drills saved us millions today.',
    120, { likes: 16800, reposts: 3900, comments: 840, shares: 2100 },
    { ageGroup: '35-44', gender: 'Male', country: 'Australia', language: 'English', profession: 'Cloud & DevOps', persona: 'Tech Evangelist' },
    ['#DevOps', '#SRE', '#MultiCloud', '#Resilience', '#DisasterRecovery']
  ),
  createPost(
    'p2-8', 'facebook', 'Enterprise IT Leaders', '@enterprise_it_forum', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    'Executive community for CIOs, CISOs and IT Directors.', 98000,
    'Today\'s systemic outage proves that single-cloud concentration risk is the #1 vulnerability facing modern corporations. Boardrooms will mandate multi-vendor architecture.',
    60, { likes: 5400, reposts: 1800, comments: 670, shares: 1400 },
    { ageGroup: '45-54', gender: 'Male', country: 'Canada', language: 'English', profession: 'Executive / Leadership', persona: 'Activist Critic' },
    ['#CIO', '#CISO', '#ConcentrationRisk', '#CloudStrategy']
  ),
];

const SCENARIO_2_RAW_NODES = [
  { id: 'c1', label: 'DarkVortex Intel', handle: '@dark_vortex', platform: 'telegram' as Platform, followers: 145000, avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150', communityId: 1, communityName: 'Threat Actors & Leakers', dominantSentiment: 'anger' as EmotionType, sentimentPolarity: -0.85 },
  { id: 'c2', label: 'CloudStatus Live', handle: '@cloud_status_live', platform: 'x' as Platform, followers: 410000, avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150', communityId: 2, communityName: 'Telemetry & Ops Status', dominantSentiment: 'anxiety' as EmotionType, sentimentPolarity: -0.45 },
  { id: 'c3', label: 'SysadminNightmare', handle: '@u_SysadminNightmare', platform: 'reddit' as Platform, followers: 38000, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', communityId: 3, communityName: 'Engineers & SRE Ground Zero', dominantSentiment: 'sarcasm' as EmotionType, sentimentPolarity: -0.60 },
  { id: 'c4', label: 'Mira Patel', handle: '@mira_fintech', platform: 'x' as Platform, followers: 220000, avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150', communityId: 4, communityName: 'FinTech & Market Impact', dominantSentiment: 'anxiety' as EmotionType, sentimentPolarity: -0.70 },
  { id: 'c5', label: 'CyberSec Explained', handle: '@cybersec_explained', platform: 'youtube' as Platform, followers: 680000, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', communityId: 1, communityName: 'Threat Actors & Leakers', dominantSentiment: 'fear' as EmotionType, sentimentPolarity: -0.50 },
  { id: 'c6', label: 'CISA Cyber Alerts', handle: '@cisa_official_feed', platform: 'x' as Platform, followers: 890000, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', communityId: 2, communityName: 'Telemetry & Ops Status', dominantSentiment: 'trust' as EmotionType, sentimentPolarity: 0.30 },
  { id: 'c7', label: 'Liam O\'Connor', handle: '@liam_devops_guru', platform: 'x' as Platform, followers: 115000, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', communityId: 3, communityName: 'Engineers & SRE Ground Zero', dominantSentiment: 'supportive' as EmotionType, sentimentPolarity: 0.85 },
  { id: 'c8', label: 'Enterprise IT Forum', handle: '@enterprise_it_forum', platform: 'facebook' as Platform, followers: 98000, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', communityId: 4, communityName: 'FinTech & Market Impact', dominantSentiment: 'against' as EmotionType, sentimentPolarity: -0.40 },
];

const SCENARIO_2_RAW_EDGES = [
  { id: 'ce1', source: 'c1', target: 'c2', type: 'forward' as const, weight: 5.0, timestamp: '2026-08-26T01:00:00Z', platform: 'telegram' as Platform, sentiment: -0.8 },
  { id: 'ce2', source: 'c2', target: 'c3', type: 'quote' as const, weight: 4.5, timestamp: '2026-08-26T01:15:00Z', platform: 'x' as Platform, sentiment: -0.6 },
  { id: 'ce3', source: 'c2', target: 'c4', type: 'retweet' as const, weight: 4.2, timestamp: '2026-08-26T01:30:00Z', platform: 'x' as Platform, sentiment: -0.7 },
  { id: 'ce4', source: 'c1', target: 'c5', type: 'mention' as const, weight: 3.8, timestamp: '2026-08-26T01:45:00Z', platform: 'youtube' as Platform, sentiment: -0.5 },
  { id: 'ce5', source: 'c6', target: 'c2', type: 'reply' as const, weight: 4.9, timestamp: '2026-08-26T02:00:00Z', platform: 'x' as Platform, sentiment: 0.2 },
  { id: 'ce6', source: 'c3', target: 'c7', type: 'reply' as const, weight: 3.4, timestamp: '2026-08-26T02:15:00Z', platform: 'x' as Platform, sentiment: 0.4 },
  { id: 'ce7', source: 'c4', target: 'c8', type: 'forward' as const, weight: 2.9, timestamp: '2026-08-26T02:30:00Z', platform: 'facebook' as Platform, sentiment: -0.4 },
];

const SCENARIO_2_COMMUNITIES = [
  { id: 1, name: 'Threat Actors & Leakers', color: '#ef4444', size: 2, percentage: 25.0, topNodes: ['@dark_vortex', '@cybersec_explained'], dominantTheme: 'Ransomware Extortion & Exploit Proofs', sentimentAvg: -0.68, dominantEmotion: 'anger' as EmotionType },
  { id: 2, name: 'Telemetry & Ops Status', color: '#3b82f6', size: 2, percentage: 25.0, topNodes: ['@cloud_status_live', '@cisa_official_feed'], dominantTheme: 'Outage Tracking & Federal Advisories', sentimentAvg: -0.15, dominantEmotion: 'anxiety' as EmotionType },
  { id: 3, name: 'Engineers & SRE Ground Zero', color: '#f59e0b', size: 2, percentage: 25.0, topNodes: ['@u_SysadminNightmare', '@liam_devops_guru'], dominantTheme: 'On-Call War Rooms & Disaster Recovery', sentimentAvg: 0.12, dominantEmotion: 'sarcasm' as EmotionType },
  { id: 4, name: 'FinTech & Market Impact', color: '#8b5cf6', size: 2, percentage: 25.0, topNodes: ['@mira_fintech', '@enterprise_it_forum'], dominantTheme: 'Banking Blackouts & CIO Strategy', sentimentAvg: -0.55, dominantEmotion: 'against' as EmotionType },
];

export const SCENARIO_2_CYBER_OUTAGE = buildScenario(
  'scenario-cyber-outage',
  'Global Cloud Outage & Darknet Ransomware Crisis',
  'Threat intelligence & multi-platform incident response monitoring across Telegram, X, Reddit, and YouTube',
  'Cybersecurity & Infrastructure',
  'Full situational awareness tracking of a simulated Tier-1 DNS blackout, DarkVortex extortion leak, SRE disaster recovery chatter, and financial market fallout.',
  SCENARIO_2_POSTS,
  SCENARIO_2_RAW_NODES,
  SCENARIO_2_RAW_EDGES,
  SCENARIO_2_COMMUNITIES
);

// ----------------------------------------------------
// SCENARIO 3: Consumer Eco-Tech Brand Viral Launch & Influencer Cascade
// ----------------------------------------------------
const SCENARIO_3_POSTS: SocialPost[] = [
  createPost(
    'p3-1', 'instagram', 'Aria Montgomery', '@aria_lifestyle_green', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'Eco-lifestyle creator & clean tech enthusiast.', 490000,
    'Unboxing the brand new Solara One solar-charging smartwatch! ☀️🌱 100% ocean plastic chassis and 30-day battery life. I am totally obsessed! Incredible design.',
    360, { likes: 58000, reposts: 4200, comments: 1900, shares: 9400 },
    { ageGroup: '18-24', gender: 'Female', country: 'United States', language: 'English', profession: 'Creative & Design', persona: 'Brand Advocate' },
    ['#SolaraOne', '#CleanTech', '#EcoFashion', '#SolarWatch']
  ),
  createPost(
    'p3-2', 'youtube', 'Teardown Lab', '@teardown_lab', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'Hardware teardowns, battery chemistry, repairability scores.', 780000,
    'Solara One Teardown: Does it actually charge from the sun? We measured solar cell efficiency and found only 0.4W yield in direct sunlight. Mostly marketing hype.',
    300, { likes: 38000, reposts: 8400, comments: 3200, shares: 6100 },
    { ageGroup: '25-34', gender: 'Male', country: 'Germany', language: 'English', profession: 'Hardware Engineering', persona: 'Skeptical Consumer' },
    ['#SolaraOne', '#HardwareTeardown', '#Greenwashing', '#TechReview'], [], undefined,
    { videoId: 'yt-solara-teardown', videoTitle: 'Solara One Solar Watch: Genius or Scam?', channelName: 'Teardown Lab' }
  ),
  createPost(
    'p3-3', 'x', 'GreenConsumer Watch', '@green_watch_org', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    'Investigating corporate sustainability claims and ESG transparency.', 165000,
    'Solara claims "ocean plastic" but supply chain audits reveal less than 8% recycled polymer content. Greenwashing at its finest. Consumers deserve full transparency.',
    240, { likes: 14200, reposts: 6100, comments: 1400, shares: 3800 },
    { ageGroup: '35-44', gender: 'Female', country: 'United Kingdom', language: 'English', profession: 'Environmental Science', persona: 'Activist Critic' },
    ['#Greenwashing', '#SolaraOne', '#Sustainability', '#ConsumerRights']
  ),
  createPost(
    'p3-4', 'x', 'David Kim', '@davidkim_tech', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    'Consumer electronics reviewer and wearable enthusiast.', 210000,
    'Regardless of the solar gimmick, the display brightness and sleep tracking sensors on Solara One are legitimately top tier for $199. Great value for daily fitness.',
    180, { likes: 19800, reposts: 3400, comments: 850, shares: 2200 },
    { ageGroup: '25-34', gender: 'Male', country: 'South Korea', language: 'English', profession: 'Product Reviewer', persona: 'Tech Evangelist' },
    ['#SolaraOne', '#Smartwatch', '#FitnessTracker']
  ),
];

const SCENARIO_3_RAW_NODES = [
  { id: 's1', label: 'Aria Montgomery', handle: '@aria_lifestyle_green', platform: 'instagram' as Platform, followers: 490000, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', communityId: 1, communityName: 'Lifestyle & Eco Influencers', dominantSentiment: 'excitement' as EmotionType, sentimentPolarity: 0.92 },
  { id: 's2', label: 'Teardown Lab', handle: '@teardown_lab', platform: 'youtube' as Platform, followers: 780000, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', communityId: 2, communityName: 'Hardware Engineers & Lab', dominantSentiment: 'sarcasm' as EmotionType, sentimentPolarity: -0.45 },
  { id: 's3', label: 'GreenConsumer Watch', handle: '@green_watch_org', platform: 'x' as Platform, followers: 165000, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', communityId: 3, communityName: 'ESG & Activist Watchdogs', dominantSentiment: 'against' as EmotionType, sentimentPolarity: -0.75 },
  { id: 's4', label: 'David Kim', handle: '@davidkim_tech', platform: 'x' as Platform, followers: 210000, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', communityId: 1, communityName: 'Lifestyle & Eco Influencers', dominantSentiment: 'supportive' as EmotionType, sentimentPolarity: 0.78 },
];

const SCENARIO_3_RAW_EDGES = [
  { id: 'se1', source: 's1', target: 's2', type: 'mention' as const, weight: 3.5, timestamp: '2026-08-26T03:00:00Z', platform: 'instagram' as Platform, sentiment: 0.8 },
  { id: 'se2', source: 's2', target: 's3', type: 'quote' as const, weight: 4.8, timestamp: '2026-08-26T03:30:00Z', platform: 'youtube' as Platform, sentiment: -0.6 },
  { id: 'se3', source: 's3', target: 's4', type: 'reply' as const, weight: 3.2, timestamp: '2026-08-26T04:00:00Z', platform: 'x' as Platform, sentiment: -0.4 },
  { id: 'se4', source: 's4', target: 's1', type: 'retweet' as const, weight: 4.1, timestamp: '2026-08-26T04:30:00Z', platform: 'x' as Platform, sentiment: 0.7 },
];

const SCENARIO_3_COMMUNITIES = [
  { id: 1, name: 'Lifestyle & Eco Influencers', color: '#10b981', size: 2, percentage: 50.0, topNodes: ['@aria_lifestyle_green', '@davidkim_tech'], dominantTheme: 'Clean Aesthetics & Wearable Daily Fitness', sentimentAvg: 0.85, dominantEmotion: 'joy' as EmotionType },
  { id: 2, name: 'Hardware Engineers & Lab', color: '#f59e0b', size: 1, percentage: 25.0, topNodes: ['@teardown_lab'], dominantTheme: 'Solar Cell Efficiency & Teardowns', sentimentAvg: -0.45, dominantEmotion: 'sarcasm' as EmotionType },
  { id: 3, name: 'ESG & Activist Watchdogs', color: '#ef4444', size: 1, percentage: 25.0, topNodes: ['@green_watch_org'], dominantTheme: 'Greenwashing Audits & Supply Chain Integrity', sentimentAvg: -0.75, dominantEmotion: 'against' as EmotionType },
];

export const SCENARIO_3_ECO_TECH = buildScenario(
  'scenario-eco-tech',
  'Consumer Eco-Tech Viral Campaign & Greenwashing Debate',
  'Multi-platform virality tracking across Instagram, YouTube, and X',
  'Consumer Tech & Sustainability',
  'Audience sentiment and influence cascade tracking of the Solara One smartwatch launch, influencer hype, teardown lab skepticism, and supply chain controversy.',
  SCENARIO_3_POSTS,
  SCENARIO_3_RAW_NODES,
  SCENARIO_3_RAW_EDGES,
  SCENARIO_3_COMMUNITIES
);

export const ALL_SCENARIOS: IntelligenceScenario[] = [
  SCENARIO_1_AI_LAUNCH,
  SCENARIO_2_CYBER_OUTAGE,
  SCENARIO_3_ECO_TECH,
];
