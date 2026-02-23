import { Router, Request, Response } from 'express';
import { FeedbackService } from './feedback.service';

export function createFeedbackRouter(service: FeedbackService): Router {
    const router = Router();

    router.post('/feedback', async (req: Request, res: Response) => {
        try {
            const { requestId, overallRating, agentRatings } = req.body;
            if (!requestId || overallRating === undefined) {
                res.status(400).json({ error: 'Missing requestId or overallRating' });
                return;
            }
            // TODO: Submit to ReputationRegistry on-chain
            res.json({
                success: true,
                requestId,
                overallRating,
                agentRatings: agentRatings ?? {},
            });
        } catch (err) {
            console.error('[Feedback Error]', err);
            res.status(500).json({ error: 'Failed to submit feedback' });
        }
    });

    return router;
}
