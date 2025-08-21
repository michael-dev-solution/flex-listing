import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

// Check if a review is approved
export async function isApproved(reviewId: string) {
  return (await redis.get(`approval:${reviewId}`)) === 'true';
}

// Set approval
export async function setApproval(reviewId: string, approved: boolean) {
  if (approved) {
    await redis.set(`approval:${reviewId}`, 'true');
  } else {
    await redis.del(`approval:${reviewId}`);
  }
}

// Get all approved review IDs
export async function getAllApprovals() {
  const keys = await redis.keys('approval:*');
  return keys.map(k => k.replace('approval:', ''));
}