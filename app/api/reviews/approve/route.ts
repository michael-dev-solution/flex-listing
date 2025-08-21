import { NextRequest } from "next/server";
import { setApproval, isApproved } from "@/lib/approvals";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const reviewId = String(body?.reviewId ?? "").trim();
		const approved = Boolean(body?.approved);
		
		console.log('Approval request:', { reviewId, approved });
		
		if (!reviewId) {
			return new Response(JSON.stringify({ status: "error", message: "reviewId is required" }), { status: 400 });
		}
		
		await setApproval(reviewId, approved);
		const stored = await isApproved(reviewId);
		console.log('Approval saved successfully:', { reviewId, requested: approved, stored });
		
		return new Response(JSON.stringify({ status: "success", reviewId, approved: stored }), { status: 200, headers: { "content-type": "application/json" } });
	} catch (error: any) {
		console.error('Approval error:', error);
		return new Response(JSON.stringify({ status: "error", message: error?.message ?? "Unknown error" }), { status: 500 });
	}
} 