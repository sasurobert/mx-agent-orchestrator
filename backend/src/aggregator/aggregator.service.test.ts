// ====================================
// Aggregator Service — TDD Tests
// ====================================

import { AggregatorService } from './aggregator.service';
import { LLMProvider, LLMMessage, LLMResponse, LLMStructuredResponse } from '../llm';
import { AgentResult } from '../types';

class MockLLMProvider implements LLMProvider {
    async generateText(messages: LLMMessage[]): Promise<LLMResponse> {
        return { content: 'Merged summary of all results.' };
    }

    async generateStructured<T>(
        messages: LLMMessage[],
        _schema: Record<string, unknown>,
    ): Promise<LLMStructuredResponse<T>> {
        return {
            data: { mergedOutput: 'Merged summary.' } as T,
            raw: '{}',
        };
    }
}

describe('AggregatorService', () => {
    let service: AggregatorService;

    beforeEach(() => {
        service = new AggregatorService(new MockLLMProvider());
    });

    describe('aggregateResults', () => {
        it('should merge multiple agent results into a single response', async () => {
            const results: AgentResult[] = [
                {
                    taskId: 'task-1',
                    agentNonce: 1,
                    status: 'completed',
                    result: 'Top 5 AI tools: 1. Cursor, 2. Copilot...',
                    latencyMs: 3200,
                },
                {
                    taskId: 'task-2',
                    agentNonce: 2,
                    status: 'completed',
                    result: '| Tool | Price |...',
                    latencyMs: 1800,
                },
            ];

            const aggregated = await service.aggregateResults(
                'req-123',
                'Find AI coding assistants',
                results,
            );

            expect(aggregated.requestId).toBe('req-123');
            expect(aggregated.originalRequest).toBe('Find AI coding assistants');
            expect(aggregated.results).toHaveLength(2);
            expect(aggregated.agentsUsed).toBe(2);
            expect(aggregated.totalLatency).toBe(5000); // sum of latencies
            expect(aggregated.mergedOutput).toBeDefined();
            expect(aggregated.mergedOutput.length).toBeGreaterThan(0);
        });

        it('should handle partial failures gracefully', async () => {
            const results: AgentResult[] = [
                {
                    taskId: 'task-1',
                    agentNonce: 1,
                    status: 'completed',
                    result: 'Success result',
                    latencyMs: 2000,
                },
                {
                    taskId: 'task-2',
                    agentNonce: 2,
                    status: 'failed',
                    latencyMs: 5000,
                },
            ];

            const aggregated = await service.aggregateResults('req-456', 'Test', results);

            expect(aggregated.results).toHaveLength(2);
            expect(aggregated.agentsUsed).toBe(2);
            // Should still produce a merged output
            expect(aggregated.mergedOutput).toBeDefined();
        });

        it('should handle all failures', async () => {
            const results: AgentResult[] = [
                { taskId: 'task-1', agentNonce: 1, status: 'failed', latencyMs: 5000 },
                { taskId: 'task-2', agentNonce: 2, status: 'timeout', latencyMs: 30000 },
            ];

            const aggregated = await service.aggregateResults('req-789', 'Test', results);

            expect(aggregated.agentsUsed).toBe(2);
            expect(aggregated.mergedOutput).toContain('failed');
        });
    });

    describe('getCompletedResults', () => {
        it('should filter only completed results', () => {
            const results: AgentResult[] = [
                { taskId: 'task-1', agentNonce: 1, status: 'completed', result: 'Done' },
                { taskId: 'task-2', agentNonce: 2, status: 'failed' },
                { taskId: 'task-3', agentNonce: 3, status: 'completed', result: 'Also done' },
            ];

            const completed = service.getCompletedResults(results);

            expect(completed).toHaveLength(2);
            expect(completed.map((r) => r.taskId)).toEqual(['task-1', 'task-3']);
        });
    });
});
