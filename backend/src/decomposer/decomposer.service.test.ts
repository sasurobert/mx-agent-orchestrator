// ====================================
// Decomposer Service — TDD Tests
// RED → GREEN → REFACTOR
// ====================================

import { DecomposerService } from './decomposer.service';
import { LLMProvider, LLMMessage, LLMResponse, LLMStructuredResponse } from '../llm';
import { DecompositionResult } from '../types';

// ---- Mock LLM Provider ----
class MockLLMProvider implements LLMProvider {
    public lastMessages: LLMMessage[] = [];
    public mockResponse: unknown = {};

    async generateText(messages: LLMMessage[]): Promise<LLMResponse> {
        this.lastMessages = messages;
        return { content: JSON.stringify(this.mockResponse) };
    }

    async generateStructured<T>(
        messages: LLMMessage[],
        _schema: Record<string, unknown>,
    ): Promise<LLMStructuredResponse<T>> {
        this.lastMessages = messages;
        return {
            data: this.mockResponse as T,
            raw: JSON.stringify(this.mockResponse),
        };
    }
}

describe('DecomposerService', () => {
    let service: DecomposerService;
    let mockLLM: MockLLMProvider;

    beforeEach(() => {
        mockLLM = new MockLLMProvider();
        service = new DecomposerService(mockLLM);
    });

    // ---- Simple Request Flow ----

    describe('Simple request (single sequential flow)', () => {
        it('should decompose a simple request into sequential tasks', async () => {
            mockLLM.mockResponse = {
                tasks: [
                    {
                        id: 'task-1',
                        description: 'Research AI coding assistants',
                        requiredSkills: ['retrieval_augmented_generation'],
                        requiredDomains: ['technology'],
                        estimatedComplexity: 'medium',
                        dependencies: [],
                        priority: 1,
                    },
                    {
                        id: 'task-2',
                        description: 'Create pricing comparison report',
                        requiredSkills: ['data_analysis'],
                        requiredDomains: ['technology'],
                        estimatedComplexity: 'low',
                        dependencies: ['task-1'],
                        priority: 2,
                    },
                ],
                estimatedTotalCost: { min: 0.25, max: 0.50, currency: 'USDC' },
                parallelizable: false,
                suggestedFlow: 'sequential',
            };

            const result = await service.decompose({
                request: 'Find the top 5 AI coding assistants and compare their pricing',
            });

            expect(result.originalRequest).toBe(
                'Find the top 5 AI coding assistants and compare their pricing',
            );
            expect(result.tasks).toHaveLength(2);
            expect(result.tasks[0].id).toBe('task-1');
            expect(result.tasks[0].requiredSkills).toContain('retrieval_augmented_generation');
            expect(result.tasks[1].dependencies).toContain('task-1');
            expect(result.suggestedFlow).toBe('sequential');
            expect(result.parallelizable).toBe(false);
        });
    });

    // ---- Parallel Multi-Agent Flow ----

    describe('Parallel multi-agent flow', () => {
        it('should decompose a translation request into parallel tasks', async () => {
            mockLLM.mockResponse = {
                tasks: [
                    {
                        id: 'task-1',
                        description: 'Translate document to Spanish',
                        requiredSkills: ['translation'],
                        requiredDomains: ['language'],
                        estimatedComplexity: 'low',
                        dependencies: [],
                        priority: 1,
                    },
                    {
                        id: 'task-2',
                        description: 'Translate document to French',
                        requiredSkills: ['translation'],
                        requiredDomains: ['language'],
                        estimatedComplexity: 'low',
                        dependencies: [],
                        priority: 1,
                    },
                    {
                        id: 'task-3',
                        description: 'Translate document to German',
                        requiredSkills: ['translation'],
                        requiredDomains: ['language'],
                        estimatedComplexity: 'low',
                        dependencies: [],
                        priority: 1,
                    },
                ],
                estimatedTotalCost: { min: 0.06, max: 0.12, currency: 'USDC' },
                parallelizable: true,
                suggestedFlow: 'parallel',
            };

            const result = await service.decompose({
                request: 'Translate this document to Spanish, French, and German',
            });

            expect(result.tasks).toHaveLength(3);
            expect(result.parallelizable).toBe(true);
            expect(result.suggestedFlow).toBe('parallel');
            // All tasks should have no dependencies (parallel)
            result.tasks.forEach((task) => {
                expect(task.dependencies).toHaveLength(0);
            });
        });
    });

    // ---- Complex DAG Flow ----

    describe('Complex DAG workflow', () => {
        it('should decompose into a DAG with correct dependencies', async () => {
            mockLLM.mockResponse = {
                tasks: [
                    {
                        id: 'task-1',
                        description: 'Research competitor pricing',
                        requiredSkills: ['retrieval_augmented_generation'],
                        requiredDomains: ['finance_and_business'],
                        estimatedComplexity: 'high',
                        dependencies: [],
                        priority: 1,
                    },
                    {
                        id: 'task-2',
                        description: 'Create comparison chart',
                        requiredSkills: ['data_visualization'],
                        requiredDomains: ['finance_and_business'],
                        estimatedComplexity: 'medium',
                        dependencies: ['task-1'],
                        priority: 2,
                    },
                    {
                        id: 'task-3',
                        description: 'Draft blog post',
                        requiredSkills: ['content_writing'],
                        requiredDomains: ['marketing'],
                        estimatedComplexity: 'medium',
                        dependencies: ['task-1', 'task-2'],
                        priority: 3,
                    },
                ],
                estimatedTotalCost: { min: 0.65, max: 1.00, currency: 'USDC' },
                parallelizable: false,
                suggestedFlow: 'dag',
            };

            const result = await service.decompose({
                request:
                    "Research my competitor's pricing, create a comparison chart, and draft a blog post about it",
            });

            expect(result.tasks).toHaveLength(3);
            expect(result.suggestedFlow).toBe('dag');
            // Task 1 has no deps
            expect(result.tasks[0].dependencies).toHaveLength(0);
            // Task 2 depends on task 1
            expect(result.tasks[1].dependencies).toContain('task-1');
            // Task 3 depends on task 1 AND task 2
            expect(result.tasks[2].dependencies).toContain('task-1');
            expect(result.tasks[2].dependencies).toContain('task-2');
        });
    });

    // ---- Edge Cases ----

    describe('Edge cases', () => {
        it('should handle context parameter', async () => {
            mockLLM.mockResponse = {
                tasks: [
                    {
                        id: 'task-1',
                        description: 'Answer question with context',
                        requiredSkills: ['question_answering'],
                        requiredDomains: [],
                        estimatedComplexity: 'low',
                        dependencies: [],
                        priority: 1,
                    },
                ],
                estimatedTotalCost: { min: 0.01, max: 0.05, currency: 'USDC' },
                parallelizable: false,
                suggestedFlow: 'sequential',
            };

            const result = await service.decompose({
                request: 'What is the revenue trend?',
                context: 'Company data: annual report 2025',
            });

            expect(result.tasks).toHaveLength(1);
            // Verify the context was passed to the LLM
            const userMessage = mockLLM.lastMessages.find((m) => m.role === 'user');
            expect(userMessage?.content).toContain('Company data: annual report 2025');
        });

        it('should preserve the original request in the result', async () => {
            mockLLM.mockResponse = {
                tasks: [],
                estimatedTotalCost: { min: 0, max: 0, currency: 'USDC' },
                parallelizable: false,
                suggestedFlow: 'sequential',
            };

            const result = await service.decompose({
                request: 'Test request',
            });

            expect(result.originalRequest).toBe('Test request');
        });

        it('should throw on LLM failure', async () => {
            mockLLM.generateStructured = async () => {
                throw new Error('LLM unavailable');
            };

            await expect(
                service.decompose({ request: 'Anything' }),
            ).rejects.toThrow('LLM unavailable');
        });

        it('should pass the system prompt to the LLM', async () => {
            mockLLM.mockResponse = {
                tasks: [],
                estimatedTotalCost: { min: 0, max: 0, currency: 'USDC' },
                parallelizable: false,
                suggestedFlow: 'sequential',
            };

            await service.decompose({ request: 'Some request' });

            const systemMessage = mockLLM.lastMessages.find((m) => m.role === 'system');
            expect(systemMessage).toBeDefined();
            expect(systemMessage?.content).toContain('decompose');
        });
    });

    // ---- Validation ----

    describe('Input validation', () => {
        it('should reject empty requests', async () => {
            await expect(service.decompose({ request: '' })).rejects.toThrow();
        });

        it('should reject requests that are too short', async () => {
            await expect(service.decompose({ request: 'hi' })).rejects.toThrow();
        });
    });
});
