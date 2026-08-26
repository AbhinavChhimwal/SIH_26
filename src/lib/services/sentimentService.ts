import { EmotionType, SentimentAnalysis, SentimentLabel, TriggerToken, SocialPost } from '../types';

// Emotion vocabulary and heuristic weights
const EMOTION_LEXICON: Record<EmotionType, string[]> = {
  sarcasm: [
    'oh great', 'love when', 'what a surprise', 'groundbreaking', 'pure genius',
    'revolutionary for sure', 'as if', 'totally working', 'best feature ever',
    'nothing could go wrong', 'brilliant move', 'so convenient', 'thanks for nothing',
    'masterpiece', 'working flawlessly', 'so helpful', 'what could go wrong'
  ],
  anxiety: [
    'worried', 'panicking', 'scared', 'risk', 'danger', 'breach', 'exposed',
    'leak', 'vulnerable', 'threat', 'collapse', 'what if', 'doomed', 'unsafe',
    'crisis', 'fallout', 'emergency', 'terrified', 'critical failure', 'unstable'
  ],
  excitement: [
    'revolutionary', 'game changer', 'incredible', 'amazing', 'blown away', 'hyped',
    'huge milestone', 'breakthrough', 'future is here', 'insane', 'phenomenal',
    'let\'s go', 'legendary', 'unbelievable', 'next level', 'stunning', 'magnificent'
  ],
  supportive: [
    'agree', 'kudos', 'well deserved', 'fully support', 'backing', 'proud',
    'solid work', 'champion', 'congratulations', 'good job', 'respect', 'stand with',
    'appreciate', 'vital contribution', 'endorsed', 'vital step'
  ],
  against: [
    'boycott', 'scam', 'unacceptable', 'disaster', 'lawsuit', 'resign', 'oppose',
    'shameless', 'terrible', 'atrocious', 'fraud', 'hypocrisy', 'dumpster fire',
    'ruined', 'worst ever', 'cancelling', 'predatory', 'corrupt'
  ],
  anger: [
    'furious', 'rage', 'outrageous', 'infuriating', 'disgusting', 'pissed',
    'ridiculous', 'hate', 'mad', 'angry', 'garbage', 'criminal', 'despise'
  ],
  joy: [
    'happy', 'delighted', 'pleased', 'thrilled', 'celebrating', 'cheerful',
    'glad', 'wonderful', 'smile', 'blessed', 'fantastic', 'joyful'
  ],
  fear: [
    'terrifying', 'dread', 'nightmare', 'horror', 'frightened', 'alarmed',
    'creepy', 'chilling', 'destructive', 'severe risk'
  ],
  confusion: [
    'confused', 'unclear', 'baffled', 'how does this even', 'makes no sense',
    'puzzled', 'mystified', 'questionable', 'contradictory', 'what happened'
  ],
  trust: [
    'verified', 'proven', 'reliable', 'transparent', 'credible', 'integrity',
    'certified', 'legitimate', 'dependable', 'honest', 'accurate'
  ],
  neutral: [
    'announced', 'released', 'scheduled', 'update', 'stated', 'noted',
    'according to', 'version', 'reported', 'data shows', 'meeting', 'overview'
  ]
};

const POSITIVE_WORDS = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'fantastic',
  'superb', 'positive', 'win', 'success', 'benefit', 'effective', 'flawless', 'profound'
];

const NEGATIVE_WORDS = [
  'bad', 'terrible', 'worst', 'horrible', 'fail', 'failure', 'poor', 'awful',
  'broken', 'ugly', 'flaw', 'harm', 'loss', 'damage', 'crash', 'bug', 'glitch'
];

export function analyzeSentiment(text: string): SentimentAnalysis {
  const normalizedText = text.toLowerCase();
  const tokens = normalizedText.split(/[\s,.-;:!?"'()\[\]{}]+/);
  
  const emotionScores: Record<EmotionType, number> = {
    sarcasm: 0,
    anxiety: 0,
    excitement: 0,
    supportive: 0,
    against: 0,
    anger: 0,
    joy: 0,
    fear: 0,
    confusion: 0,
    trust: 0,
    neutral: 0.1, // baseline
  };

  const triggerTokens: TriggerToken[] = [];

  // Check phrase and token matches
  for (const [emotionKey, phrases] of Object.entries(EMOTION_LEXICON)) {
    const emotion = emotionKey as EmotionType;
    for (const phrase of phrases) {
      if (normalizedText.includes(phrase)) {
        emotionScores[emotion] += 0.35;
        triggerTokens.push({
          token: phrase,
          emotion: emotion,
          weight: 0.8
        });
      }
    }
  }

  // Check sarcasm linguistic heuristics
  const hasExclamationQuestion = normalizedText.includes('!?') || normalizedText.includes('?!');
  const hasQuotes = /"[^"]*"/.test(text) || /'[^']*'/.test(text);
  const hasContradiction = (normalizedText.includes('love') || normalizedText.includes('great')) && 
    (normalizedText.includes('broken') || normalizedText.includes('crash') || normalizedText.includes('fail') || normalizedText.includes('bug'));

  if (hasContradiction) {
    emotionScores.sarcasm += 0.65;
    triggerTokens.push({ token: 'sentiment contrast', emotion: 'sarcasm', weight: 0.9 });
  }
  if (hasExclamationQuestion) {
    emotionScores.confusion += 0.25;
    emotionScores.anxiety += 0.15;
  }
  if (hasQuotes && (emotionScores.against > 0 || emotionScores.sarcasm > 0)) {
    emotionScores.sarcasm += 0.3;
  }

  // Token level word counts for polarity
  let positiveScore = 0;
  let negativeScore = 0;

  for (const token of tokens) {
    if (POSITIVE_WORDS.includes(token)) {
      positiveScore += 0.2;
      triggerTokens.push({ token, emotion: 'joy', weight: 0.5 });
    }
    if (NEGATIVE_WORDS.includes(token)) {
      negativeScore += 0.2;
      triggerTokens.push({ token, emotion: 'anger', weight: 0.5 });
    }
  }

  // Calculate polarity
  let rawPolarity = positiveScore - negativeScore + (emotionScores.joy * 0.4) + (emotionScores.excitement * 0.4) + (emotionScores.supportive * 0.3)
    - (emotionScores.anger * 0.5) - (emotionScores.anxiety * 0.4) - (emotionScores.against * 0.5) - (emotionScores.fear * 0.4);

  // If heavy sarcasm, flip positive tone to negative
  if (emotionScores.sarcasm > 0.4) {
    rawPolarity = -Math.abs(rawPolarity || 0.4) - 0.2;
  }

  const polarity = Math.max(-1.0, Math.min(1.0, Number(rawPolarity.toFixed(2))));

  let label: SentimentLabel = 'neutral';
  if (polarity > 0.15) label = 'positive';
  else if (polarity < -0.15) label = 'negative';

  // Normalize emotion scores to [0, 1]
  const totalEmotionWeight = Object.values(emotionScores).reduce((a, b) => a + b, 0) || 1;
  const normalizedEmotions: Record<EmotionType, number> = {} as Record<EmotionType, number>;
  
  let dominantEmotion: EmotionType = 'neutral';
  let maxScore = -1;

  for (const [key, val] of Object.entries(emotionScores)) {
    const emotion = key as EmotionType;
    const norm = Number(Math.min(1.0, val / Math.max(1, totalEmotionWeight * 0.6)).toFixed(2));
    normalizedEmotions[emotion] = norm;
    if (norm > maxScore && emotion !== 'neutral') {
      maxScore = norm;
      dominantEmotion = emotion;
    }
  }

  if (maxScore < 0.2) {
    dominantEmotion = 'neutral';
  }

  const confidence = Math.min(99, Math.max(55, Math.round((Math.abs(polarity) * 40) + (maxScore * 50) + 15)));
  const subjectivity = Number(Math.min(1.0, Math.max(0.1, (Math.abs(polarity) * 0.6) + (emotionScores.sarcasm * 0.3) + 0.2)).toFixed(2));

  return {
    polarity,
    label,
    confidence,
    subjectivity,
    emotions: normalizedEmotions,
    dominantEmotion,
    sarcasmScore: normalizedEmotions.sarcasm,
    anxietyScore: normalizedEmotions.anxiety,
    supportiveScore: normalizedEmotions.supportive,
    againstScore: normalizedEmotions.against,
    triggerTokens: triggerTokens.slice(0, 5),
  };
}

export function computeTimelineFluctuation(posts: SocialPost[], bucketSizeHours: number = 2) {
  // Group posts into chronological buckets
  const sorted = [...posts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  if (sorted.length === 0) return [];

  const startTime = new Date(sorted[0].timestamp).getTime();
  const bucketMs = bucketSizeHours * 3600 * 1000;

  const buckets: Record<number, SocialPost[]> = {};
  for (const post of sorted) {
    const postTime = new Date(post.timestamp).getTime();
    const bucketIndex = Math.floor((postTime - startTime) / bucketMs);
    if (!buckets[bucketIndex]) buckets[bucketIndex] = [];
    buckets[bucketIndex].push(post);
  }

  return Object.entries(buckets).map(([indexStr, bucketPosts]) => {
    const index = Number(indexStr);
    const bucketTimestamp = new Date(startTime + (index * bucketMs)).toISOString();
    
    const count = bucketPosts.length;
    const avgPolarity = bucketPosts.reduce((acc, p) => acc + p.sentiment.polarity, 0) / count;
    const avgSarcasm = bucketPosts.reduce((acc, p) => acc + p.sentiment.sarcasmScore, 0) / count;
    const avgAnxiety = bucketPosts.reduce((acc, p) => acc + p.sentiment.anxietyScore, 0) / count;
    const avgExcitement = bucketPosts.reduce((acc, p) => acc + p.sentiment.emotions.excitement, 0) / count;
    const avgHostility = bucketPosts.reduce((acc, p) => acc + p.sentiment.againstScore, 0) / count;
    const avgJoy = bucketPosts.reduce((acc, p) => acc + p.sentiment.emotions.joy, 0) / count;

    return {
      timestamp: bucketTimestamp,
      timeLabel: new Date(bucketTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      volume: count,
      polarity: Number(avgPolarity.toFixed(2)),
      sarcasm: Number(avgSarcasm.toFixed(2)),
      anxiety: Number(avgAnxiety.toFixed(2)),
      excitement: Number(avgExcitement.toFixed(2)),
      hostility: Number(avgHostility.toFixed(2)),
      joy: Number(avgJoy.toFixed(2)),
    };
  });
}
