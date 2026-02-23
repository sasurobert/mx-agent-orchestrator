// ====================================
// Agent Scoring — Pure function (used by Discovery + Router)
// Spec §3.3: RICE-based scoring algorithm
// ====================================

export interface AgentScoreInput {
    reputationScore: number;       // 0-100
    price: bigint;                 // Agent's price
    maxPriceInCategory: bigint;    // Highest price among candidates
    avgResponseTime: number;       // ms
    maxResponseTime: number;       // Highest response time among candidates
    lastActiveTimestamp: number;   // epoch ms
    now?: number;                  // current time (for testing)
}

export interface AgentScoreResult {
    total: number;
    breakdown: {
        reputation: number;
        priceEfficiency: number;
        speed: number;
        recentActivity: number;
    };
}

/**
 * RICE-based agent scoring per spec §3.3:
 *   AgentScore = (Reputation × 0.4) + (PriceEfficiency × 0.3) + (SpeedScore × 0.2) + (RecentActivity × 0.1)
 */
export function calculateAgentScore(input: AgentScoreInput): AgentScoreResult {
    const reputation = input.reputationScore / 100;

    const maxPrice = input.maxPriceInCategory > 0n ? input.maxPriceInCategory : 1n;
    const priceEfficiency = 1 - Number(input.price * 10000n / maxPrice) / 10000;

    const maxResp = input.maxResponseTime > 0 ? input.maxResponseTime : 1;
    const speed = 1 - input.avgResponseTime / maxResp;

    const nowMs = input.now ?? Date.now();
    const hoursSinceActive = (nowMs - input.lastActiveTimestamp) / (1000 * 60 * 60);
    const recentActivity = hoursSinceActive < 24 ? 1.0 : hoursSinceActive < 168 ? 0.5 : 0.1;

    const total =
        reputation * 0.4 +
        priceEfficiency * 0.3 +
        Math.max(0, speed) * 0.2 +
        recentActivity * 0.1;

    return {
        total: Math.round(total * 10000) / 10000,
        breakdown: {
            reputation: Math.round(reputation * 10000) / 10000,
            priceEfficiency: Math.round(priceEfficiency * 10000) / 10000,
            speed: Math.round(Math.max(0, speed) * 10000) / 10000,
            recentActivity,
        },
    };
}
