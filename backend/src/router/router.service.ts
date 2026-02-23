// ====================================
// Job Router Service
// RICE-based agent assignment + DAG execution planning
// ====================================

import { DecomposedTask, AgentCandidate, RoutingPlan, TaskAssignment, RoutingPreferences } from '../types';
import { calculateAgentScore } from './scoring';

export class RouterService {
    /**
     * Assign the best agent to each task based on RICE scoring.
     */
    assignAgents(
        tasks: DecomposedTask[],
        agents: AgentCandidate[],
        preferences?: RoutingPreferences,
    ): RoutingPlan {
        const maxPrice = agents.reduce(
            (max, a) => (a.pricing.price > max ? a.pricing.price : max),
            0n,
        ) || 1n;
        const maxResponseTime = Math.max(...agents.map((a) => a.responseTime), 1);

        // Score all agents
        const agentScores = agents.map((agent) => ({
            agent,
            score: calculateAgentScore({
                reputationScore: agent.reputation.score,
                price: agent.pricing.price,
                maxPriceInCategory: maxPrice,
                avgResponseTime: agent.responseTime,
                maxResponseTime,
                lastActiveTimestamp: agent.lastActive,
            }).total,
        }));

        // Apply budget filter
        let availableAgents = agentScores;
        if (preferences?.maxBudget) {
            const budget = BigInt(preferences.maxBudget);
            availableAgents = agentScores.filter((a) => a.agent.pricing.price <= budget);
        }

        // Sort by score descending
        availableAgents.sort((a, b) => b.score - a.score);

        // Assign best agent to each task
        const assignments: TaskAssignment[] = tasks.map((task) => {
            // Find agents matching the task's required skills
            const matching = availableAgents.filter((a) =>
                task.requiredSkills.every((skill) => a.agent.manifest.skills.includes(skill)),
            );

            // Fall back to all agents if no skill match
            const candidates = matching.length > 0 ? matching : availableAgents;
            const selected = candidates[0]?.agent ?? agents[0];
            const alternatives = candidates.slice(1, 4).map((a) => a.agent.nonce);

            return {
                taskId: task.id,
                agentNonce: selected.nonce,
                agentName: selected.name,
                price: selected.pricing.price,
                token: selected.pricing.token,
                reasoning: `Selected based on RICE score. Reputation: ${selected.reputation.score}/100, Price: ${selected.pricing.price.toString()}`,
                alternativeAgents: alternatives,
            };
        });

        // Calculate total cost
        const totalAmount = assignments.reduce((sum, a) => sum + a.price, 0n);

        return {
            assignments,
            totalCost: {
                amount: totalAmount,
                token: assignments[0]?.token ?? 'USDC-350c4e',
                formattedAmount: this.formatAmount(totalAmount),
            },
            estimatedCompletionTime: this.estimateCompletionTime(tasks, agents),
            executionStrategy: this.determineExecutionStrategy(tasks),
            batchTransaction: {
                transactions: [],
                totalValue: totalAmount,
                receiver: '',
                data: '',
            },
        };
    }

    /**
     * Determine execution strategy from task dependencies.
     */
    determineExecutionStrategy(tasks: DecomposedTask[]): 'parallel' | 'sequential' | 'dag' {
        if (tasks.length <= 1) return 'sequential';

        const allNoDeps = tasks.every((t) => t.dependencies.length === 0);
        if (allNoDeps) return 'parallel';

        // Check if it's a clean linear chain
        const isLinear = tasks.every((t, i) => {
            if (i === 0) return t.dependencies.length === 0;
            return t.dependencies.length === 1 && t.dependencies[0] === tasks[i - 1].id;
        });
        if (isLinear) return 'sequential';

        return 'dag';
    }

    private formatAmount(amount: bigint): string {
        const decimals = 6; // USDC has 6 decimals
        const whole = amount / BigInt(10 ** decimals);
        const frac = amount % BigInt(10 ** decimals);
        const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '') || '0';
        return `${whole}.${fracStr} USDC`;
    }

    private estimateCompletionTime(tasks: DecomposedTask[], agents: AgentCandidate[]): number {
        const avgResponseTime = agents.length > 0
            ? agents.reduce((sum, a) => sum + a.responseTime, 0) / agents.length
            : 5000;

        const complexityMultiplier = {
            low: 1,
            medium: 2,
            high: 4,
        };

        // For parallel: max(task times), for sequential: sum(task times)
        const taskTimes = tasks.map(
            (t) => avgResponseTime * complexityMultiplier[t.estimatedComplexity],
        );

        const allParallel = tasks.every((t) => t.dependencies.length === 0);
        return allParallel ? Math.max(...taskTimes) : taskTimes.reduce((sum, t) => sum + t, 0);
    }
}
