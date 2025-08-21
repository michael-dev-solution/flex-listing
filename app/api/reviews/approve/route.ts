import { NextRequest } from "next/server";
import { setApproval } from "@/lib/approvals";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const reviewId = String(body?.reviewId ?? "").trim();
		const approved = Boolean(body?.approved);
		if (!reviewId) {
			return new Response(JSON.stringify({ status: "error", message: "reviewId is required" }), { status: 400 });
		}
		setApproval(reviewId, approved);
		return new Response(JSON.stringify({ status: "success", reviewId, approved }), { status: 200, headers: { "content-type": "application/json" } });
	} catch (error: any) {
		return new Response(JSON.stringify({ status: "error", message: error?.message ?? "Unknown error" }), { status: 500 });
	}
} 