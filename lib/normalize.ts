import type { NormalizedReview, RawHostawayReview, ReviewCategory } from "@/lib/types";

function toIso(dateTime: string | null | undefined): string | null {
	if (!dateTime) return null;
	// Hostaway example "2020-08-21 22:45:14" → ISO
	const replaced = dateTime.replace(" ", "T") + (dateTime.includes("Z") ? "" : "Z");
	return replaced;
}

function coerceRatingToFiveScale(rating: number | null | undefined): number | null {
	if (rating == null || Number.isNaN(rating)) return null;
	// Hostaway category ratings appear to be /10; if rating > 5 assume /10 and convert
	return rating > 5 ? Number((rating / 2).toFixed(2)) : Number(rating.toFixed(2));
}

function averageCategoryToFiveScale(categories: ReviewCategory[] | null | undefined): number | null {
	if (!categories || categories.length === 0) return null;
	const values = categories
		.map(c => (typeof c.rating === "number" ? c.rating : null))
		.filter((v): v is number => v != null);
	if (values.length === 0) return null;
	const avgTenScale = values.reduce((a, b) => a + b, 0) / values.length; // likely /10
	return Number(((avgTenScale > 5 ? avgTenScale / 2 : avgTenScale)).toFixed(2));
}

function slugify(input: string | null | undefined): string {
	if (!input) return "unknown-listing";
	return input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "");
}

export function normalizeHostawayReviews(raw: RawHostawayReview[]): NormalizedReview[] {
	return raw.map((r) => {
		const id = `hostaway:${String(r.id)}`;
		const listingName = r.listingName ?? null;
		const listingId = String(r.listingId ?? slugify(listingName));
		const categories = Array.isArray(r.reviewCategory) ? r.reviewCategory.map(c => ({ category: c.category, rating: c.rating })) : [];
		const ratingTopLevel = typeof r.rating === "number" ? r.rating : null;
		const derivedRating = averageCategoryToFiveScale(categories);
		const ratingFive = coerceRatingToFiveScale(ratingTopLevel) ?? derivedRating;
		return {
			id,
			source: "hostaway",
			type: r.type ?? null,
			status: r.status ?? null,
			rating: ratingFive,
			categories,
			submittedAt: toIso(r.submittedAt ?? null),
			guestName: r.guestName ?? null,
			listingName,
			listingId,
			channel: r.channel ?? null,
			comment: r.publicReview ?? null,
			approved: false
		};
	});
} 