export type ReviewCategory = {
	category: string;
	rating: number | null;
};

export type RawHostawayReview = {
	id: number | string;
	type?: string | null;
	status?: string | null;
	rating?: number | null;
	publicReview?: string | null;
	reviewCategory?: ReviewCategory[] | null;
	submittedAt?: string | null;
	guestName?: string | null;
	listingName?: string | null;
	listingId?: string | number | null;
	channel?: string | null;
};

export type NormalizedReview = {
	id: string;
	source: "hostaway" | "google" | string;
	type: string | null;
	status: string | null;
	rating: number | null; // 0..5
	categories: ReviewCategory[];
	submittedAt: string | null; // ISO 8601
	guestName: string | null;
	listingName: string | null;
	listingId: string;
	channel: string | null;
	comment: string | null;
	approved: boolean;
};

export type NormalizedListing = {
	listingId: string;
	listingName: string | null;
	channels: string[];
	stats: { avgRating: number | null; count: number };
	reviews: NormalizedReview[];
};

export type NormalizedResponse = {
	status: "success" | "error";
	listings: NormalizedListing[];
	meta?: Record<string, unknown>;
}; 