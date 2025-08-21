import { NextRequest } from "next/server";
import type { NormalizedReview } from "@/lib/types";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const placeId = searchParams.get("placeId");
		const apiKey = process.env.GOOGLE_MAPS_API_KEY;
		if (!placeId || !apiKey) {
			return new Response(JSON.stringify({ status: "success", reviews: [], note: "Provide placeId and GOOGLE_MAPS_API_KEY to fetch Google reviews." }), { status: 200, headers: { "content-type": "application/json" } });
		}
		const fields = "rating,reviews,user_ratings_total";
		const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${encodeURIComponent(apiKey)}`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Google API error: ${res.status}`);
		const json = await res.json();
		const reviewsRaw = json?.result?.reviews ?? [];
		const normalized: NormalizedReview[] = Array.isArray(reviewsRaw)
			? reviewsRaw.map((r: any, idx: number) => ({
				id: `google:${placeId}:${idx}`,
				source: "google",
				type: "guest-to-host",
				status: "published",
				rating: typeof r?.rating === "number" ? r.rating : null,
				categories: [],
				submittedAt: r?.time ? new Date(r.time * 1000).toISOString() : null,
				guestName: r?.author_name ?? null,
				listingName: null,
				listingId: placeId,
				channel: "google",
				comment: r?.text ?? null,
				approved: false
			}))
			: [];
		return new Response(JSON.stringify({ status: "success", reviews: normalized }), { status: 200, headers: { "content-type": "application/json" } });
	} catch (error: any) {
		return new Response(JSON.stringify({ status: "error", message: error?.message ?? "Unknown error" }), { status: 500 });
	}
} 