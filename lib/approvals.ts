import { kv } from '@vercel/kv';

export async function isApproved(reviewId: string) {
  return await kv.get<boolean>(`approval:${reviewId}`);
}

export async function setApproval(reviewId: string, approved: boolean) {
  if (approved) {
    await kv.set(`approval:${reviewId}`, true);
  } else {
    await kv.del(`approval:${reviewId}`);
  }
}

export async function getAllApprovals() {
  const keys = await kv.keys('approval:*');
  return keys.map(k => k.replace('approval:', ''));
}