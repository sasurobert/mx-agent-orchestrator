// ====================================
// Router Controller — POST /api/route
// ====================================

import { Router, Request, Response } from 'express';
import { RouterService } from './router.service';
import { DiscoveryService } from '../discovery';
import { DecomposedTask, AgentCandidate } from '../types';

export function createRouterRouter(
    routerService: RouterService,
    discoveryService: DiscoveryService,
    agentProvider: { getAgents: () => Promise<AgentCandidate[]> },
): Router {
    const router = Router();

    router.post('/route', async (req: Request, res: Response) => {
        try {
            const { tasks, preferences } = req.body;

            if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
                res.status(400).json({ error: 'Missing or invalid "tasks" array.' });
                return;
            }

            // Discover agents for all required skills
            const allSkills = [...new Set(tasks.flatMap((t: DecomposedTask) => t.requiredSkills))];
            const allAgents = await agentProvider.getAgents();
            const candidates = discoveryService.filterAgents(allAgents, { skills: [] }); // Get all, router will filter by skill per task

            const plan = routerService.assignAgents(tasks, candidates, preferences);

            // Serialize BigInt values for JSON
            res.json({
                ...plan,
                assignments: plan.assignments.map((a) => ({
                    ...a,
                    price: a.price.toString(),
                })),
                totalCost: {
                    ...plan.totalCost,
                    amount: plan.totalCost.amount.toString(),
                },
                batchTransaction: {
                    ...plan.batchTransaction,
                    totalValue: plan.batchTransaction.totalValue.toString(),
                },
            });
        } catch (err) {
            console.error('[Router Error]', err);
            res.status(500).json({ error: 'Failed to route tasks' });
        }
    });

    return router;
}
