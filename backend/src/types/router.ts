// ====================================
// Job Router Types (Spec §3.3)
// ====================================

export interface TaskAssignment {
    taskId: string;
    agentNonce: number;
    agentName: string;
    price: bigint;
    token: string;
    reasoning: string;
    alternativeAgents: number[];
}

export interface BatchTransactionData {
    transactions: TransactionPayload[];
    totalValue: bigint;
    receiver: string;
    data: string;
}

export interface TransactionPayload {
    nonce: number;
    value: string;
    receiver: string;
    sender: string;
    gasPrice: number;
    gasLimit: number;
    data: string;
    chainID: string;
    version: number;
    options: number;
}

export interface RoutingPlan {
    assignments: TaskAssignment[];
    totalCost: {
        amount: bigint;
        token: string;
        formattedAmount: string;
    };
    estimatedCompletionTime: number;
    executionStrategy: 'parallel' | 'sequential' | 'dag';
    batchTransaction: BatchTransactionData;
}

export interface RoutingPreferences {
    maxBudget?: string;
    preferSpeed?: boolean;
}
