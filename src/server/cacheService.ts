// Enterprise In-Memory Cache Engine for PBDA System
// Supports TTL, Tag-based Invalidation, and Cache Analytics

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;

  constructor() {
    // Garbage collection for expired keys every 60 seconds
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Get item from cache
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Set item in cache with TTL (milliseconds) and optional invalidation tags
   */
  public set<T>(key: string, value: T, ttlMs: number = 60000, tags: string[] = []): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      tags
    });
  }

  /**
   * Invalidate specific key
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching given tags
   */
  public invalidateTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache analytics
   */
  public getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 100;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatePercentage: Math.round(hitRate * 100) / 100
    };
  }
}

export const appCache = new CacheService();
