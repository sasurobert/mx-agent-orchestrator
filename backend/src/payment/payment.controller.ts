import { Router, Request, Response } from 'express';
import { PaymentService } from './payment.service';

export function createPaymentRouter(service: PaymentService): Router {
    const router = Router();

    router.post('/payment/prepare', async (req: Request, res: Response) => {
        try {
            const { routingPlan, senderAddress } = req.body;
            if (!routingPlan || !senderAddress) {
                res.status(400).json({ error: 'Missing routingPlan or senderAddress' });
                return;
            }
            const result = service.preparePayment({ routingPlan, senderAddress });
            res.json(result);
        } catch (err) {
            console.error('[Payment Error]', err);
            res.status(500).json({ error: 'Failed to prepare payment' });
        }
    });

    router.post('/payment/confirm', async (req: Request, res: Response) => {
        try {
            const { batchPayment, signatures } = req.body;
            if (!batchPayment || !signatures) {
                res.status(400).json({ error: 'Missing batchPayment or signatures' });
                return;
            }
            // TODO: Submit to blockchain / facilitator
            res.json({
                success: true,
                txHashes: batchPayment.jobIds.map(() => `mock_tx_${Date.now()}`),
                jobIds: batchPayment.jobIds,
            });
        } catch (err) {
            console.error('[Payment Error]', err);
            res.status(500).json({ error: 'Failed to confirm payment' });
        }
    });

    return router;
}
