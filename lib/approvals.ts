const approvedReviewIds = new Set<string>();

export function isApproved(reviewId: string): boolean {
	return approvedReviewIds.has(reviewId);
}

export function setApproval(reviewId: string, approved: boolean): void {
	if (approved) {
		approvedReviewIds.add(reviewId);
	} else {
		approvedReviewIds.delete(reviewId);
	}
}

export function getAllApprovals(): string[] {
	return Array.from(approvedReviewIds);
} 