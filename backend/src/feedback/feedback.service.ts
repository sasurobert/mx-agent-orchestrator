// ====================================
// Reputation & Feedback Service
// Auto-rating pipeline + user override
// ====================================

import { FeedbackSubmission, AgentResultStatus } from '../types';

interface AutoRateInput {
    status: AgentResultStatus;
    latencyMs: number;
    expectedLatencyMs: number;
    hasResult: boolean;
}

export class FeedbackService {
    /**
     * Auto-rate an agent based on performance metrics.
     * Returns a score 0-100.
     */
    autoRate(input: AutoRateInput): number {
        // Hard failures
        if (input.status === 'failed') return 0;
        if (input.status === 'timeout') return 10;

        // Base score for completion
        let score = 60;

        // Latency bonus/penalty (up to ±30)
        if (input.expectedLatencyMs > 0) {
            const latencyRatio = input.latencyMs / input.expectedLatencyMs;
            if (latencyRatio <= 0.5) {
                score += 30; // Very fast
            } else if (latencyRatio <= 1.0) {
                score += Math.round(30 * (1 - latencyRatio)); // Proportional
            } else {
                score -= Math.min(30, Math.round(10 * (latencyRatio - 1))); // Penalty for slow
            }
        }

        // Result quality bonus
        if (input.hasResult) {
            score += 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Apply user override to an auto-rated submission.
     */
    applyUserOverride(
        submission: FeedbackSubmission,
        userRating: number,
    ): FeedbackSubmission {
        const clampedRating = Math.max(0, Math.min(100, Math.round(userRating)));
        return {
            ...submission,
            rating: clampedRating,
            autoRated: false,
            userOverride: clampedRating,
        };
    }
}
