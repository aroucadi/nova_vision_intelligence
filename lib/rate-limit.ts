/**
 * Simple In-Memory Rate Limiter (Token Bucket)
 * Best practice for preventing abuse in serverless functions without Redis.
 * Note: State resets on Lambda cold start, but effective for high-velocity spam.
 */

type RatelimitConfig = {
    interval: number; // Window size in ms
    uniqueTokenPerInterval: number; // Max users to track per window
};

type RateLimiterLike = {
    check(limit: number, token: string): Promise<boolean>;
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

class DynamoRateLimiter implements RateLimiterLike {
    constructor(private readonly tableName: string, private readonly intervalMs: number) { }

    async check(limit: number, token: string): Promise<boolean> {
        const windowId = Math.floor(Date.now() / this.intervalMs);
        const ttl = Math.floor(Date.now() / 1000) + Math.ceil(this.intervalMs / 1000) + 30;

        const { dynamoDb } = await import("@/lib/aws/dynamo");
        const { UpdateCommand } = await import("@aws-sdk/lib-dynamodb");

        try {
            await dynamoDb.send(new UpdateCommand({
                TableName: this.tableName,
                Key: { pk: `RATE#${token}#${windowId}`, sk: "STATE" },
                UpdateExpression: "SET #c = if_not_exists(#c, :zero) + :one, #ttl = :ttl",
                ConditionExpression: "attribute_not_exists(#c) OR #c < :limit",
                ExpressionAttributeNames: { "#c": "count", "#ttl": "ttl" },
                ExpressionAttributeValues: { ":zero": 0, ":one": 1, ":limit": limit, ":ttl": ttl },
            }));
            return true;
        } catch (err: any) {
            if (err?.name === "ConditionalCheckFailedException") return false;
            console.warn("[RateLimiter] Dynamo limiter error:", err?.message || err);
            return true;
        }
    }
}

const defaultConfig = {
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
};

export const rateLimiter: RateLimiterLike = process.env.NOVA_GLOBAL_STATE_TABLE
    ? new DynamoRateLimiter(process.env.NOVA_GLOBAL_STATE_TABLE, defaultConfig.interval)
    : new RateLimiter(defaultConfig);
