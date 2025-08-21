import mock from "@/data/hostaway-reviews.json" assert { type: "json" };
import { normalizeHostawayReviews } from "@/lib/normalize";
import { isApproved, getAllApprovals } from "@/lib/approvals";
import type { NormalizedListing, RawHostawayReview } from "@/lib/types";

async function fetchHostawayRaw(): Promise<RawHostawayReview[]> {
	const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
	const apiKey = process.env.HOSTAWAY_API_KEY;
	if (!accountId || !apiKey) return [];
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 8000);
		const url = "https://api.hostaway.com/v1/reviews?limit=100";
		const res = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Hostaway-Account-Id": accountId,
				"X-Hostaway-API-Key": apiKey
			},
			signal: controller.signal
		});
		clearTimeout(timeout);
		if (!res.ok) return [];
		const json: any = await res.json();
		const arr = Array.isArray(json?.result) ? json.result : [];
		return arr as RawHostawayReview[];
	} catch {
		return [];
	}
}

export async function getNormalizedListings(): Promise<NormalizedListing[]> {
	try {
		// Try Hostaway sandbox; fallback to local mock if empty
		const remote = await fetchHostawayRaw();
		const raw = remote.length > 0 ? remote : (Array.isArray((mock as any).result) ? (mock as any).result : []);
		const normalized = normalizeHostawayReviews(raw);
		
		// Get all approval statuses with error handling
		let approvals: boolean[] = [];
		try {
			const approvalPromises = normalized.map(r => isApproved(r.id));
			approvals = await Promise.all(approvalPromises);
		} catch (error) {
			console.error('Error fetching approval statuses:', error);
			// Fallback to all false if approvals fail
			approvals = normalized.map(() => false);
		}
		
		// Map normalized reviews with approval status
		const normalizedWithApprovals = normalized.map((r, index) => ({ 
			...r, 
			approved: approvals[index] ?? false 
		}));

		const listingsMap = new Map<string, { listingId: string; listingName: string | null; channels: Set<string>; reviews: typeof normalizedWithApprovals }>();
		for (const r of normalizedWithApprovals) {
			const key = r.listingId;
			if (!listingsMap.has(key)) {
				listingsMap.set(key, { listingId: r.listingId, listingName: r.listingName, channels: new Set<string>(), reviews: [] as any });
			}
			const entry = listingsMap.get(key)!;
			entry.reviews.push(r);
			if (r.channel) entry.channels.add(r.channel);
		}

		const listings = Array.from(listingsMap.values()).map(l => {
			const ratings = l.reviews.map(r => r.rating).filter((v): v is number => typeof v === "number");
			const avgRating = ratings.length ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : null;
			return {
				listingId: l.listingId,
				listingName: l.listingName,
				channels: Array.from(l.channels),
				stats: { avgRating, count: l.reviews.length },
				reviews: l.reviews
			};
		});
		return listings;
	} catch (error) {
		console.error('Error in getNormalizedListings:', error);
		throw error;
	}
}

export function getApprovalsMeta() {
	return { approvals: getAllApprovals() };
} 