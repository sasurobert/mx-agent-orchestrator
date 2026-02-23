// ====================================
// Decomposer Controller — POST /api/decompose
// ====================================

import { Router, Request, Response } from 'express';
import { DecomposerService } from './decomposer.service';

export function createDecomposerRouter(service: DecomposerService): Router {
    const router = Router();

    router.post('/decompose', async (req: Request, res: Response) => {
        try {
            const { request: userRequest, context } = req.body;

            if (!userRequest || typeof userRequest !== 'string') {
                res.status(400).json({
                    error: 'Missing or invalid "request" field. Must be a non-empty string.',
                });
                return;
            }

            const result = await service.decompose({
                request: userRequest,
                context,
            });

            res.json(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            if (message.includes('at least')) {
                res.status(400).json({ error: message });
                return;
            }
            console.error('[Decomposer Error]', message);
            res.status(500).json({ error: 'Failed to decompose request' });
        }
    });

    return router;
}
