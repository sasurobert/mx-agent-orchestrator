// ====================================
// Router Service — TDD Tests
// ====================================

import { RouterService } from './router.service';
import { DecomposedTask, AgentCandidate } from '../types';

function createTask(overrides: Partial<DecomposedTask> = {}): DecomposedTask {
    return {
        id: 'task-1',
        description: 'Test task',
        requiredSkills: ['retrieval_augmented_generation'],
        requiredDomains: ['technology'],
        estimatedComplexity: 'medium',
        dependencies: [],
        priority: 1,
        ...overrides,
    };
}

function createAgent(nonce: number, overrides: Partial<AgentCandidate> = {}): AgentCandidate {
    return {
        nonce,
        name: `Agent-${nonce}`,
        owner: `erd1${'0'.repeat(58)}`,
        uri: `https://agents.example.com/${nonce}`,
        manifest: {
            name: `Agent-${nonce}`,
            version: '1.0.0',
            description: `Agent ${nonce}`,
            skills: ['retrieval_augmented_generation'],
            domains: ['technology'],
            endpoints: {},
        },
        reputation: { score: 80, totalJobs: 100, successRate: 0.95 },
        pricing: { price: 100000n, token: 'USDC-350c4e', tokenNonce: 0 },
        services: [],
        lastActive: Date.now() - 3600000,
        responseTime: 500,
        ...overrides,
    };
}

describe('RouterService', () => {
    let service: RouterService;

    beforeEach(() => {
        service = new RouterService();
    });

    describe('assignAgents', () => {
        it('should assign the best agent to a single task', () => {
            const tasks = [createTask()];
            const agents = [
                createAgent(1, { reputation: { score: 95, totalJobs: 500, successRate: 0.99 } }),
                createAgent(2, { reputation: { score: 60, totalJobs: 50, successRate: 0.80 } }),
            ];

            const plan = service.assignAgents(tasks, agents);

            expect(plan.assignments).toHaveLength(1);
            expect(plan.assignments[0].agentNonce).toBe(1); // Best reputation
            expect(plan.assignments[0].taskId).toBe('task-1');
        });

        it('should assign different agents to parallel tasks', () => {
            const tasks = [
                createTask({ id: 'task-1', dependencies: [] }),
                createTask({ id: 'task-2', dependencies: [] }),
            ];
            const agents = [
                createAgent(1, {
                    reputation: { score: 95, totalJobs: 500, successRate: 0.99 },
                    manifest: { name: 'A1', version: '1.0.0', description: '', skills: ['retrieval_augmented_generation'], domains: ['technology'], endpoints: {} },
                }),
                createAgent(2, {
                    reputation: { score: 88, totalJobs: 200, successRate: 0.95 },
                    manifest: { name: 'A2', version: '1.0.0', description: '', skills: ['retrieval_augmented_generation'], domains: ['technology'], endpoints: {} },
                }),
            ];

            const plan = service.assignAgents(tasks, agents);

            expect(plan.assignments).toHaveLength(2);
        });

        it('should calculate total cost correctly', () => {
            const tasks = [
                createTask({ id: 'task-1' }),
                createTask({ id: 'task-2' }),
            ];
            const agents = [
                createAgent(1, { pricing: { price: 100000n, token: 'USDC-350c4e', tokenNonce: 0 } }),
                createAgent(2, { pricing: { price: 200000n, token: 'USDC-350c4e', tokenNonce: 0 } }),
            ];

            const plan = service.assignAgents(tasks, agents);

            expect(plan.totalCost.amount).toBeGreaterThan(0n);
        });

        it('should respect budget constraints', () => {
            const tasks = [createTask()];
            const agents = [
                createAgent(1, {
                    pricing: { price: 500000n, token: 'USDC-350c4e', tokenNonce: 0 },
                    reputation: { score: 95, totalJobs: 1000, successRate: 1 },
                }),
                createAgent(2, {
                    pricing: { price: 50000n, token: 'USDC-350c4e', tokenNonce: 0 },
                    reputation: { score: 60, totalJobs: 20, successRate: 0.8 },
                }),
            ];

            const plan = service.assignAgents(tasks, agents, { maxBudget: '100000' });

            expect(plan.assignments[0].agentNonce).toBe(2); // Only one within budget
        });

        it('should include alternative agents', () => {
            const tasks = [createTask()];
            const agents = [
                createAgent(1, { reputation: { score: 95, totalJobs: 500, successRate: 0.99 } }),
                createAgent(2, { reputation: { score: 88, totalJobs: 200, successRate: 0.95 } }),
                createAgent(3, { reputation: { score: 70, totalJobs: 50, successRate: 0.90 } }),
            ];

            const plan = service.assignAgents(tasks, agents);

            expect(plan.assignments[0].alternativeAgents.length).toBeGreaterThan(0);
        });
    });

    describe('determineExecutionStrategy', () => {
        it('should detect parallel flow (no dependencies)', () => {
            const tasks = [
                createTask({ id: 'task-1', dependencies: [] }),
                createTask({ id: 'task-2', dependencies: [] }),
                createTask({ id: 'task-3', dependencies: [] }),
            ];
            expect(service.determineExecutionStrategy(tasks)).toBe('parallel');
        });

        it('should detect sequential flow (linear chain)', () => {
            const tasks = [
                createTask({ id: 'task-1', dependencies: [] }),
                createTask({ id: 'task-2', dependencies: ['task-1'] }),
                createTask({ id: 'task-3', dependencies: ['task-2'] }),
            ];
            expect(service.determineExecutionStrategy(tasks)).toBe('sequential');
        });

        it('should detect DAG flow (mixed dependencies)', () => {
            const tasks = [
                createTask({ id: 'task-1', dependencies: [] }),
                createTask({ id: 'task-2', dependencies: ['task-1'] }),
                createTask({ id: 'task-3', dependencies: ['task-1', 'task-2'] }),
            ];
            expect(service.determineExecutionStrategy(tasks)).toBe('dag');
        });

        it('should return sequential for single task', () => {
            const tasks = [createTask()];
            expect(service.determineExecutionStrategy(tasks)).toBe('sequential');
        });
    });
});
