// ====================================
// Payment Service — TDD Tests
// ====================================

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
    let service: PaymentService;

    beforeEach(() => {
        service = new PaymentService('D', 'http://localhost:4000');
    });

    describe('preparePayment', () => {
        it('should construct x402 payloads for each assignment', () => {
            const result = service.preparePayment({
                routingPlan: {
                    assignments: [
                        { taskId: 'task-1', agentNonce: 1, price: '250000', token: 'USDC-350c4e' },
                        { taskId: 'task-2', agentNonce: 2, price: '100000', token: 'USDC-350c4e' },
                    ],
                    totalCost: { amount: '350000', token: 'USDC-350c4e' },
                },
                senderAddress: 'erd1sender',
            });

            expect(result.payments).toHaveLength(2);
            expect(result.totalAmount).toBe('350000');
            expect(result.jobIds).toHaveLength(2);
            expect(result.facilitatorUrl).toBe('http://localhost:4000');
        });

        it('should generate unique job IDs', () => {
            const result = service.preparePayment({
                routingPlan: {
                    assignments: [
                        { taskId: 'task-1', agentNonce: 1, price: '100', token: 'USDC-350c4e' },
                        { taskId: 'task-2', agentNonce: 2, price: '100', token: 'USDC-350c4e' },
                    ],
                    totalCost: { amount: '200', token: 'USDC-350c4e' },
                },
                senderAddress: 'erd1sender',
            });

            const uniqueIds = new Set(result.jobIds);
            expect(uniqueIds.size).toBe(2);
        });

        it('should set x402 payload fields correctly', () => {
            const result = service.preparePayment({
                routingPlan: {
                    assignments: [
                        { taskId: 'task-1', agentNonce: 1, price: '100000', token: 'USDC-350c4e' },
                    ],
                    totalCost: { amount: '100000', token: 'USDC-350c4e' },
                },
                senderAddress: 'erd1sender',
            });

            const payload = result.payments[0];
            expect(payload.scheme).toBe('exact');
            expect(payload.payload.sender).toBe('erd1sender');
            expect(payload.payload.chainID).toBe('D');
            expect(payload.payload.version).toBe(1);
            expect(payload.payload.options).toBe(0);
            expect(payload.requirements.network).toBe('multiversx:D');
            expect(payload.requirements.asset).toBe('USDC-350c4e');
            expect(payload.requirements.extra.assetTransferMethod).toBe('esdt');
        });
    });

    describe('calculateTotal', () => {
        it('should sum all assignment prices', () => {
            const total = service.calculateTotal([
                { price: '100000' },
                { price: '200000' },
                { price: '50000' },
            ] as Array<{ price: string }>);

            expect(total).toBe('350000');
        });

        it('should handle empty assignments', () => {
            expect(service.calculateTotal([])).toBe('0');
        });
    });
});
