// ====================================
// Reputation & Feedback Types (Spec §3.6)
// ====================================

export interface FeedbackSubmission {
    jobId: string;
    agentNonce: number;
    rating: number;
    autoRated: boolean;
    userOverride?: number;
}

export interface SubmitFeedbackRequest {
    requestId: string;
    overallRating: number;
    agentRatings?: Record<string, number>;
}
