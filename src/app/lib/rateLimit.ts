import { Redis } from 'ioredis';
import { NextRequest } from 'next/server';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export function rateLimit(limit: number, window: number) {
  return async (request: NextRequest): Promise<RateLimitResult> => {
    // Get client IP from headers or use a fallback
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'anonymous';
    
    const now = Date.now();
    const windowStart = now - window * 1000;
    const key = `ratelimit:${ip}`;
    
    try {
      // Clean old requests
      await redis.zremrangebyscore(key, 0, windowStart);
      
      // Count requests in current window
      const requestCount = await redis.zcard(key);
      
      if (requestCount >= limit) {
        // Get the oldest request timestamp
        const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = parseInt(oldestRequest[1]) + window * 1000;
        
        return {
          success: false,
          remaining: 0,
          reset: resetTime
        };
      }
      
      // Add new request
      await redis.zadd(key, now.toString(), now.toString());
      // Set expiry on the key
      await redis.expire(key, window);
      
      return {
        success: true,
        remaining: limit - requestCount - 1,
        reset: now + window * 1000
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If Redis fails, allow the request
      return {
        success: true,
        remaining: 1,
        reset: now + window * 1000
      };
    }
  };
} 