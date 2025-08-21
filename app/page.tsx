export default function HomePage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Welcome</h2>
				<p className="text-sm text-gray-600">Use the dashboard to manage and approve guest reviews. Approved reviews will appear on property pages.</p>
			</div>
			<div className="flex gap-3">
				<a className="btn" href="/dashboard">Open Dashboard</a>
				<a className="btn" href="/listing/sample-listing">View Sample Listing</a>
			</div>
		</div>
	);
} 