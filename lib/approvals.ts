import { Redis } from '@upstash/redis';

// Prefer Upstash REST/KV env vars; fall back to REDIS_* if provided
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || process.env.REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || process.env.REDIS_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn('Redis environment variables not set. Redis functionality will be disabled.');
}

const redis = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

if (redis) {
  const envSource = process.env.UPSTASH_REDIS_REST_URL ? 'UPSTASH_REDIS_REST_URL' : (process.env.KV_REST_API_URL ? 'KV_REST_API_URL' : (process.env.REDIS_URL ? 'REDIS_URL' : 'unknown'));
  console.log(`Redis client initialized (REST) using ${envSource}.`);
}

// In-memory fallback storage for when Redis is not available
const memoryStorage = new Map<string, boolean>();

// Check if a review is approved
export async function isApproved(reviewId: string) {
  try {
    if (redis) {
      const value = await redis.get(`approval:${reviewId}`);
      return value != null; // any existing value counts as approved
    } else {
      // Fallback to memory storage
      return memoryStorage.get(reviewId) ?? false;
    }
  } catch (error) {
    console.error('Redis error in isApproved:', error);
    // Fallback to memory storage on Redis error
    return memoryStorage.get(reviewId) ?? false;
  }
}

// Set approval
export async function setApproval(reviewId: string, approved: boolean) {
  try {
    if (redis) {
      if (approved) {
        await redis.set(`approval:${reviewId}`, '1');
        console.log('Approval saved to Redis:', { reviewId, approved });
      } else {
        await redis.del(`approval:${reviewId}`);
        console.log('Approval removed from Redis:', { reviewId, approved });
      }
    }
    
    // Always update memory storage as fallback
    if (approved) {
      memoryStorage.set(reviewId, true);
      console.log('Approval saved to memory:', { reviewId, approved });
    } else {
      memoryStorage.delete(reviewId);
      console.log('Approval removed from memory:', { reviewId, approved });
    }
  } catch (error) {
    console.error('Redis error in setApproval:', error);
    // Fallback to memory storage on Redis error
    if (approved) {
      memoryStorage.set(reviewId, true);
      console.log('Approval saved to memory (Redis fallback):', { reviewId, approved });
    } else {
      memoryStorage.delete(reviewId);
      console.log('Approval removed from memory (Redis fallback):', { reviewId, approved });
    }
  }
}

// Get all approved review IDs
export async function getAllApprovals() {
  try {
    if (redis) {
      const keys = await redis.keys('approval:*');
      return keys.map(k => k.replace('approval:', ''));
    } else {
      // Fallback to memory storage
      return Array.from(memoryStorage.entries())
        .filter(([_, approved]) => approved)
        .map(([reviewId, _]) => reviewId);
    }
  } catch (error) {
    console.error('Redis error in getAllApprovals:', error);
    // Fallback to memory storage on Redis error
    return Array.from(memoryStorage.entries())
      .filter(([_, approved]) => approved)
      .map(([reviewId, _]) => reviewId);
  }
}