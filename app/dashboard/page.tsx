"use client";

import { useEffect, useMemo, useState } from "react";
import type { NormalizedListing, NormalizedReview } from "@/lib/types";

type ApiResponse = {
	status: string;
	listings: NormalizedListing[];
};

type Filters = {
	search: string;
	channel: string;
	ratingMin: number | null;
	category: string;
	approved: "all" | "approved" | "hidden";
};

export default function DashboardPage() {
	const [data, setData] = useState<NormalizedListing[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<Filters>({ search: "", channel: "", ratingMin: null, category: "", approved: "all" });
	const [sortBy, setSortBy] = useState<"rating" | "date">("rating");

	useEffect(() => {
		setLoading(true);
		fetch("/api/reviews/hostaway")
			.then(r => r.json())
			.then((json: ApiResponse) => setData(json.listings))
			.catch((e) => setError(String(e?.message ?? e)))
			.finally(() => setLoading(false));
	}, []);

	const allReviews = useMemo(() => {
		const reviews: NormalizedReview[] = [];
		(data ?? []).forEach(l => reviews.push(...l.reviews));
		return reviews;
	}, [data]);

	const filtered = useMemo(() => {
		let reviews = allReviews.slice();
		if (filters.search) {
			reviews = reviews.filter(r => (r.comment?.toLowerCase().includes(filters.search.toLowerCase()) || r.guestName?.toLowerCase().includes(filters.search.toLowerCase()) || r.listingName?.toLowerCase().includes(filters.search.toLowerCase())));
		}
		if (filters.channel) {
			reviews = reviews.filter(r => r.channel === filters.channel);
		}
		if (filters.ratingMin != null) {
			reviews = reviews.filter(r => (r.rating ?? 0) >= (filters.ratingMin ?? 0));
		}
		if (filters.category) {
			reviews = reviews.filter(r => r.categories.some(c => c.category === filters.category));
		}
		if (filters.approved !== "all") {
			reviews = reviews.filter(r => (filters.approved === "approved" ? r.approved : !r.approved));
		}
		reviews.sort((a, b) => {
			if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
			const at = a.submittedAt ? Date.parse(a.submittedAt) : 0;
			const bt = b.submittedAt ? Date.parse(b.submittedAt) : 0;
			return bt - at;
		});
		return reviews;
	}, [allReviews, filters, sortBy]);

	function toggleApprove(review: NormalizedReview, approved: boolean) {
		fetch("/api/reviews/approve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reviewId: review.id, approved }) })
			.then(() => {
				setData(prev => prev ? prev.map(l => ({ ...l, reviews: l.reviews.map(r => r.id === review.id ? { ...r, approved } : r) })) : prev);
			})
			.catch(() => {});
	}

	return (
		<div className="space-y-6">
			<div className="flex items-end flex-wrap gap-3">
				<div>
					<h2 className="text-xl font-semibold">Manager Dashboard</h2>
					<p className="text-sm text-gray-600">Filter, sort, and approve reviews. Approved reviews appear on the property page.</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<input className="border rounded-md px-3 py-1.5 text-sm" placeholder="Search" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
					<select className="border rounded-md px-2 py-1.5 text-sm" value={filters.channel} onChange={e => setFilters({ ...filters, channel: e.target.value })}>
						<option value="">All channels</option>
						<option value="airbnb">Airbnb</option>
						<option value="booking">Booking</option>
						<option value="direct">Direct</option>
					</select>
					<select className="border rounded-md px-2 py-1.5 text-sm" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
						<option value="">All categories</option>
						<option value="cleanliness">Cleanliness</option>
						<option value="communication">Communication</option>
						<option value="location">Location</option>
						<option value="value">Value</option>
						<option value="respect_house_rules">House Rules</option>
					</select>
					<select className="border rounded-md px-2 py-1.5 text-sm" value={filters.approved} onChange={e => setFilters({ ...filters, approved: e.target.value as Filters["approved"] })}>
						<option value="all">All</option>
						<option value="approved">Approved</option>
						<option value="hidden">Hidden</option>
					</select>
					<select className="border rounded-md px-2 py-1.5 text-sm" value={String(filters.ratingMin ?? "")} onChange={e => setFilters({ ...filters, ratingMin: e.target.value ? Number(e.target.value) : null })}>
						<option value="">Any rating</option>
						<option value="4">4+</option>
						<option value="4.5">4.5+</option>
						<option value="5">5</option>
					</select>
					<select className="border rounded-md px-2 py-1.5 text-sm" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
						<option value="rating">Sort by rating</option>
						<option value="date">Sort by date</option>
					</select>
				</div>
			</div>

			{loading && <p className="text-sm">Loading...</p>}
			{error && <p className="text-sm text-red-600">{error}</p>}

			<div className="overflow-x-auto rounded-lg border bg-white">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50 text-gray-600">
						<tr>
							<th className="text-left px-3 py-2">Listing</th>
							<th className="text-left px-3 py-2">Guest</th>
							<th className="text-left px-3 py-2">Rating</th>
							<th className="text-left px-3 py-2">Channel</th>
							<th className="text-left px-3 py-2">Date</th>
							<th className="text-left px-3 py-2">Comment</th>
							<th className="text-left px-3 py-2">Approve</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map(r => (
							<tr key={r.id} className="border-t">
								<td className="px-3 py-2 whitespace-nowrap">{r.listingName}</td>
								<td className="px-3 py-2 whitespace-nowrap">{r.guestName}</td>
								<td className="px-3 py-2">
									<span className="badge">{r.rating ?? "-"}</span>
								</td>
								<td className="px-3 py-2 whitespace-nowrap">{r.channel ?? "-"}</td>
								<td className="px-3 py-2 whitespace-nowrap">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "-"}</td>
								<td className="px-3 py-2 max-w-[28rem]">
									<p className="line-clamp-3">{r.comment}</p>
								</td>
								<td className="px-3 py-2">
									<label className="inline-flex items-center gap-2 text-xs">
										<input type="checkbox" checked={r.approved} onChange={e => toggleApprove(r, e.target.checked)} />
										<span>{r.approved ? "Approved" : "Hidden"}</span>
									</label>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
} 