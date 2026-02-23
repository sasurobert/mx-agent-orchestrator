// ====================================
// Task Decomposer Service
// LLM-powered decomposition of user requests into atomic sub-tasks
// ====================================

import { LLMProvider } from '../llm';
import { DecomposedTask, DecompositionResult, DecomposeRequest } from '../types';

const SYSTEM_PROMPT = `You are a task decomposer for the MultiversX Agent Orchestrator.

Your job is to decompose a user's natural-language request into atomic, assignable sub-tasks that can be executed by specialized agents.

For each sub-task you produce, specify:
- A unique ID (e.g. "task-1", "task-2")
- A clear description of what the agent should do
- Required skills using OASF categories (e.g. "retrieval_augmented_generation", "translation", "data_analysis", "content_writing", "data_visualization", "code_review", "question_answering")
- Required domains (e.g. "technology", "finance_and_business", "language", "marketing")
- Estimated complexity: "low", "medium", or "high"
- Dependencies: IDs of tasks that must complete before this one starts
- Priority: 1 = highest

Also determine:
- estimatedTotalCost: { min, max, currency: "USDC" } — rough estimate
- parallelizable: true if ALL tasks can run simultaneously (no dependencies)
- suggestedFlow: "parallel" (all independent), "sequential" (linear chain), or "dag" (mixed dependencies)

Return a JSON object matching this schema:
{
  "tasks": [{ "id", "description", "requiredSkills", "requiredDomains", "estimatedComplexity", "dependencies", "priority" }],
  "estimatedTotalCost": { "min": number, "max": number, "currency": "USDC" },
  "parallelizable": boolean,
  "suggestedFlow": "parallel" | "sequential" | "dag"
}`;

interface DecomposerLLMResponse {
    tasks: DecomposedTask[];
    estimatedTotalCost: { min: number; max: number; currency: string };
    parallelizable: boolean;
    suggestedFlow: 'parallel' | 'sequential' | 'dag';
}

export class DecomposerService {
    constructor(private readonly llm: LLMProvider) { }

    async decompose(request: DecomposeRequest): Promise<DecompositionResult> {
        this.validateRequest(request);

        const userContent = request.context
            ? `User Request: ${request.request}\n\nAdditional Context: ${request.context}`
            : `User Request: ${request.request}`;

        const response = await this.llm.generateStructured<DecomposerLLMResponse>(
            [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userContent },
            ],
            {}, // schema hint (provider-specific)
        );

        return {
            originalRequest: request.request,
            tasks: response.data.tasks,
            estimatedTotalCost: response.data.estimatedTotalCost,
            parallelizable: response.data.parallelizable,
            suggestedFlow: response.data.suggestedFlow,
        };
    }

    private validateRequest(request: DecomposeRequest): void {
        if (!request.request || request.request.trim().length < 3) {
            throw new Error('Request must be at least 3 characters long');
        }
    }
}
