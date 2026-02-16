/**
 * Simple In-Memory Rate Limiter (Token Bucket)
 * Best practice for preventing abuse in serverless functions without Redis.
 * Note: State resets on Lambda cold start, but effective for high-velocity spam.
 */

type RatelimitConfig = {
    interval: number; // Window size in ms
    uniqueTokenPerInterval: number; // Max users to track per window
};

export class RateLimiter {
    private tokens: Map<string, number[]>;
    private config: RatelimitConfig;

    constructor(config: RatelimitConfig) {
        this.tokens = new Map();
        this.config = config;
    }

    check(limit: number, token: string): Promise<boolean> {
        return new Promise((resolve) => {
            const now = Date.now();
            const windowStart = now - this.config.interval;

            const tokenTimestamps = this.tokens.get(token) || [];
            const timestampCount = tokenTimestamps.filter((timestamp) => timestamp > windowStart);

            const currentUsage = timestampCount.length;
            const isRateLimited = currentUsage >= limit;

            if (!isRateLimited) {
                timestampCount.push(now);
                this.tokens.set(token, timestampCount);
                resolve(true); // Allowed
            } else {
                resolve(false); // Limited
            }

            // Cleanup (Prune old tokens to prevent memory leaks)
            if (this.tokens.size > this.config.uniqueTokenPerInterval) {
                // Naive eviction: clear mostly everything
                this.tokens.clear();
                this.tokens.set(token, timestampCount);
            }
        });
    }
}

// Singleton instance (Global within the Lambda/Container)
export const rateLimiter = new RateLimiter({
    interval: 60 * 1000, // 1 Minute
    uniqueTokenPerInterval: 500,
});
