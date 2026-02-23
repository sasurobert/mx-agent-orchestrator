// ====================================
// Feedback Service — TDD Tests
// ====================================

import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
    let service: FeedbackService;

    beforeEach(() => {
        service = new FeedbackService();
    });

    describe('autoRate', () => {
        it('should rate high for fast, successful completion', () => {
            const rating = service.autoRate({
                status: 'completed',
                latencyMs: 1000,
                expectedLatencyMs: 5000,
                hasResult: true,
            });

            expect(rating).toBeGreaterThanOrEqual(80);
            expect(rating).toBeLessThanOrEqual(100);
        });

        it('should rate low for slow completion', () => {
            const rating = service.autoRate({
                status: 'completed',
                latencyMs: 30000,
                expectedLatencyMs: 5000,
                hasResult: true,
            });

            expect(rating).toBeLessThan(80);
            expect(rating).toBeGreaterThanOrEqual(0);
        });

        it('should rate 0 for failures', () => {
            const rating = service.autoRate({
                status: 'failed',
                latencyMs: 5000,
                expectedLatencyMs: 5000,
                hasResult: false,
            });

            expect(rating).toBe(0);
        });

        it('should rate 10 for timeouts', () => {
            const rating = service.autoRate({
                status: 'timeout',
                latencyMs: 60000,
                expectedLatencyMs: 5000,
                hasResult: false,
            });

            expect(rating).toBe(10);
        });

        it('should cap rating at 100', () => {
            const rating = service.autoRate({
                status: 'completed',
                latencyMs: 100,
                expectedLatencyMs: 100000,
                hasResult: true,
            });

            expect(rating).toBeLessThanOrEqual(100);
        });
    });

    describe('applyUserOverride', () => {
        it('should use user override when provided', () => {
            const submission = service.applyUserOverride(
                { jobId: 'job-1', agentNonce: 1, rating: 85, autoRated: true },
                75,
            );

            expect(submission.rating).toBe(75);
            expect(submission.autoRated).toBe(false);
            expect(submission.userOverride).toBe(75);
        });

        it('should clamp override to 0-100 range', () => {
            const tooHigh = service.applyUserOverride(
                { jobId: 'job-1', agentNonce: 1, rating: 50, autoRated: true },
                150,
            );
            expect(tooHigh.rating).toBe(100);

            const tooLow = service.applyUserOverride(
                { jobId: 'job-1', agentNonce: 1, rating: 50, autoRated: true },
                -10,
            );
            expect(tooLow.rating).toBe(0);
        });
    });
});
