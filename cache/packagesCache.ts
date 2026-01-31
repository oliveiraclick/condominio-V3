/**
 * Simple in-memory cache for packages data
 * 
 * Features:
 * - Automatic expiration (2 minutes default)
 * - Type-safe
 * - Zero dependencies
 * - Fallback to server if cache fails
 * 
 * Usage:
 * const cached = packagesCache.get('pending');
 * if (cached && !cached.isExpired()) {
 *   setPackages(cached.data);
 * } else {
 *   fetchFromServer();
 * }
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class PackagesCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL = 2 * 60 * 1000; // 2 minutes

    /**
     * Store data in cache
     */
    set<T>(key: string, data: T, ttl?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL
        });
    }

    /**
     * Get data from cache
     * Returns null if not found or expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Check if cache entry is expired
     */
    private isExpired(entry: CacheEntry<any>): boolean {
        return Date.now() - entry.timestamp > entry.ttl;
    }

    /**
     * Invalidate specific cache key
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidate all cache
     */
    invalidateAll(): void {
        this.cache.clear();
    }

    /**
     * Update cached data without refetching
     * Useful for optimistic UI updates
     */
    update<T>(key: string, updater: (data: T) => T): void {
        const entry = this.cache.get(key);
        if (entry && !this.isExpired(entry)) {
            entry.data = updater(entry.data);
            entry.timestamp = Date.now(); // Reset timestamp
        }
    }

    /**
     * Get cache stats (for debugging)
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Singleton instance
export const packagesCache = new PackagesCache();

// Helper: Cache keys (centralized)
export const CACHE_KEYS = {
    PENDING_PACKAGES: 'packages:pending',
    RESIDENT_PACKAGES: (residentId: string) => `packages:resident:${residentId}`,
    ALL_PACKAGES: 'packages:all',
    RESIDENTS: 'residents:all',
} as const;
