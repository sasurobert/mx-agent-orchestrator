// ====================================
// Discovery Service — TDD Tests
// ====================================

import { DiscoveryService } from './discovery.service';
import { BlockchainService } from '../mx';
import { AgentCandidate } from '../types';

// ---- Mock BlockchainService ----
jest.mock('../mx', () => ({
    BlockchainService: jest.fn().mockImplementation(() => ({
        getAgent: jest.fn(),
        getAgentServicePrice: jest.fn(),
        getReputationScore: jest.fn(),
        getTotalJobs: jest.fn(),
    })),
}));

function createMockAgent(nonce: number, overrides: Partial<AgentCandidate> = {}): AgentCandidate {
    return {
        nonce,
        name: `Agent-${nonce}`,
        owner: `erd1${'0'.repeat(58)}`,
        uri: `https://agents.example.com/${nonce}`,
        manifest: {
            name: `Agent-${nonce}`,
            version: '1.0.0',
            description: `Agent number ${nonce}`,
            skills: ['retrieval_augmented_generation'],
            domains: ['technology'],
            endpoints: {},
        },
        reputation: { score: 80, totalJobs: 100, successRate: 0.95 },
        pricing: { price: 100n, token: 'USDC-350c4e', tokenNonce: 0 },
        services: [],
        lastActive: Date.now() - 3600000,
        responseTime: 500,
        ...overrides,
    };
}

describe('DiscoveryService', () => {
    let service: DiscoveryService;

    beforeEach(() => {
        service = new DiscoveryService();
    });

    describe('filterAgents', () => {
        const agents = [
            createMockAgent(1, {
                manifest: {
                    name: 'Research Bot',
                    version: '1.0.0',
                    description: 'Research agent',
                    skills: ['retrieval_augmented_generation', 'data_analysis'],
                    domains: ['technology'],
                    endpoints: {},
                },
                reputation: { score: 95, totalJobs: 1200, successRate: 0.98 },
                pricing: { price: 250000n, token: 'USDC-350c4e', tokenNonce: 0 },
            }),
            createMockAgent(2, {
                manifest: {
                    name: 'Code Reviewer',
                    version: '1.0.0',
                    description: 'Reviews code',
                    skills: ['code_review'],
                    domains: ['technology'],
                    endpoints: {},
                },
                reputation: { score: 88, totalJobs: 340, successRate: 0.92 },
                pricing: { price: 100000n, token: 'USDC-350c4e', tokenNonce: 0 },
            }),
            createMockAgent(3, {
                manifest: {
                    name: 'Translator',
                    version: '1.0.0',
                    description: 'Translates text',
                    skills: ['translation'],
                    domains: ['language'],
                    endpoints: {},
                },
                reputation: { score: 45, totalJobs: 20, successRate: 0.80 },
                pricing: { price: 30000n, token: 'USDC-350c4e', tokenNonce: 0 },
            }),
        ];

        it('should filter by required skills', () => {
            const result = service.filterAgents(agents, { skills: ['code_review'] });
            expect(result).toHaveLength(1);
            expect(result[0].nonce).toBe(2);
        });

        it('should filter by minimum reputation', () => {
            const result = service.filterAgents(agents, {
                skills: [],
                minReputation: 50,
            });
            expect(result).toHaveLength(2);
            expect(result.map((a) => a.nonce).sort()).toEqual([1, 2]);
        });

        it('should filter by max price', () => {
            const result = service.filterAgents(agents, {
                skills: [],
                maxPrice: 150000n,
            });
            expect(result).toHaveLength(2);
        });

        it('should filter by domains', () => {
            const result = service.filterAgents(agents, {
                skills: [],
                domains: ['language'],
            });
            expect(result).toHaveLength(1);
            expect(result[0].nonce).toBe(3);
        });

        it('should respect limit parameter', () => {
            const result = service.filterAgents(agents, { skills: [], limit: 2 });
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no agents match', () => {
            const result = service.filterAgents(agents, {
                skills: ['nonexistent_skill'],
            });
            expect(result).toHaveLength(0);
        });
    });

    describe('sortAgents', () => {
        const agents = [
            createMockAgent(1, {
                reputation: { score: 70, totalJobs: 50, successRate: 0.90 },
                pricing: { price: 200000n, token: 'USDC-350c4e', tokenNonce: 0 },
                responseTime: 800,
            }),
            createMockAgent(2, {
                reputation: { score: 95, totalJobs: 500, successRate: 0.99 },
                pricing: { price: 300000n, token: 'USDC-350c4e', tokenNonce: 0 },
                responseTime: 200,
            }),
            createMockAgent(3, {
                reputation: { score: 60, totalJobs: 30, successRate: 0.85 },
                pricing: { price: 50000n, token: 'USDC-350c4e', tokenNonce: 0 },
                responseTime: 1500,
            }),
        ];

        it('should sort by reputation (descending)', () => {
            const result = service.sortAgents(agents, 'reputation');
            expect(result[0].nonce).toBe(2);
            expect(result[1].nonce).toBe(1);
            expect(result[2].nonce).toBe(3);
        });

        it('should sort by price (ascending — cheapest first)', () => {
            const result = service.sortAgents(agents, 'price');
            expect(result[0].nonce).toBe(3);
            expect(result[2].nonce).toBe(2);
        });

        it('should sort by speed (ascending — fastest first)', () => {
            const result = service.sortAgents(agents, 'speed');
            expect(result[0].nonce).toBe(2);
            expect(result[2].nonce).toBe(3);
        });

        it('should sort by best_value using RICE scoring', () => {
            const result = service.sortAgents(agents, 'best_value');
            // Agent 2 has best reputation + speed, should rank high
            expect(result[0].nonce).toBe(2);
        });
    });
});
