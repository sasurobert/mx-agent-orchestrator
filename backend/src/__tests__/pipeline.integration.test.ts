// ====================================
// Pipeline Integration Test
// Full flow: Decompose → Discover → Route → Pay → Aggregate → Feedback
// ====================================

import { DecomposerService } from '../decomposer/decomposer.service';
import { DiscoveryService } from '../discovery/discovery.service';
import { RouterService } from '../router/router.service';
import { AggregatorService } from '../aggregator/aggregator.service';
import { FeedbackService } from '../feedback/feedback.service';
import { LLMProvider, LLMMessage, LLMResponse, LLMStructuredResponse } from '../llm';
import { AgentCandidate, AgentResult, DecomposedTask } from '../types';

// ---- Mock LLM that returns structured decompositions ----
class PipelineMockLLM implements LLMProvider {
    async generateText(messages: LLMMessage[]): Promise<LLMResponse> {
        return { content: 'Pipeline test aggregated result: All 3 sub-tasks completed successfully.' };
    }

    async generateStructured<T>(
        messages: LLMMessage[],
        _schema: Record<string, unknown>,
    ): Promise<LLMStructuredResponse<T>> {
        // Detect what the caller expects based on system prompt content
        const systemMsg = messages.find((m) => m.role === 'system')?.content ?? '';

        if (systemMsg.toLowerCase().includes('decompose')) {
            return {
                data: {
                    tasks: [
                        {
                            id: 'task-research',
                            description: 'Research AI coding tools',
                            requiredSkills: ['retrieval_augmented_generation'],
                            requiredDomains: ['technology'],
                            estimatedComplexity: 'medium',
                            dependencies: [],
                            priority: 1,
                        },
                        {
                            id: 'task-compare',
                            description: 'Compare pricing models',
                            requiredSkills: ['data_analysis'],
                            requiredDomains: ['technology'],
                            estimatedComplexity: 'low',
                            dependencies: ['task-research'],
                            priority: 2,
                        },
                        {
                            id: 'task-report',
                            description: 'Generate comparison report',
                            requiredSkills: ['content_writing'],
                            requiredDomains: ['technology'],
                            estimatedComplexity: 'low',
                            dependencies: ['task-compare'],
                            priority: 3,
                        },
                    ],
                    estimatedTotalCost: { min: 0.35, max: 0.50, currency: 'USDC' },
                    parallelizable: false,
                    suggestedFlow: 'sequential',
                } as T,
                raw: '{}',
            };
        }

        // Fallback for aggregation
        return {
            data: { mergedOutput: 'Merged: AI tools comparison report.' } as T,
            raw: '{}',
        };
    }
}

// ---- Test Agent Candidates ----
function createTestAgents(): AgentCandidate[] {
    return [
        {
            nonce: 1,
            name: 'ResearchBot',
            owner: 'erd1test-owner-1',
            uri: 'https://agent-1.test',
            manifest: {
                name: 'ResearchBot',
                version: '1.0.0',
                skills: ['retrieval_augmented_generation'],
                domains: ['technology'],
                endpoints: { execute: 'https://agent-1.test/execute' },
                description: 'Research specialist',
            },
            reputation: { score: 95, totalJobs: 4200, successRate: 98.5 },
            pricing: { price: 120000n, token: 'USDC-350c4e', tokenNonce: 0 },
            services: [],
            responseTime: 1500,
            lastActive: Date.now(),
        },
        {
            nonce: 2,
            name: 'DataForge',
            owner: 'erd1test-owner-2',
            uri: 'https://agent-2.test',
            manifest: {
                name: 'DataForge',
                version: '1.0.0',
                skills: ['data_analysis'],
                domains: ['technology', 'finance_and_business'],
                endpoints: { execute: 'https://agent-2.test/execute' },
                description: 'Data analysis specialist',
            },
            reputation: { score: 88, totalJobs: 2100, successRate: 94.2 },
            pricing: { price: 150000n, token: 'USDC-350c4e', tokenNonce: 0 },
            services: [],
            responseTime: 2000,
            lastActive: Date.now(),
        },
        {
            nonce: 3,
            name: 'ContentCraft',
            owner: 'erd1test-owner-3',
            uri: 'https://agent-3.test',
            manifest: {
                name: 'ContentCraft',
                version: '1.0.0',
                skills: ['content_writing'],
                domains: ['technology', 'marketing'],
                endpoints: { execute: 'https://agent-3.test/execute' },
                description: 'Content writing expert',
            },
            reputation: { score: 91, totalJobs: 6500, successRate: 97.1 },
            pricing: { price: 80000n, token: 'USDC-350c4e', tokenNonce: 0 },
            services: [],
            responseTime: 1800,
            lastActive: Date.now(),
        },
    ];
}

describe('Pipeline Integration Test', () => {
    let decomposer: DecomposerService;
    let discovery: DiscoveryService;
    let router: RouterService;
    let aggregator: AggregatorService;
    let feedback: FeedbackService;
    let mockLLM: PipelineMockLLM;
    let testAgents: AgentCandidate[];

    beforeEach(() => {
        mockLLM = new PipelineMockLLM();
        decomposer = new DecomposerService(mockLLM);
        discovery = new DiscoveryService();
        router = new RouterService();
        aggregator = new AggregatorService(mockLLM);
        feedback = new FeedbackService();
        testAgents = createTestAgents();
    });

    // =============================================
    // FULL PIPELINE: Decompose → Discover → Route → Aggregate → Feedback
    // =============================================
    it('should execute the full pipeline: decompose → discover → route → aggregate → feedback', async () => {
        // 1️⃣ DECOMPOSE — Break the request into 3 tasks
        const decomposition = await decomposer.decompose({
            request: 'Find and compare top 5 AI coding assistants and generate a pricing report',
        });

        expect(decomposition.tasks).toHaveLength(3);
        expect(decomposition.suggestedFlow).toBe('sequential');
        expect(decomposition.tasks[0].id).toBe('task-research');
        expect(decomposition.tasks[2].dependencies).toContain('task-compare');

        // 2️⃣ DISCOVER — Filter agents by required skills
        const tasks = decomposition.tasks;
        const allSkills = tasks.flatMap((t) => t.requiredSkills);
        const uniqueSkills = [...new Set(allSkills)];

        // For each skill, find matching agents
        const skillMatches = new Map<string, AgentCandidate[]>();
        for (const skill of uniqueSkills) {
            const matching = discovery.filterAgents(testAgents, { skills: [skill] });
            skillMatches.set(skill, matching);
        }

        expect(skillMatches.get('retrieval_augmented_generation')).toHaveLength(1);
        expect(skillMatches.get('data_analysis')).toHaveLength(1);
        expect(skillMatches.get('content_writing')).toHaveLength(1);

        // 3️⃣ ROUTE — Assign agents via RICE scoring
        const plan = router.assignAgents(tasks, testAgents);

        expect(plan.assignments).toHaveLength(3);
        expect(plan.executionStrategy).toBe('sequential');
        // ResearchBot should be assigned to the RAG task
        const researchAssignment = plan.assignments.find((a) => a.taskId === 'task-research');
        expect(researchAssignment?.agentNonce).toBe(1); // ResearchBot has the right skill
        // DataForge should be assigned to analysis task
        const compareAssignment = plan.assignments.find((a) => a.taskId === 'task-compare');
        expect(compareAssignment?.agentNonce).toBe(2); // DataForge has data_analysis
        // ContentCraft should be assigned to report task
        const reportAssignment = plan.assignments.find((a) => a.taskId === 'task-report');
        expect(reportAssignment?.agentNonce).toBe(3); // ContentCraft has content_writing

        // Verify total cost
        expect(plan.totalCost.amount).toBe(350000n); // 120000 + 150000 + 80000
        expect(plan.totalCost.token).toBe('USDC-350c4e');

        // 4️⃣ AGGREGATE — Collect simulated results
        const agentResults: AgentResult[] = [
            {
                taskId: 'task-research',
                agentNonce: 1,
                status: 'completed',
                result: 'Top 5 tools: Cursor, Copilot, Codeium, Tabnine, Windsurf',
                latencyMs: 3200,
            },
            {
                taskId: 'task-compare',
                agentNonce: 2,
                status: 'completed',
                result: 'Pricing comparison table generated',
                latencyMs: 1800,
            },
            {
                taskId: 'task-report',
                agentNonce: 3,
                status: 'completed',
                result: 'Comprehensive AI coding assistants report ready',
                latencyMs: 2100,
            },
        ];

        const aggregated = await aggregator.aggregateResults(
            'pipeline-test-001',
            'Find and compare top 5 AI coding assistants',
            agentResults,
        );

        expect(aggregated.requestId).toBe('pipeline-test-001');
        expect(aggregated.results).toHaveLength(3);
        expect(aggregated.agentsUsed).toBe(3);
        expect(aggregated.totalLatency).toBe(7100);
        expect(aggregated.mergedOutput.length).toBeGreaterThan(0);

        // 5️⃣ FEEDBACK — Auto-rate each agent
        const feedbackSubmissions = agentResults.map((result) => {
            const rating = feedback.autoRate({
                status: result.status,
                latencyMs: result.latencyMs ?? 0,
                expectedLatencyMs: 5000,
                hasResult: !!result.result,
            });

            return {
                jobId: 'pipeline-test-001',
                agentNonce: result.agentNonce,
                rating,
                autoRated: true,
            };
        });

        expect(feedbackSubmissions).toHaveLength(3);
        // All completed successfully, should have high ratings (> 60)
        feedbackSubmissions.forEach((sub) => {
            expect(sub.rating).toBeGreaterThanOrEqual(60);
            expect(sub.autoRated).toBe(true);
        });

        // ResearchBot was slower (3200ms vs 5000ms expected) — rating should be good but not max
        const researchFeedback = feedbackSubmissions.find((s) => s.agentNonce === 1);
        expect(researchFeedback!.rating).toBeLessThanOrEqual(100);
        expect(researchFeedback!.rating).toBeGreaterThanOrEqual(70);
    });

    // =============================================
    // PARALLEL EXECUTION PATH
    // =============================================
    it('should handle parallel task decomposition through the full pipeline', async () => {
        // Override decomposer mock for parallel scenario
        const parallelLLM = new PipelineMockLLM();
        parallelLLM.generateStructured = async <T>(): Promise<LLMStructuredResponse<T>> => ({
            data: {
                tasks: [
                    { id: 'translate-es', description: 'Translate to Spanish', requiredSkills: ['content_writing'], requiredDomains: ['technology'], estimatedComplexity: 'low', dependencies: [], priority: 1 },
                    { id: 'translate-fr', description: 'Translate to French', requiredSkills: ['content_writing'], requiredDomains: ['technology'], estimatedComplexity: 'low', dependencies: [], priority: 1 },
                    { id: 'translate-de', description: 'Translate to German', requiredSkills: ['content_writing'], requiredDomains: ['technology'], estimatedComplexity: 'low', dependencies: [], priority: 1 },
                ],
                estimatedTotalCost: { min: 0.06, max: 0.12, currency: 'USDC' },
                parallelizable: true,
                suggestedFlow: 'parallel',
            } as T,
            raw: '{}',
        });

        const parallelDecomposer = new DecomposerService(parallelLLM);
        const decomposition = await parallelDecomposer.decompose({
            request: 'Translate docs to Spanish, French, and German',
        });

        expect(decomposition.parallelizable).toBe(true);
        expect(decomposition.suggestedFlow).toBe('parallel');

        // Route all 3 parallel tasks
        const plan = router.assignAgents(decomposition.tasks, testAgents);

        expect(plan.executionStrategy).toBe('parallel');
        expect(plan.assignments).toHaveLength(3);
    });

    // =============================================
    // FAILURE RECOVERY PATH
    // =============================================
    it('should handle agent failures gracefully in the pipeline', async () => {
        const tasks: DecomposedTask[] = [
            { id: 'task-1', description: 'Research', requiredSkills: ['retrieval_augmented_generation'], requiredDomains: [], estimatedComplexity: 'medium', dependencies: [], priority: 1 },
            { id: 'task-2', description: 'Analyze', requiredSkills: ['data_analysis'], requiredDomains: [], estimatedComplexity: 'low', dependencies: ['task-1'], priority: 2 },
        ];

        // Route tasks
        const plan = router.assignAgents(tasks, testAgents);
        expect(plan.assignments).toHaveLength(2);

        // Simulate mixed results
        const results: AgentResult[] = [
            { taskId: 'task-1', agentNonce: 1, status: 'completed', result: 'Found data', latencyMs: 2000 },
            { taskId: 'task-2', agentNonce: 2, status: 'failed', latencyMs: 5000 },
        ];

        const aggregated = await aggregator.aggregateResults('req-fail', 'Test', results);
        expect(aggregated.agentsUsed).toBe(2);
        expect(aggregated.mergedOutput).toBeDefined();

        // Feedback should reflect the failure
        const failedRating = feedback.autoRate({
            status: 'failed',
            latencyMs: 5000,
            expectedLatencyMs: 5000,
            hasResult: false,
        });
        expect(failedRating).toBe(0); // Failed agents get 0

        const successRating = feedback.autoRate({
            status: 'completed',
            latencyMs: 2000,
            expectedLatencyMs: 5000,
            hasResult: true,
        });
        expect(successRating).toBeGreaterThanOrEqual(70);
    });

    // =============================================
    // BUDGET-CONSTRAINED ROUTING
    // =============================================
    it('should respect budget constraints when routing', () => {
        const tasks: DecomposedTask[] = [
            { id: 'task-1', description: 'Task1', requiredSkills: ['data_analysis'], requiredDomains: [], estimatedComplexity: 'low', dependencies: [], priority: 1 },
        ];

        // Set a budget lower than the most expensive agent
        const plan = router.assignAgents(tasks, testAgents, {
            maxBudget: '100000', // Only ResearchBot (120k) and ContentCraft (80k) qualify; DataForge is 150k
        });

        expect(plan.assignments).toHaveLength(1);
        // Should pick ContentCraft (80k, under budget) since DataForge (150k) is over budget
        // but ContentCraft doesn't have data_analysis skill, so it depends on scoring fallback
        expect(plan.assignments[0].price).toBeLessThanOrEqual(100000n);
    });

    // =============================================
    // DISCOVERY SORTING VERIFICATION
    // =============================================
    it('should sort agents correctly by different criteria', () => {
        const byRep = discovery.sortAgents(testAgents, 'reputation');
        expect(byRep[0].name).toBe('ResearchBot'); // 95 reputation
        expect(byRep[2].name).toBe('DataForge'); // 88 reputation

        const byPrice = discovery.sortAgents(testAgents, 'price');
        expect(byPrice[0].name).toBe('ContentCraft'); // 80k price (cheapest)
        expect(byPrice[2].name).toBe('DataForge'); // 150k price (most expensive)

        const bySpeed = discovery.sortAgents(testAgents, 'speed');
        expect(bySpeed[0].name).toBe('ResearchBot'); // 1500ms (fastest)
        expect(bySpeed[2].name).toBe('DataForge'); // 2000ms (slowest)
    });

    // =============================================
    // USER OVERRIDE FEEDBACK PATH
    // =============================================
    it('should allow user override of auto-rated feedback', () => {
        const autoRating = feedback.autoRate({
            status: 'completed',
            latencyMs: 3000,
            expectedLatencyMs: 5000,
            hasResult: true,
        });

        const submission = {
            jobId: 'job-001',
            agentNonce: 1,
            rating: autoRating,
            autoRated: true,
        };

        // User disagrees and gives a lower rating
        const overridden = feedback.applyUserOverride(submission, 50);

        expect(overridden.rating).toBe(50);
        expect(overridden.autoRated).toBe(false);
        expect(overridden.userOverride).toBe(50);
    });

    // =============================================
    // EXECUTION STRATEGY DETECTION
    // =============================================
    it('should correctly detect execution strategies for different task graphs', () => {
        // Single task → sequential
        const single: DecomposedTask[] = [
            { id: 't1', description: '', requiredSkills: [], requiredDomains: [], estimatedComplexity: 'low', dependencies: [], priority: 1 },
        ];
        expect(router.determineExecutionStrategy(single)).toBe('sequential');

        // All independent → parallel
        const parallel: DecomposedTask[] = [
            { id: 't1', description: '', requiredSkills: [], requiredDomains: [], estimatedComplexity: 'low', dependencies: [], priority: 1 },
            { id: 't2', description: '', requiredSkills: [], requiredDomains: [], estimatedComplexity: 'low', dependencies: [], priority: 1 },
        ];
        expect(router.determineExecutionStrategy(parallel)).toBe('parallel');

        // Linear chain → sequential
        const linear: DecomposedTask[] = [
            { id: 't1', description: '', requiredSkills: [], requiredDomains: [], estimatedComplexity: 'low', dependencies: [], priority: 1 },
            { id: 't2', description: '', requiredSkills: [], requiredDomains: [], estimatedComplexity: 'low', dependencies: ['t1'], priority: 2 },
            { id: 't3', description: '', requiredSkills: [], requiredDomains: [], estimatedComplexity: 'low', dependencies: ['t2'], priority: 3 },
        ];
        expect(router.determineExecutionStrategy(linear)).toBe('sequential');

        // Diamond pattern → dag
        const dag: DecomposedTask[] = [
            { id: 't1', description: '', requiredSkills: [], requiredDomains: [], estimatedComplexity: 'low', dependencies: [], priority: 1 },
            { id: 't2', description: '', requiredSkills: [], requiredDomains: [], estimatedComplexity: 'low', dependencies: ['t1'], priority: 2 },
            { id: 't3', description: '', requiredSkills: [], requiredDomains: [], estimatedComplexity: 'low', dependencies: ['t1', 't2'], priority: 3 },
        ];
        expect(router.determineExecutionStrategy(dag)).toBe('dag');
    });
});
