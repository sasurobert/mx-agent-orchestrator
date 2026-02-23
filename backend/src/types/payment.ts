// ====================================
// Payment Gateway Types (Spec §3.4)
// ====================================

export interface X402PaymentPayload {
    scheme: 'exact';
    payload: {
        nonce: number;
        value: string;
        receiver: string;
        sender: string;
        gasPrice: number;
        gasLimit: number;
        data: string;
        chainID: string;
        version: 1;
        options: 0;
    };
    requirements: {
        payTo: string;
        amount: string;
        asset: string;
        network: string;
        extra: {
            assetTransferMethod: 'direct' | 'esdt';
        };
    };
}

export interface BatchPayment {
    payments: X402PaymentPayload[];
    totalAmount: string;
    facilitatorUrl: string;
    jobIds: string[];
}

export interface PreparePaymentRequest {
    routingPlan: {
        assignments: Array<{
            taskId: string;
            agentNonce: number;
            price: string;
            token: string;
        }>;
        totalCost: {
            amount: string;
            token: string;
        };
    };
    senderAddress: string;
}

export interface ConfirmPaymentRequest {
    batchPayment: BatchPayment;
    signatures: string[];
}

export interface PaymentConfirmation {
    success: boolean;
    txHashes: string[];
    jobIds: string[];
}
