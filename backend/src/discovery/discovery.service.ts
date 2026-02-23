// ====================================
// Agent Discovery Service
// Queries MX-8004 registries + filters/sorts agents
// ====================================

import { AgentCandidate, DiscoveryQuery } from '../types';
import { calculateAgentScore } from '../router/scoring';

export class DiscoveryService {
    /**
     * Filter agents by query criteria
     */
    filterAgents(agents: AgentCandidate[], query: DiscoveryQuery): AgentCandidate[] {
        let filtered = [...agents];

        // Filter by required skills (agent must have ALL specified skills)
        if (query.skills && query.skills.length > 0) {
            filtered = filtered.filter((agent) =>
                query.skills.every((skill) => agent.manifest.skills.includes(skill)),
            );
        }

        // Filter by preferred domains (agent must have at least ONE matching domain)
        if (query.domains && query.domains.length > 0) {
            filtered = filtered.filter((agent) =>
                query.domains!.some((domain) => agent.manifest.domains.includes(domain)),
            );
        }

        // Filter by minimum reputation
        if (query.minReputation !== undefined) {
            filtered = filtered.filter((agent) => agent.reputation.score >= query.minReputation!);
        }

        // Filter by max price
        if (query.maxPrice !== undefined) {
            filtered = filtered.filter((agent) => agent.pricing.price <= query.maxPrice!);
        }

        // Filter by preferred token
        if (query.preferredToken) {
            filtered = filtered.filter((agent) => agent.pricing.token === query.preferredToken);
        }

        // Apply limit
        const limit = query.limit ?? 10;
        return filtered.slice(0, limit);
    }

    /**
     * Sort agents by the specified criteria
     */
    sortAgents(
        agents: AgentCandidate[],
        sortBy: 'reputation' | 'price' | 'speed' | 'best_value' = 'best_value',
    ): AgentCandidate[] {
        const sorted = [...agents];

        switch (sortBy) {
            case 'reputation':
                sorted.sort((a, b) => b.reputation.score - a.reputation.score);
                break;

            case 'price':
                sorted.sort((a, b) => {
                    if (a.pricing.price < b.pricing.price) return -1;
                    if (a.pricing.price > b.pricing.price) return 1;
                    return 0;
                });
                break;

            case 'speed':
                sorted.sort((a, b) => a.responseTime - b.responseTime);
                break;

            case 'best_value': {
                const maxPrice =
                    agents.reduce(
                        (max, a) => (a.pricing.price > max ? a.pricing.price : max),
                        0n,
                    ) || 1n;
                const maxResponseTime = Math.max(...agents.map((a) => a.responseTime), 1);

                const scores = new Map<number, number>();
                for (const agent of agents) {
                    const result = calculateAgentScore({
                        reputationScore: agent.reputation.score,
                        price: agent.pricing.price,
                        maxPriceInCategory: maxPrice,
                        avgResponseTime: agent.responseTime,
                        maxResponseTime,
                        lastActiveTimestamp: agent.lastActive,
                    });
                    scores.set(agent.nonce, result.total);
                }

                sorted.sort((a, b) => (scores.get(b.nonce) ?? 0) - (scores.get(a.nonce) ?? 0));
                break;
            }
        }

        return sorted;
    }
}
