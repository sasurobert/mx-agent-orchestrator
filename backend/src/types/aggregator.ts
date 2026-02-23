// ====================================
// Result Aggregator Types (Spec §3.5)
// ====================================

export type AgentResultStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'timeout';

export interface AgentResult {
    taskId: string;
    agentNonce: number;
    status: AgentResultStatus;
    result?: unknown;
    proofHash?: string;
    completedAt?: number;
    latencyMs?: number;
}

export interface AggregatedResponse {
    requestId: string;
    originalRequest: string;
    results: AgentResult[];
    mergedOutput: string;
    totalCost: string;
    totalLatency: number;
    agentsUsed: number;
    proofLinks: string[];
}

export type SSEEventType = 'task_started' | 'task_progress' | 'task_completed' | 'aggregation_complete';

export interface SSEEvent {
    type: SSEEventType;
    taskId?: string;
    agentName?: string;
    progress?: number;
    result?: unknown;
    mergedOutput?: string;
}
