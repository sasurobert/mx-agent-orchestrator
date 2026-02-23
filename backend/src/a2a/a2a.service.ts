import { UserSigner } from '@multiversx/sdk-wallet';
import { promises as fs } from 'fs';
import { config } from '../config';

export class A2AService {
    private signer: UserSigner | null = null;
    private walletAddress: string = '';

    constructor() { }

    /**
     * Initializes the signer from mnemonic or PEM file.
     * Uses dummy key if neither is available.
     */
    async initialize() {
        let pemText: string | undefined;

        if (config.a2a.mnemonic) {
            const { UserWallet } = require('@multiversx/sdk-wallet/out/userWallet');
            const wallet = UserWallet.fromMnemonic(config.a2a.mnemonic, 0);
            pemText = wallet.toPem();
        } else {
            try {
                pemText = await fs.readFile(config.a2a.pemPath, 'utf8');
            } catch {
                console.warn(`[A2A] ${config.a2a.pemPath} not found. Generating a random test key for this session.`);
                const crypto = require('crypto');
                const { UserSecretKey } = require('@multiversx/sdk-wallet');
                const secretKey = new UserSecretKey(crypto.randomBytes(32));
                this.signer = new UserSigner(secretKey);
            }
        }

        if (pemText) {
            this.signer = UserSigner.fromPem(pemText);
        }
        this.walletAddress = this.signer!.getAddress().bech32();
        console.log(`[A2A] Authenticating to agents as: ${this.walletAddress}`);
    }

    /**
     * Authenticates with an external agent to get a Bearer token.
     * Implements the cryptographic challenge-response authentication.
     */
    async getAuthToken(agentApiUrl: string): Promise<string> {
        if (!this.signer) {
            await this.initialize();
        }

        // 1. Request Nonce
        const nonceRes = await fetch(`${agentApiUrl}/auth/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: this.walletAddress })
        });

        if (!nonceRes.ok) {
            throw new Error(`[A2A] Failed to get nonce from ${agentApiUrl}: ${await nonceRes.text()}`);
        }

        const { nonce } = await nonceRes.json() as { nonce: string };

        // 2. Sign the Nonce
        const signatureBuffer = await this.signer!.sign(Buffer.from(nonce));
        const signatureHex = signatureBuffer.toString('hex');

        // 3. Verify and get Token
        const verifyRes = await fetch(`${agentApiUrl}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress: this.walletAddress,
                nonce,
                signature: signatureHex
            })
        });

        if (!verifyRes.ok) {
            throw new Error(`[A2A] Verification failed at ${agentApiUrl}: ${await verifyRes.text()}`);
        }

        const { token } = await verifyRes.json() as { token: string };
        return token;
    }

    /**
     * Makes an authenticated HTTP request to an agent's endpoint.
     */
    async authenticatedRequest(agentApiUrl: string, endpoint: string, options: RequestInit = {}): Promise<Response> {
        const token = await this.getAuthToken(agentApiUrl);

        const headers = new Headers(options.headers || {});
        headers.set('Authorization', `Bearer ${token}`);
        if (!options.body || typeof options.body === 'string') {
            headers.set('Content-Type', 'application/json');
        }

        const url = `${agentApiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

        return fetch(url, {
            ...options,
            headers
        });
    }
}
