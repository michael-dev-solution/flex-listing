import { NextRequest } from "next/server";
import type { NormalizedResponse } from "@/lib/types";
import { getApprovalsMeta, getNormalizedListings } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
	try {
		const listings = await getNormalizedListings();
		const body: NormalizedResponse = { status: "success", listings, meta: getApprovalsMeta() };
		return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
	} catch (error: any) {
		return new Response(JSON.stringify({ status: "error", message: error?.message ?? "Unknown error" }), { status: 500 });
	}
} 