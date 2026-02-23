const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`API ${res.status}: ${body}`);
    }

    return res.json();
}

// ---- Health ----
export function healthCheck() {
    return request<{ status: string; service: string }>('/health');
}

// ---- Decomposer ----
export function decompose(requestText: string, context?: string) {
    return request<{
        originalRequest: string;
        tasks: Array<{
            id: string;
            description: string;
            requiredSkills: string[];
            estimatedComplexity: string;
            dependencies: string[];
        }>;
        estimatedTotalCost: { min: number; max: number; currency: string };
        suggestedFlow: string;
    }>('/api/decompose', {
        method: 'POST',
        body: JSON.stringify({ request: requestText, context }),
    });
}

// ---- Discovery ----
export function getAgents(query?: {
    skills?: string[];
    minReputation?: number;
    sortBy?: string;
}) {
    const params = new URLSearchParams();
    if (query?.skills?.length) params.set('skills', query.skills.join(','));
    if (query?.minReputation) params.set('minReputation', String(query.minReputation));
    if (query?.sortBy) params.set('sortBy', query.sortBy);

    const qs = params.toString();
    return request<{ agents: unknown[]; totalMatching: number }>(
        `/api/agents${qs ? `?${qs}` : ''}`,
    );
}

// ---- Router ----
export function routeTasks(tasks: unknown[], agents: unknown[], preferences?: { maxBudget?: string }) {
    return request<{
        assignments: unknown[];
        totalCost: { amount: string; token: string; formattedAmount: string };
        executionStrategy: string;
    }>('/api/route', {
        method: 'POST',
        body: JSON.stringify({ tasks, agents, preferences }),
    });
}
