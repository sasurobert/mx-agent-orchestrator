import { Router, Request, Response } from 'express';
import { AggregatorService } from './aggregator.service';
import { AgentResult, SSEEvent } from '../types';

export function createAggregatorRouter(service: AggregatorService): Router {
    const router = Router();

    // SSE stream for live job tracking
    router.get('/jobs/:requestId/stream', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // Send initial connected event
        const event: SSEEvent = { type: 'task_started', taskId: req.params.requestId as string };
        res.write(`data: ${JSON.stringify(event)}\n\n`);

        // Keep connection alive
        const keepAlive = setInterval(() => {
            res.write(': keepalive\n\n');
        }, 15000);

        req.on('close', () => {
            clearInterval(keepAlive);
        });
    });

    // Get final aggregated result
    router.get('/jobs/:id/result', async (req: Request, res: Response) => {
        try {
            // TODO: Retrieve from job store
            res.status(404).json({ error: 'Job not found or still in progress' });
        } catch (err) {
            console.error('[Aggregator Error]', err);
            res.status(500).json({ error: 'Failed to get job result' });
        }
    });

    return router;
}
