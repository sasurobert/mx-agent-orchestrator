// ====================================
// Result Aggregator Service
// Collects results from multiple agents, merges via LLM
// ====================================

import { LLMProvider } from '../llm';
import { AgentResult, AggregatedResponse } from '../types';

export class AggregatorService {
    constructor(private readonly llm: LLMProvider) { }

    /**
     * Aggregate multiple agent results into a single cohesive response.
     */
    async aggregateResults(
        requestId: string,
        originalRequest: string,
        results: AgentResult[],
    ): Promise<AggregatedResponse> {
        const completed = this.getCompletedResults(results);
        const totalLatency = results.reduce((sum, r) => sum + (r.latencyMs ?? 0), 0);

        let mergedOutput: string;

        if (completed.length === 0) {
            mergedOutput = 'All agent tasks failed or timed out. No results to merge.';
        } else if (completed.length === 1) {
            mergedOutput = String(completed[0].result ?? '');
        } else {
            mergedOutput = await this.mergeWithLLM(originalRequest, completed);
        }

        return {
            requestId,
            originalRequest,
            results,
            mergedOutput,
            totalCost: '0', // Calculated by payment module
            totalLatency,
            agentsUsed: results.length,
            proofLinks: results
                .filter((r) => r.proofHash)
                .map((r) => `https://explorer.multiversx.com/transactions/${r.proofHash}`),
        };
    }

    /**
     * Filter only completed results.
     */
    getCompletedResults(results: AgentResult[]): AgentResult[] {
        return results.filter((r) => r.status === 'completed');
    }

    private async mergeWithLLM(
        originalRequest: string,
        completedResults: AgentResult[],
    ): Promise<string> {
        const resultsSummary = completedResults
            .map((r, i) => `--- Result ${i + 1} (Task: ${r.taskId}, Agent: ${r.agentNonce}) ---\n${String(r.result ?? 'No output')}`)
            .join('\n\n');

        const response = await this.llm.generateText([
            {
                role: 'system',
                content:
                    'You are a result aggregator. Merge the following agent results into a single, cohesive, well-structured response. Preserve key information from all sources. Use clear formatting.',
            },
            {
                role: 'user',
                content: `Original request: "${originalRequest}"\n\nAgent results:\n${resultsSummary}\n\nMerge these into a single comprehensive response.`,
            },
        ]);

        return response.content;
    }
}
