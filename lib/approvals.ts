import { Redis } from '@upstash/redis';

// Validate Redis environment variables
const redisUrl = process.env.REDIS_URL;
const redisToken = process.env.REDIS_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn('Redis environment variables not set. Redis functionality will be disabled.');
}

const redis = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

// Check if a review is approved
export async function isApproved(reviewId: string) {
  try {
    if (!redis) return false;
    return (await redis.get(`approval:${reviewId}`)) === 'true';
  } catch (error) {
    console.error('Redis error in isApproved:', error);
    return false;
  }
}

// Set approval
export async function setApproval(reviewId: string, approved: boolean) {
  try {
    if (!redis) return;
    if (approved) {
      await redis.set(`approval:${reviewId}`, 'true');
    } else {
      await redis.del(`approval:${reviewId}`);
    }
  } catch (error) {
    console.error('Redis error in setApproval:', error);
  }
}

// Get all approved review IDs
export async function getAllApprovals() {
  try {
    if (!redis) return [];
    const keys = await redis.keys('approval:*');
    return keys.map(k => k.replace('approval:', ''));
  } catch (error) {
    console.error('Redis error in getAllApprovals:', error);
    return [];
  }
}