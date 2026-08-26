import { Platform } from '../types';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface PlatformRateLimitConfig {
  platform: Platform;
  name: string;
  tier: 'Enterprise Tier 3' | 'Bot Stream Tier 1' | 'OAuth 2.0 High Volume' | 'Standard Developer';
  capacity: number; // Max burst tokens
  currentTokens: number;
  refillRatePerSecond: number; // Tokens added per sec
  dailyQuotaLimit: number;
  dailyQuotaConsumed: number;
  circuitState: CircuitBreakerState;
  failureThreshold: number;
  consecutiveFailures: number;
  lastFailureTime: number;
  cooldownPeriodMs: number;
  lastRefillTime: number;
  costPerRequest: number; // e.g. YouTube quota units = 1-50 units/req
}

export class EnterpriseRateLimiter {
  private platforms: Record<Platform, PlatformRateLimitConfig>;

  constructor() {
    const now = Date.now();
    this.platforms = {
      x: {
        platform: 'x',
        name: 'X (Twitter) Enterprise Filtered Stream',
        tier: 'Enterprise Tier 3',
        capacity: 100, // burst
        currentTokens: 85,
        refillRatePerSecond: 25, // 25 req/sec steady
        dailyQuotaLimit: 2500000,
        dailyQuotaConsumed: 842100,
        circuitState: 'CLOSED',
        failureThreshold: 5,
        consecutiveFailures: 0,
        lastFailureTime: 0,
        cooldownPeriodMs: 15000,
        lastRefillTime: now,
        costPerRequest: 1,
      },
      telegram: {
        platform: 'telegram',
        name: 'Telegram MTProto & Bot Broadcast API',
        tier: 'Bot Stream Tier 1',
        capacity: 60,
        currentTokens: 52,
        refillRatePerSecond: 30, // 30 req/sec limit
        dailyQuotaLimit: 1500000,
        dailyQuotaConsumed: 412000,
        circuitState: 'CLOSED',
        failureThreshold: 4,
        consecutiveFailures: 0,
        lastFailureTime: 0,
        cooldownPeriodMs: 10000,
        lastRefillTime: now,
        costPerRequest: 1,
      },
      instagram: {
        platform: 'instagram',
        name: 'Instagram Graph API',
        tier: 'OAuth 2.0 High Volume',
        capacity: 40,
        currentTokens: 30,
        refillRatePerSecond: 10,
        dailyQuotaLimit: 500000,
        dailyQuotaConsumed: 184500,
        circuitState: 'CLOSED',
        failureThreshold: 3,
        consecutiveFailures: 0,
        lastFailureTime: 0,
        cooldownPeriodMs: 12000,
        lastRefillTime: now,
        costPerRequest: 2,
      },
      facebook: {
        platform: 'facebook',
        name: 'Facebook Public Pages API',
        tier: 'OAuth 2.0 High Volume',
        capacity: 40,
        currentTokens: 34,
        refillRatePerSecond: 8,
        dailyQuotaLimit: 400000,
        dailyQuotaConsumed: 112000,
        circuitState: 'CLOSED',
        failureThreshold: 3,
        consecutiveFailures: 0,
        lastFailureTime: 0,
        cooldownPeriodMs: 12000,
        lastRefillTime: now,
        costPerRequest: 2,
      },
      reddit: {
        platform: 'reddit',
        name: 'Reddit Streaming OAuth API',
        tier: 'Standard Developer',
        capacity: 50,
        currentTokens: 42,
        refillRatePerSecond: 15,
        dailyQuotaLimit: 800000,
        dailyQuotaConsumed: 295400,
        circuitState: 'CLOSED',
        failureThreshold: 4,
        consecutiveFailures: 0,
        lastFailureTime: 0,
        cooldownPeriodMs: 10000,
        lastRefillTime: now,
        costPerRequest: 1,
      },
      youtube: {
        platform: 'youtube',
        name: 'YouTube Data API v3 (Comments)',
        tier: 'Standard Developer',
        capacity: 200, // in quota units
        currentTokens: 180,
        refillRatePerSecond: 20,
        dailyQuotaLimit: 1000000, // 1M quota units
        dailyQuotaConsumed: 324100,
        circuitState: 'CLOSED',
        failureThreshold: 3,
        consecutiveFailures: 0,
        lastFailureTime: 0,
        cooldownPeriodMs: 20000,
        lastRefillTime: now,
        costPerRequest: 5, // 5 units per comment thread fetch
      },
    };
  }

  private refillTokens(config: PlatformRateLimitConfig) {
    const now = Date.now();
    const elapsedSec = (now - config.lastRefillTime) / 1000;
    if (elapsedSec > 0) {
      const addedTokens = elapsedSec * config.refillRatePerSecond;
      config.currentTokens = Math.min(config.capacity, Number((config.currentTokens + addedTokens).toFixed(2)));
      config.lastRefillTime = now;
    }

    // Check circuit breaker cooldown
    if (config.circuitState === 'OPEN') {
      if (now - config.lastFailureTime > config.cooldownPeriodMs) {
        config.circuitState = 'HALF_OPEN';
      }
    }
  }

  public getAllConfigs(): Record<Platform, PlatformRateLimitConfig> {
    Object.values(this.platforms).forEach((p) => this.refillTokens(p));
    return { ...this.platforms };
  }

  public tryConsume(
    platform: Platform,
    count: number = 1
  ): {
    allowed: boolean;
    remaining: number;
    limit: number;
    resetSeconds: number;
    circuitState: CircuitBreakerState;
    reason?: string;
  } {
    const config = this.platforms[platform];
    if (!config) {
      return { allowed: false, remaining: 0, limit: 0, resetSeconds: 0, circuitState: 'OPEN', reason: 'Unknown platform' };
    }

    this.refillTokens(config);

    if (config.circuitState === 'OPEN') {
      const retryInSec = Math.ceil((config.cooldownPeriodMs - (Date.now() - config.lastFailureTime)) / 1000);
      return {
        allowed: false,
        remaining: 0,
        limit: config.capacity,
        resetSeconds: Math.max(1, retryInSec),
        circuitState: 'OPEN',
        reason: 'Circuit Breaker OPEN due to upstream rate-limiting.',
      };
    }

    const neededTokens = count * config.costPerRequest;

    if (config.currentTokens >= neededTokens) {
      config.currentTokens = Number((config.currentTokens - neededTokens).toFixed(2));
      config.dailyQuotaConsumed += neededTokens;

      if (config.circuitState === 'HALF_OPEN') {
        config.circuitState = 'CLOSED';
        config.consecutiveFailures = 0;
      }

      return {
        allowed: true,
        remaining: Math.floor(config.currentTokens),
        limit: config.capacity,
        resetSeconds: Math.ceil((config.capacity - config.currentTokens) / config.refillRatePerSecond),
        circuitState: config.circuitState,
      };
    } else {
      // Rate limited
      config.consecutiveFailures++;
      config.lastFailureTime = Date.now();

      if (config.consecutiveFailures >= config.failureThreshold) {
        config.circuitState = 'OPEN';
      }

      return {
        allowed: false,
        remaining: Math.floor(config.currentTokens),
        limit: config.capacity,
        resetSeconds: Math.ceil((neededTokens - config.currentTokens) / config.refillRatePerSecond),
        circuitState: config.circuitState,
        reason: 'Token bucket capacity exhausted (429 Too Many Requests).',
      };
    }
  }

  public simulateBurst(platform: Platform, burstCount: number) {
    const config = this.platforms[platform];
    if (!config) return;
    config.currentTokens = Math.max(0, config.currentTokens - burstCount * config.costPerRequest);
    config.dailyQuotaConsumed += burstCount * config.costPerRequest;
    if (config.currentTokens <= 0) {
      config.consecutiveFailures = config.failureThreshold;
      config.circuitState = 'OPEN';
      config.lastFailureTime = Date.now();
    }
  }

  public resetPlatform(platform: Platform) {
    const config = this.platforms[platform];
    if (!config) return;
    config.currentTokens = config.capacity;
    config.circuitState = 'CLOSED';
    config.consecutiveFailures = 0;
    config.lastRefillTime = Date.now();
  }
}

export const globalRateLimiter = new EnterpriseRateLimiter();
