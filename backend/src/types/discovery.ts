// ====================================
// Agent Discovery Types (Spec §3.2)
// ====================================

export interface AgentManifest {
    name: string;
    version: string;
    description: string;
    skills: string[];
    domains: string[];
    endpoints: Record<string, string>;
}

export interface AgentCandidate {
    nonce: number;
    name: string;
    owner: string;
    uri: string;
    manifest: AgentManifest;
    reputation: {
        score: number;
        totalJobs: number;
        successRate: number;
    };
    pricing: {
        price: bigint;
        token: string;
        tokenNonce: number;
    };
    services: AgentService[];
    lastActive: number;
    responseTime: number;
}

export interface AgentService {
    id: string;
    protocol: 'mcp' | 'a2a' | 'acp' | 'x402' | 'ucp';
    endpoint: string;
    description: string;
}

export interface DiscoveryQuery {
    skills: string[];
    domains?: string[];
    minReputation?: number;
    maxPrice?: bigint;
    preferredToken?: string;
    limit?: number;
    sortBy?: 'reputation' | 'price' | 'speed' | 'best_value';
}

export interface DiscoveryResult {
    agents: AgentCandidate[];
    totalMatching: number;
}
