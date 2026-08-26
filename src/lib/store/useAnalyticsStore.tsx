'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  IntelligenceScenario,
  SocialPost,
  TrendTopic,
  NetworkGraph,
  DemographicProfile,
  Platform,
  EmotionType,
  UserRole,
  FilterState,
  IngestionState,
} from '../types';
import { ALL_SCENARIOS, buildScenario } from '../mock-data/scenarios';
import { INITIAL_PLATFORM_CONNECTORS, generateNextLiveStreamPost } from '../services/ingestionService';
import { extractTrendsFromPosts } from '../services/trendService';
import { computeDemographicProfile } from '../services/demographicService';

interface AnalyticsContextType {
  activeScenario: IntelligenceScenario;
  activeScenarioId: string;
  allScenarios: IntelligenceScenario[];
  setScenarioId: (id: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  togglePlatformFilter: (p: Platform) => void;
  toggleEmotionFilter: (e: EmotionType) => void;
  resetFilters: () => void;
  filteredPosts: SocialPost[];
  filteredTrends: TrendTopic[];
  filteredNetwork: NetworkGraph;
  filteredDemographics: DemographicProfile;
  ingestionState: IngestionState;
  toggleStreaming: () => void;
  setStreamSpeedMultiplier: (speed: number) => void;
  cascadeStep: number;
  setCascadeStep: (step: number) => void;
  isCascadePlaying: boolean;
  setIsCascadePlaying: (playing: boolean) => void;
  uploadCustomScenario: (title: string, posts: SocialPost[]) => void;
  systemAlerts: Array<{ id: string; title: string; message: string; severity: 'info' | 'warning' | 'critical'; timestamp: string }>;
  dismissAlert: (id: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  selectedPlatforms: ['x', 'telegram', 'instagram', 'facebook', 'reddit', 'youtube'],
  timeRange: 'all',
  selectedEmotions: [],
  searchQuery: '',
  selectedCountry: null,
  selectedCommunity: null,
  minInfluence: 0,
  onlyKOLs: false,
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [scenariosList, setScenariosList] = useState<IntelligenceScenario[]>(ALL_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(ALL_SCENARIOS[0].id);
  const [userRole, setUserRole] = useState<UserRole>('analyst');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Ingestion State
  const [ingestionState, setIngestionState] = useState<IngestionState>({
    isStreaming: true,
    streamSpeedMultiplier: 1,
    totalIngestedCount: 456800,
    bufferSize: 120,
    throughputPerSecond: 18.5,
    connectors: INITIAL_PLATFORM_CONNECTORS,
    recentStream: [],
  });

  // Cascade Simulation State
  const [cascadeStep, setCascadeStep] = useState<number>(0);
  const [isCascadePlaying, setIsCascadePlaying] = useState<boolean>(false);

  // Alerts
  const [systemAlerts, setSystemAlerts] = useState<Array<{ id: string; title: string; message: string; severity: 'info' | 'warning' | 'critical'; timestamp: string }>>([
    {
      id: 'alt-1',
      title: 'Nuanced Emotion Spike: Anxiety Surge',
      message: 'Anxiety indicators surged 42% across Telegram & X in the last 45 minutes.',
      severity: 'warning',
      timestamp: '2 mins ago',
    },
    {
      id: 'alt-2',
      title: 'High-Influence Node Activated',
      message: 'Key Opinion Leader @elena_ai published a high-centrality broadcast.',
      severity: 'info',
      timestamp: '14 mins ago',
    }
  ]);

  const activeScenario = useMemo(() => {
    return scenariosList.find(s => s.id === activeScenarioId) || scenariosList[0];
  }, [scenariosList, activeScenarioId]);

  // Live Stream Simulation Loop
  useEffect(() => {
    if (!ingestionState.isStreaming) return;

    const intervalMs = Math.max(1200, Math.floor(4000 / ingestionState.streamSpeedMultiplier));
    const timer = setInterval(() => {
      const newPost = generateNextLiveStreamPost();
      
      setIngestionState(prev => {
        const updatedConnectors = { ...prev.connectors };
        if (updatedConnectors[newPost.platform]) {
          updatedConnectors[newPost.platform].totalIngested += 1;
          updatedConnectors[newPost.platform].lastSync = 'Just now';
        }
        return {
          ...prev,
          totalIngestedCount: prev.totalIngestedCount + 1,
          throughputPerSecond: Number((15 + Math.random() * 8 * prev.streamSpeedMultiplier).toFixed(1)),
          connectors: updatedConnectors,
          recentStream: [newPost, ...prev.recentStream.slice(0, 19)],
        };
      });

      // Optionally inject into active scenario
      setScenariosList(prev => prev.map(sc => {
        if (sc.id === activeScenarioId) {
          const updatedPosts = [newPost, ...sc.posts];
          return {
            ...sc,
            posts: updatedPosts,
            trends: extractTrendsFromPosts(updatedPosts),
            demographics: computeDemographicProfile(updatedPosts),
          };
        }
        return sc;
      }));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [ingestionState.isStreaming, ingestionState.streamSpeedMultiplier, activeScenarioId]);

  // Cascade Timeline Auto-play Loop
  useEffect(() => {
    if (!isCascadePlaying) return;

    const timer = setInterval(() => {
      setCascadeStep(prev => {
        const maxStep = (activeScenario.network.cascadeTimeline?.length || 6) - 1;
        if (prev >= maxStep) {
          setIsCascadePlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isCascadePlaying, activeScenario]);

  // Filtered dataset calculations
  const filteredPosts = useMemo(() => {
    return activeScenario.posts.filter(post => {
      // Platform filter
      if (filters.selectedPlatforms.length > 0 && !filters.selectedPlatforms.includes(post.platform)) {
        return false;
      }
      // Emotion filter
      if (filters.selectedEmotions.length > 0 && !filters.selectedEmotions.includes(post.sentiment.dominantEmotion)) {
        return false;
      }
      // Search query
      if (filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase();
        const matchesContent = post.content.toLowerCase().includes(q);
        const matchesAuthor = post.author.name.toLowerCase().includes(q) || post.author.handle.toLowerCase().includes(q);
        const matchesTag = post.hashtags.some(h => h.toLowerCase().includes(q));
        if (!matchesContent && !matchesAuthor && !matchesTag) return false;
      }
      // Country filter
      if (filters.selectedCountry && post.demographics.country !== filters.selectedCountry) {
        return false;
      }
      return true;
    });
  }, [activeScenario.posts, filters]);

  const filteredTrends = useMemo(() => {
    return activeScenario.trends.filter(trend => {
      if (filters.selectedEmotions.length > 0 && !filters.selectedEmotions.includes(trend.dominantEmotion)) {
        return false;
      }
      if (filters.searchQuery.trim().length > 0) {
        const q = filters.searchQuery.toLowerCase();
        if (!trend.keyword.toLowerCase().includes(q) && !trend.hashtag.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [activeScenario.trends, filters]);

  const filteredNetwork = useMemo(() => {
    let nodes = [...activeScenario.network.nodes];
    let edges = [...activeScenario.network.edges];

    if (filters.selectedPlatforms.length > 0) {
      nodes = nodes.filter(n => filters.selectedPlatforms.includes(n.platform));
    }
    if (filters.selectedCommunity !== null) {
      nodes = nodes.filter(n => n.communityId === filters.selectedCommunity);
    }
    if (filters.minInfluence > 0) {
      nodes = nodes.filter(n => n.influenceScore >= filters.minInfluence);
    }
    if (filters.onlyKOLs) {
      nodes = nodes.filter(n => n.role === 'KOL' || n.role === 'Bridge');
    }
    if (filters.selectedEmotions.length > 0) {
      nodes = nodes.filter(n => filters.selectedEmotions.includes(n.dominantSentiment));
    }

    const nodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    return {
      ...activeScenario.network,
      nodes,
      edges,
    };
  }, [activeScenario.network, filters]);

  const filteredDemographics = useMemo(() => {
    return computeDemographicProfile(filteredPosts.length > 0 ? filteredPosts : activeScenario.posts);
  }, [filteredPosts, activeScenario.posts]);

  // Helper actions
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const togglePlatformFilter = (platform: Platform) => {
    setFilters(prev => {
      const exists = prev.selectedPlatforms.includes(platform);
      const updated = exists 
        ? prev.selectedPlatforms.filter(p => p !== platform)
        : [...prev.selectedPlatforms, platform];
      return { ...prev, selectedPlatforms: updated.length === 0 ? [platform] : updated };
    });
  };

  const toggleEmotionFilter = (emotion: EmotionType) => {
    setFilters(prev => {
      const exists = prev.selectedEmotions.includes(emotion);
      const updated = exists
        ? prev.selectedEmotions.filter(e => e !== emotion)
        : [...prev.selectedEmotions, emotion];
      return { ...prev, selectedEmotions: updated };
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const toggleStreaming = () => {
    setIngestionState(prev => ({ ...prev, isStreaming: !prev.isStreaming }));
  };

  const setStreamSpeedMultiplier = (speed: number) => {
    setIngestionState(prev => ({ ...prev, streamSpeedMultiplier: speed }));
  };

  const uploadCustomScenario = (title: string, posts: SocialPost[]) => {
    const rawNodes = posts.slice(0, 12).map((p, idx) => ({
      id: `un-${idx}`,
      label: p.author.name,
      handle: p.author.handle,
      platform: p.platform,
      followers: p.author.followers,
      avatar: p.author.avatar,
      communityId: (idx % 3) + 1,
      communityName: `Cluster ${(idx % 3) + 1}`,
      dominantSentiment: p.sentiment.dominantEmotion,
      sentimentPolarity: p.sentiment.polarity,
    }));

    const rawEdges: any[] = [];
    for (let i = 0; i < rawNodes.length - 1; i++) {
      rawEdges.push({
        id: `ue-${i}`,
        source: rawNodes[i].id,
        target: rawNodes[i + 1].id,
        type: 'retweet',
        weight: 3.5,
        timestamp: new Date().toISOString(),
        platform: rawNodes[i].platform,
        sentiment: 0.5,
      });
      if (i > 1 && i % 2 === 0) {
        rawEdges.push({
          id: `ue-cross-${i}`,
          source: rawNodes[0].id,
          target: rawNodes[i].id,
          type: 'mention',
          weight: 4.0,
          timestamp: new Date().toISOString(),
          platform: 'x',
          sentiment: -0.2,
        });
      }
    }

    const communities = [
      { id: 1, name: 'Primary Cluster A', color: '#3b82f6', size: Math.ceil(rawNodes.length / 3), percentage: 33.3, topNodes: [rawNodes[0]?.handle || '@user1'], dominantTheme: 'Community Discussion', sentimentAvg: 0.4, dominantEmotion: 'excitement' as EmotionType },
      { id: 2, name: 'Discussion Cluster B', color: '#f59e0b', size: Math.floor(rawNodes.length / 3), percentage: 33.3, topNodes: [rawNodes[1]?.handle || '@user2'], dominantTheme: 'Technical Review', sentimentAvg: -0.1, dominantEmotion: 'sarcasm' as EmotionType },
      { id: 3, name: 'Audience Cluster C', color: '#10b981', size: Math.floor(rawNodes.length / 3), percentage: 33.4, topNodes: [rawNodes[2]?.handle || '@user3'], dominantTheme: 'General Reaction', sentimentAvg: 0.2, dominantEmotion: 'supportive' as EmotionType },
    ];

    const newScenario = buildScenario(
      `scenario-custom-${Date.now()}`,
      title,
      `Custom dataset analyzed with ${posts.length} imported posts`,
      'Uploaded Dataset',
      'AI intelligence and network analysis pipeline derived from uploaded dataset.',
      posts,
      rawNodes,
      rawEdges,
      communities
    );

    setScenariosList(prev => [newScenario, ...prev]);
    setActiveScenarioId(newScenario.id);
  };

  const dismissAlert = (id: string) => {
    setSystemAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AnalyticsContext.Provider
      value={{
        activeScenario,
        activeScenarioId,
        allScenarios: scenariosList,
        setScenarioId: setActiveScenarioId,
        userRole,
        setUserRole,
        filters,
        setFilters,
        updateFilter,
        togglePlatformFilter,
        toggleEmotionFilter,
        resetFilters,
        filteredPosts,
        filteredTrends,
        filteredNetwork,
        filteredDemographics,
        ingestionState,
        toggleStreaming,
        setStreamSpeedMultiplier,
        cascadeStep,
        setCascadeStep,
        isCascadePlaying,
        setIsCascadePlaying,
        uploadCustomScenario,
        systemAlerts,
        dismissAlert,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
