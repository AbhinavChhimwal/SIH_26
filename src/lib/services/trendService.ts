import { SocialPost, TrendTopic, TrendStatus, NarrativeStage, EmotionType } from '../types';

/**
 * Extracts and scores trending keywords, hashtags, and narrative shifts from social posts
 */
export function extractTrendsFromPosts(posts: SocialPost[]): TrendTopic[] {
  if (posts.length === 0) return [];

  // Group posts chronologically into 4 quarters to compute velocity & acceleration
  const sorted = [...posts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const quarterSize = Math.max(1, Math.floor(sorted.length / 4));
  
  const q1 = sorted.slice(0, quarterSize);
  const q2 = sorted.slice(quarterSize, quarterSize * 2);
  const q3 = sorted.slice(quarterSize * 2, quarterSize * 3);
  const q4 = sorted.slice(quarterSize * 3);

  const termCounts: Record<string, {
    totalVolume: number;
    q1Count: number;
    q2Count: number;
    q3Count: number;
    q4Count: number;
    sentiments: number[];
    emotions: Record<EmotionType, number>;
    posts: SocialPost[];
    coOccur: Record<string, number>;
    isHashtag: boolean;
  }> = {};

  const STOP_WORDS = new Set([
    'the', 'and', 'a', 'to', 'of', 'in', 'is', 'for', 'that', 'this', 'with', 'on',
    'it', 'are', 'as', 'at', 'be', 'by', 'an', 'have', 'from', 'or', 'you', 'we',
    'they', 'but', 'not', 'what', 'all', 'were', 'when', 'there', 'can', 'has', 'if'
  ]);

  function processQuarter(quarterPosts: SocialPost[], qIndex: 1 | 2 | 3 | 4) {
    for (const post of quarterPosts) {
      const tokens = post.content.toLowerCase().split(/[\s,.;:!?()"']+/);
      const hashtags = post.hashtags.map(h => h.toLowerCase());
      
      const distinctTerms = new Set<string>();

      for (const ht of hashtags) {
        const clean = ht.startsWith('#') ? ht : `#${ht}`;
        if (clean.length > 2) distinctTerms.add(clean);
      }

      for (const t of tokens) {
        if (t.length > 3 && !STOP_WORDS.has(t) && !t.startsWith('http') && !t.startsWith('@')) {
          distinctTerms.add(t);
        }
      }

      const termsList = Array.from(distinctTerms);

      for (const term of termsList) {
        if (!termCounts[term]) {
          termCounts[term] = {
            totalVolume: 0,
            q1Count: 0,
            q2Count: 0,
            q3Count: 0,
            q4Count: 0,
            sentiments: [],
            emotions: {
              sarcasm: 0, anxiety: 0, excitement: 0, supportive: 0, against: 0,
              anger: 0, joy: 0, fear: 0, confusion: 0, trust: 0, neutral: 0
            },
            posts: [],
            coOccur: {},
            isHashtag: term.startsWith('#'),
          };
        }

        termCounts[term].totalVolume++;
        if (qIndex === 1) termCounts[term].q1Count++;
        if (qIndex === 2) termCounts[term].q2Count++;
        if (qIndex === 3) termCounts[term].q3Count++;
        if (qIndex === 4) termCounts[term].q4Count++;

        termCounts[term].sentiments.push(post.sentiment.polarity);
        termCounts[term].emotions[post.sentiment.dominantEmotion] = (termCounts[term].emotions[post.sentiment.dominantEmotion] || 0) + 1;
        
        if (termCounts[term].posts.length < 5) {
          termCounts[term].posts.push(post);
        }

        // Track co-occurrences
        for (const other of termsList) {
          if (other !== term && other.length > 3) {
            termCounts[term].coOccur[other] = (termCounts[term].coOccur[other] || 0) + 1;
          }
        }
      }
    }
  }

  processQuarter(q1, 1);
  processQuarter(q2, 2);
  processQuarter(q3, 3);
  processQuarter(q4, 4);

  // Filter terms with significant presence
  const sortedTerms = Object.entries(termCounts)
    .filter(([_, data]) => data.totalVolume >= 2)
    .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
    .slice(0, 15);

  return sortedTerms.map(([term, data], index) => {
    // Velocity: % growth from early (q1+q2) to late (q3+q4)
    const early = data.q1Count + data.q2Count;
    const late = data.q3Count + data.q4Count;
    const velocity = early > 0 ? Number((((late - early) / early) * 100).toFixed(1)) : 100;

    // Acceleration: rate of change between (q2-q1) and (q4-q3)
    const delta1 = data.q2Count - data.q1Count;
    const delta2 = data.q4Count - data.q3Count;
    const acceleration = Number((delta2 - delta1).toFixed(1));

    // Determine status
    let status: TrendStatus = 'stabilizing';
    if (velocity > 60 && acceleration > 0) {
      status = 'emerging';
    } else if (data.q4Count >= data.q3Count && data.q4Count > 4) {
      status = 'peaking';
    } else if (velocity < -20) {
      status = 'declining';
    }

    // Virality score 0 - 100
    const volumeScore = Math.min(40, (data.totalVolume / Math.max(posts.length * 0.1, 1)) * 40);
    const velocityScore = Math.min(40, Math.max(0, (velocity + 50) / 150 * 40));
    const spreadScore = Math.min(20, Object.keys(data.coOccur).length * 2);
    const viralityScore = Math.min(99, Math.max(25, Math.round(volumeScore + velocityScore + spreadScore)));

    // Sentiment
    const avgSentiment = data.sentiments.length > 0 
      ? Number((data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length).toFixed(2)) 
      : 0;

    // Dominant emotion
    let dominantEmotion: EmotionType = 'neutral';
    let maxEmotionVal = -1;
    for (const [em, count] of Object.entries(data.emotions)) {
      if (count > maxEmotionVal) {
        maxEmotionVal = count;
        dominantEmotion = em as EmotionType;
      }
    }

    const topEmotions = Object.entries(data.emotions)
      .map(([em, count]) => ({ emotion: em as EmotionType, weight: Number((count / Math.max(data.totalVolume, 1)).toFixed(2)) }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    // Top co-occurring
    const coOccurringKeywords = Object.entries(data.coOccur)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w);

    // Top KOL associated
    const topAuthor = data.posts.sort((a, b) => b.author.followers - a.author.followers)[0]?.author.handle || '@influencer';

    // Narrative Stage
    let narrativeStage: NarrativeStage = 'Amplification';
    if (status === 'emerging') narrativeStage = 'Origin';
    else if (status === 'peaking') narrativeStage = 'Peak Controversy';
    else if (status === 'declining') narrativeStage = 'Resolution';

    // Mock timeline series
    const timelineData = [
      { timestamp: 'T-6h', volume: data.q1Count * 12, sentiment: avgSentiment - 0.1, sarcasm: 0.1, anxiety: 0.2 },
      { timestamp: 'T-4h', volume: data.q2Count * 18, sentiment: avgSentiment - 0.05, sarcasm: 0.2, anxiety: 0.35 },
      { timestamp: 'T-2h', volume: data.q3Count * 28, sentiment: avgSentiment, sarcasm: 0.25, anxiety: 0.4 },
      { timestamp: 'Live', volume: data.q4Count * 35, sentiment: avgSentiment + 0.1, sarcasm: 0.15, anxiety: 0.2 },
    ];

    return {
      id: `trend-${index + 1}`,
      keyword: term.startsWith('#') ? term.slice(1) : term,
      hashtag: term.startsWith('#') ? term : `#${term}`,
      category: term.startsWith('#') ? 'Hashtag' : 'Keyword / Topic',
      volume: data.totalVolume * 45, // scaled for realistic audience metrics
      velocity,
      acceleration,
      status,
      viralityScore,
      sentimentScore: avgSentiment,
      dominantEmotion,
      topEmotions,
      timelineData,
      coOccurringKeywords,
      narrativeStage,
      keyOpinionLeader: topAuthor,
      samplePosts: data.posts.map(p => p.content),
    };
  });
}
