export interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number;
  enabled?: boolean;
}

export interface RateLimitInfo {
  remaining: number;
  resetIn: number;
  allowed: boolean;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, number[]>;
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      enabled: true,
      ...config
    };
    this.requests = new Map();
  }

  public static getInstance(config?: RateLimitConfig): RateLimiter {
    if (!RateLimiter.instance) {
      if (!config) {
        throw new Error('RateLimiter must be initialized with config');
      }
      RateLimiter.instance = new RateLimiter(config);
    }
    return RateLimiter.instance;
  }

  public checkRateLimit(agentId: string): RateLimitInfo {
    if (!this.config.enabled) {
      return { remaining: Infinity, resetIn: 0, allowed: true };
    }

    const now = Date.now();
    const windowStart = now - this.config.timeWindow;

    // Get or initialize request timestamps for this agent
    let timestamps = this.requests.get(agentId) || [];
    
    // Remove old timestamps
    timestamps = timestamps.filter(time => time > windowStart);
    
    // Check if rate limit is exceeded
    const remaining = this.config.maxRequests - timestamps.length;
    const allowed = remaining > 0;

    if (allowed) {
      // Add new timestamp if allowed
      timestamps.push(now);
      this.requests.set(agentId, timestamps);
    }

    // Calculate time until oldest request expires
    const resetIn = timestamps.length > 0 
      ? timestamps[0] + this.config.timeWindow - now 
      : 0;

    return {
      remaining,
      resetIn,
      allowed
    };
  }

  public getRateLimitInfo(agentId: string): RateLimitInfo {
    return this.checkRateLimit(agentId);
  }

  public clearRateLimits(): void {
    this.requests.clear();
  }
}
