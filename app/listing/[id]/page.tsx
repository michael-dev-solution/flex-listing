import type { NormalizedListing } from "@/lib/types";
import { getNormalizedListings } from "@/lib/reviews";

async function getData(): Promise<NormalizedListing[]> {
	return await getNormalizedListings();
}

const aliasToListingId: Record<string, string> = {
	"sample-listing": "shoreditch-heights-2b-n1-a"
};

export default async function ListingPage({ params }: { params: { id: string } }) {
	const listings = await getData();
	const targetId = aliasToListingId[params.id] ?? params.id;
	const listing = listings.find(l => l.listingId === targetId || l.listingId === decodeURIComponent(targetId));

	if (!listing) {
		return (
			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Listing not found</h2>
				<p className="text-sm text-gray-600">We couldn’t find that property.</p>
				<div className="text-sm text-gray-600">Try one of:
					<ul className="list-disc ml-5 mt-1">
						{listings.map(l => (
							<li key={l.listingId}><a className="text-blue-600 hover:underline" href={`/listing/${l.listingId}`}>{l.listingName}</a></li>
						))}
					</ul>
				</div>
			</div>
		);
	}

	const approved = listing.reviews.filter(r => r.approved);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold">{listing.listingName}</h2>
				<p className="text-sm text-gray-600">Channels: {listing.channels.join(", ") || "-"} · Avg rating: {listing.stats.avgRating ?? "-"} ({listing.stats.count})</p>
			</div>
			<section className="space-y-3">
				<h3 className="text-lg font-semibold">Guest Reviews</h3>
				{approved.length === 0 ? (
					<p className="text-sm text-gray-600">No approved reviews yet.</p>
				) : (
					<ul className="grid gap-4 sm:grid-cols-2">
						{approved.map(r => (
							<li key={r.id} className="rounded-lg border bg-white p-4">
								<div className="mb-2 flex items-center justify-between">
									<span className="font-medium">{r.guestName ?? "Guest"}</span>
									<span className="badge">{r.rating ?? "-"}</span>
								</div>
								<p className="text-sm text-gray-700">{r.comment}</p>
								<div className="mt-2 text-xs text-gray-500">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : ""} · {r.channel ?? "-"}</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
} 