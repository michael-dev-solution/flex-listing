import "@/styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
	title: "Flex Living Reviews",
	description: "Manager dashboard and property reviews display"
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-gray-50 text-gray-900">
				<header className="border-b bg-white">
					<div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
						<h1 className="text-lg font-semibold">Flex Living Reviews</h1>
						<nav className="space-x-4 text-sm">
							<a className="hover:underline" href="/">Home</a>
							<a className="hover:underline" href="/dashboard">Dashboard</a>
						</nav>
					</div>
				</header>
				<main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
			</body>
		</html>
	);
} 