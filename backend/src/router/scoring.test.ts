// ====================================
// Agent Scoring — TDD Tests
// ====================================

import { calculateAgentScore, AgentScoreInput } from './scoring';

const NOW = 1700000000000; // Fixed timestamp for testing

describe('calculateAgentScore', () => {
    const defaults: AgentScoreInput = {
        reputationScore: 100,
        price: 100n,
        maxPriceInCategory: 100n,
        avgResponseTime: 0,
        maxResponseTime: 1000,
        lastActiveTimestamp: NOW - 1000 * 60 * 60, // 1 hour ago
        now: NOW,
    };

    it('should return 1.0 for a perfect agent', () => {
        const result = calculateAgentScore({
            ...defaults,
            reputationScore: 100,
            price: 0n,            // cheapest
            avgResponseTime: 0,   // fastest
            lastActiveTimestamp: NOW - 1000, // just now
        });

        // 1.0*0.4 + 1.0*0.3 + 1.0*0.2 + 1.0*0.1 = 1.0
        expect(result.total).toBe(1);
    });

    it('should weight reputation at 40%', () => {
        const high = calculateAgentScore({ ...defaults, reputationScore: 100 });
        const low = calculateAgentScore({ ...defaults, reputationScore: 50 });
        const diff = high.total - low.total;
        // 50% of 0.4 = 0.2
        expect(diff).toBeCloseTo(0.2, 2);
    });

    it('should weight price efficiency at 30%', () => {
        const cheap = calculateAgentScore({ ...defaults, price: 0n });
        const expensive = calculateAgentScore({ ...defaults, price: 100n }); // maxPrice
        const diff = cheap.total - expensive.total;
        expect(diff).toBeCloseTo(0.3, 2);
    });

    it('should weight speed at 20%', () => {
        const fast = calculateAgentScore({ ...defaults, avgResponseTime: 0 });
        const slow = calculateAgentScore({ ...defaults, avgResponseTime: 1000 }); // maxResponseTime
        const diff = fast.total - slow.total;
        expect(diff).toBeCloseTo(0.2, 2);
    });

    it('should give 1.0 activity score for agents active within 24h', () => {
        const result = calculateAgentScore({
            ...defaults,
            lastActiveTimestamp: NOW - 1000 * 60 * 60 * 12, // 12 hours ago
        });
        expect(result.breakdown.recentActivity).toBe(1.0);
    });

    it('should give 0.5 activity score for agents active within 7 days', () => {
        const result = calculateAgentScore({
            ...defaults,
            lastActiveTimestamp: NOW - 1000 * 60 * 60 * 72, // 3 days ago
        });
        expect(result.breakdown.recentActivity).toBe(0.5);
    });

    it('should give 0.1 activity score for agents inactive >7 days', () => {
        const result = calculateAgentScore({
            ...defaults,
            lastActiveTimestamp: NOW - 1000 * 60 * 60 * 24 * 30, // 30 days ago
        });
        expect(result.breakdown.recentActivity).toBe(0.1);
    });

    it('should handle zero maxPriceInCategory gracefully', () => {
        const result = calculateAgentScore({
            ...defaults,
            price: 0n,
            maxPriceInCategory: 0n,
        });
        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeLessThanOrEqual(1);
    });

    it('should handle zero maxResponseTime gracefully', () => {
        const result = calculateAgentScore({
            ...defaults,
            avgResponseTime: 0,
            maxResponseTime: 0,
        });
        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeLessThanOrEqual(1);
    });

    it('should never return negative scores', () => {
        const result = calculateAgentScore({
            ...defaults,
            reputationScore: 0,
            price: 100n,
            avgResponseTime: 1000,
            lastActiveTimestamp: 0,
        });
        expect(result.total).toBeGreaterThanOrEqual(0);
    });
});
