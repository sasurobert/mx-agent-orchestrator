// ====================================
// Payment Gateway Service
// x402-compliant batch payment construction
// ====================================

import { v4 as uuidv4 } from 'uuid';
import { X402PaymentPayload, BatchPayment, PreparePaymentRequest } from '../types';

export class PaymentService {
    constructor(
        private readonly chainId: string = 'D',
        private readonly facilitatorUrl: string = 'http://localhost:4000',
    ) { }

    /**
     * Construct x402 payment payloads for each agent assignment.
     */
    preparePayment(request: PreparePaymentRequest): BatchPayment {
        const jobIds: string[] = [];
        const payments: X402PaymentPayload[] = request.routingPlan.assignments.map((assignment) => {
            const jobId = uuidv4();
            jobIds.push(jobId);

            const isNativeEgld = assignment.token === 'EGLD';

            return {
                scheme: 'exact' as const,
                payload: {
                    nonce: 0,
                    value: isNativeEgld ? assignment.price : assignment.price,
                    receiver: '', // Will be resolved from IdentityRegistry
                    sender: request.senderAddress,
                    gasPrice: 1000000000,
                    gasLimit: isNativeEgld ? 50000 : 12000000,
                    data: isNativeEgld ? '' : this.encodeMultiESDTTransfer(assignment.token, assignment.price),
                    chainID: this.chainId,
                    version: 1 as const,
                    options: 0 as const,
                },
                requirements: {
                    payTo: '', // Agent owner address
                    amount: assignment.price,
                    asset: assignment.token,
                    network: `multiversx:${this.chainId}`,
                    extra: {
                        assetTransferMethod: isNativeEgld ? ('direct' as const) : ('esdt' as const),
                    },
                },
            };
        });

        return {
            payments,
            totalAmount: this.calculateTotal(
                request.routingPlan.assignments as Array<{ price: string }>,
            ),
            facilitatorUrl: this.facilitatorUrl,
            jobIds,
        };
    }

    /**
     * Sum all assignment prices.
     */
    calculateTotal(assignments: Array<{ price: string }>): string {
        return assignments
            .reduce((sum, a) => sum + BigInt(a.price), 0n)
            .toString();
    }

    private encodeMultiESDTTransfer(token: string, amount: string, destinationHex: string = ''): string {
        const tokenHex = Buffer.from(token).toString('hex');
        let amountHex = BigInt(amount).toString(16);
        if (amountHex.length % 2 !== 0) amountHex = '0' + amountHex;

        if (destinationHex) {
            return `MultiESDTNFTTransfer@${destinationHex}@01@${tokenHex}@00@${amountHex}`;
        }
        return `MultiESDTNFTTransfer@${tokenHex}@00@${amountHex}`;
    }
}
