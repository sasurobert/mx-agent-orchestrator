// ====================================
// Task Decomposer Types (Spec §3.1)
// ====================================

export interface DecomposedTask {
    id: string;
    description: string;
    requiredSkills: string[];
    requiredDomains: string[];
    estimatedComplexity: 'low' | 'medium' | 'high';
    dependencies: string[];
    priority: number;
    inputData?: Record<string, unknown>;
}

export interface DecompositionResult {
    originalRequest: string;
    tasks: DecomposedTask[];
    estimatedTotalCost: {
        min: number;
        max: number;
        currency: string;
    };
    parallelizable: boolean;
    suggestedFlow: 'parallel' | 'sequential' | 'dag';
}

export interface DecomposeRequest {
    request: string;
    context?: string;
}
