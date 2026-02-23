// ====================================
// Discovery Controller — GET /api/agents/discover + /api/agents/:nonce
// ====================================

import { Router, Request, Response } from 'express';
import { DiscoveryService } from './discovery.service';
import { AgentCandidate, DiscoveryQuery } from '../types';

export function createDiscoveryRouter(
    service: DiscoveryService,
    agentProvider: { getAgents: () => Promise<AgentCandidate[]> },
): Router {
    const router = Router();

    router.get('/agents/discover', async (req: Request, res: Response) => {
        try {
            const query: DiscoveryQuery = {
                skills: req.query.skills
                    ? (req.query.skills as string).split(',')
                    : [],
                domains: req.query.domains
                    ? (req.query.domains as string).split(',')
                    : undefined,
                minReputation: req.query.minReputation
                    ? parseInt(req.query.minReputation as string, 10)
                    : undefined,
                maxPrice: req.query.maxPrice
                    ? BigInt(req.query.maxPrice as string)
                    : undefined,
                preferredToken: req.query.preferredToken as string | undefined,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string, 10)
                    : 10,
                sortBy: (req.query.sortBy as DiscoveryQuery['sortBy']) || 'best_value',
            };

            const allAgents = await agentProvider.getAgents();
            const filtered = service.filterAgents(allAgents, query);
            const sorted = service.sortAgents(filtered, query.sortBy);

            res.json({
                agents: sorted.map(serializeAgent),
                totalMatching: sorted.length,
            });
        } catch (err) {
            console.error('[Discovery Error]', err);
            res.status(500).json({ error: 'Failed to discover agents' });
        }
    });

    router.get('/agents/:nonce', async (req: Request, res: Response) => {
        try {
            const nonce = parseInt(req.params.nonce as string, 10);
            if (isNaN(nonce) || nonce < 0) {
                res.status(400).json({ error: 'Invalid agent nonce' });
                return;
            }

            const agents = await agentProvider.getAgents();
            const agent = agents.find((a) => a.nonce === nonce);

            if (!agent) {
                res.status(404).json({ error: `Agent with nonce ${nonce} not found` });
                return;
            }

            res.json(serializeAgent(agent));
        } catch (err) {
            console.error('[Discovery Error]', err);
            res.status(500).json({ error: 'Failed to get agent' });
        }
    });

    return router;
}

/** Serialize BigInt fields for JSON response */
function serializeAgent(agent: AgentCandidate): Record<string, unknown> {
    return {
        ...agent,
        pricing: {
            ...agent.pricing,
            price: agent.pricing.price.toString(),
        },
    };
}
