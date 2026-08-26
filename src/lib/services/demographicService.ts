import { SocialPost, DemographicProfile, EmotionType } from '../types';

/**
 * Computes aggregate demographic profiling from social posts
 */
export function computeDemographicProfile(posts: SocialPost[]): DemographicProfile {
  const total = Math.max(posts.length, 1);

  // Age distributions
  const ageCounts: Record<string, number> = {
    '13-17': 0,
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-54': 0,
    '55+': 0,
  };

  // Gender distributions
  const genderCounts: Record<string, number> = {
    'Female': 0,
    'Male': 0,
    'Non-Binary': 0,
    'Undisclosed': 0,
  };

  // Geo distributions
  const geoCounts: Record<string, {
    country: string;
    countryCode: string;
    count: number;
    lat: number;
    lng: number;
    sentiments: number[];
    emotions: Record<EmotionType, number>;
  }> = {};

  // Language distributions
  const langCounts: Record<string, { language: string; code: string; count: number }> = {};

  // Profession categories
  const profCounts: Record<string, { count: number; keywords: Set<string> }> = {};

  // Persona counts
  const personaCounts: Record<string, { count: number; sentiments: number[]; emotions: Record<EmotionType, number>; bios: string[] }> = {};

  // Coordinates map for countries
  const GEO_COORDS: Record<string, { lat: number; lng: number; code: string }> = {
    'United States': { lat: 37.0902, lng: -95.7129, code: 'USA' },
    'United Kingdom': { lat: 55.3781, lng: -3.4360, code: 'GBR' },
    'Germany': { lat: 51.1657, lng: 10.4515, code: 'DEU' },
    'India': { lat: 20.5937, lng: 78.9629, code: 'IND' },
    'Japan': { lat: 36.2048, lng: 138.2529, code: 'JPN' },
    'Canada': { lat: 56.1304, lng: -106.3468, code: 'CAN' },
    'France': { lat: 46.2276, lng: 2.2137, code: 'FRA' },
    'Australia': { lat: -25.2744, lng: 133.7751, code: 'AUS' },
    'Brazil': { lat: -14.2350, lng: -51.9253, code: 'BRA' },
    'Singapore': { lat: 1.3521, lng: 103.8198, code: 'SGP' },
  };

  for (const post of posts) {
    const demo = post.demographics;
    if (demo) {
      if (ageCounts[demo.ageGroup] !== undefined) ageCounts[demo.ageGroup]++;
      if (genderCounts[demo.gender] !== undefined) genderCounts[demo.gender]++;

      const country = demo.country || 'United States';
      const coords = GEO_COORDS[country] || { lat: 20, lng: 0, code: 'INTL' };
      if (!geoCounts[country]) {
        geoCounts[country] = {
          country,
          countryCode: coords.code,
          count: 0,
          lat: coords.lat,
          lng: coords.lng,
          sentiments: [],
          emotions: {
            sarcasm: 0, anxiety: 0, excitement: 0, supportive: 0, against: 0,
            anger: 0, joy: 0, fear: 0, confusion: 0, trust: 0, neutral: 0
          }
        };
      }
      geoCounts[country].count++;
      geoCounts[country].sentiments.push(post.sentiment.polarity);
      geoCounts[country].emotions[post.sentiment.dominantEmotion] = (geoCounts[country].emotions[post.sentiment.dominantEmotion] || 0) + 1;

      const lang = demo.language || 'English';
      const code = lang.slice(0, 2).toLowerCase();
      if (!langCounts[lang]) langCounts[lang] = { language: lang, code, count: 0 };
      langCounts[lang].count++;

      const prof = demo.profession || 'Technology';
      if (!profCounts[prof]) profCounts[prof] = { count: 0, keywords: new Set() };
      profCounts[prof].count++;
      profCounts[prof].keywords.add(post.hashtags[0] || prof.toLowerCase());

      const persona = demo.persona || 'Tech Enthusiast';
      if (!personaCounts[persona]) {
        personaCounts[persona] = { count: 0, sentiments: [], emotions: {
          sarcasm: 0, anxiety: 0, excitement: 0, supportive: 0, against: 0,
          anger: 0, joy: 0, fear: 0, confusion: 0, trust: 0, neutral: 0
        }, bios: [] };
      }
      personaCounts[persona].count++;
      personaCounts[persona].sentiments.push(post.sentiment.polarity);
      personaCounts[persona].emotions[post.sentiment.dominantEmotion] = (personaCounts[persona].emotions[post.sentiment.dominantEmotion] || 0) + 1;
      if (post.author.bio && personaCounts[persona].bios.length < 3) {
        personaCounts[persona].bios.push(post.author.bio);
      }
    }
  }

  const ageDistribution = Object.entries(ageCounts).map(([range, count]) => ({
    range: range as any,
    count,
    percentage: Number(((count / total) * 100).toFixed(1)),
  }));

  const genderDistribution = Object.entries(genderCounts).map(([gender, count]) => ({
    gender,
    count,
    percentage: Number(((count / total) * 100).toFixed(1)),
  }));

  const geographicDistribution = Object.values(geoCounts).map((g) => {
    const avgSent = g.sentiments.length > 0
      ? Number((g.sentiments.reduce((a, b) => a + b, 0) / g.sentiments.length).toFixed(2))
      : 0;

    let dominantEmotion: EmotionType = 'neutral';
    let maxE = -1;
    for (const [e, c] of Object.entries(g.emotions)) {
      if (c > maxE) {
        maxE = c;
        dominantEmotion = e as EmotionType;
      }
    }

    return {
      country: g.country,
      countryCode: g.countryCode,
      count: g.count,
      percentage: Number(((g.count / total) * 100).toFixed(1)),
      lat: g.lat,
      lng: g.lng,
      sentimentScore: avgSent,
      dominantEmotion,
    };
  }).sort((a, b) => b.count - a.count);

  const languageDistribution = Object.values(langCounts).map((l) => ({
    language: l.language,
    code: l.code,
    count: l.count,
    percentage: Number(((l.count / total) * 100).toFixed(1)),
  })).sort((a, b) => b.count - a.count);

  const professionalInterests = Object.entries(profCounts).map(([cat, data]) => ({
    category: cat,
    count: data.count,
    percentage: Number(((data.count / total) * 100).toFixed(1)),
    topKeywords: Array.from(data.keywords).slice(0, 4),
  })).sort((a, b) => b.count - a.count);

  const personaClusters = Object.entries(personaCounts).map(([name, data], idx) => {
    const avgSent = data.sentiments.length > 0
      ? Number((data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length).toFixed(2))
      : 0;

    const topEmotions = Object.entries(data.emotions)
      .map(([e, c]) => ({ emotion: e as EmotionType, count: c }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .map(x => x.emotion);

    const descriptions: Record<string, string> = {
      'Tech Evangelist': 'Early adopters eager for new AI models and technical innovations.',
      'Skeptical Consumer': 'Cost and privacy conscious consumers questioning enterprise claims.',
      'Brand Advocate': 'Loyal followers sharing endorsements and positive product reviews.',
      'Security Researcher': 'White-hat analysts and infosec practitioners dissecting vulnerabilities.',
      'General Public': 'Casual social media users discussing mainstream breaking news.',
      'Activist Critic': 'Focused on policy, antitrust regulations, and ethical implications.',
    };

    return {
      id: `persona-${idx + 1}`,
      name,
      tagline: `Represents ${((data.count / total) * 100).toFixed(0)}% of conversational volume`,
      description: descriptions[name] || 'Engaged demographic segment discussing current events.',
      sizePercentage: Number(((data.count / total) * 100).toFixed(1)),
      topEmotions: topEmotions.length > 0 ? topEmotions : ['neutral' as EmotionType],
      sentimentPolarity: avgSent,
      sampleBios: data.bios.length > 0 ? data.bios : ['Digital native & technology enthusiast.'],
      dominantPlatforms: ['x', 'reddit', 'telegram'] as any,
    };
  }).sort((a, b) => b.sizePercentage - a.sizePercentage);

  return {
    totalAudienceSampled: total * 250, // scaled representative audience sample
    ageDistribution,
    genderDistribution,
    geographicDistribution,
    languageDistribution,
    professionalInterests,
    personaClusters,
  };
}
