// ====================================
// Application Configuration
// ====================================

import dotenv from 'dotenv';
dotenv.config();

export const config = {
    // MultiversX Network
    chainId: process.env.MULTIVERSX_CHAIN_ID || 'D',
    apiUrl: process.env.MULTIVERSX_API_URL || 'https://devnet-api.multiversx.com',
    explorerUrl: process.env.MULTIVERSX_EXPLORER_URL || 'https://devnet-explorer.multiversx.com',

    // Smart Contract Addresses (MX-8004)
    contracts: {
        identityRegistry: process.env.IDENTITY_REGISTRY_ADDRESS || '',
        validationRegistry: process.env.VALIDATION_REGISTRY_ADDRESS || '',
        reputationRegistry: process.env.REPUTATION_REGISTRY_ADDRESS || '',
        escrow: process.env.ESCROW_CONTRACT_ADDRESS || '',
    },

    // External Services
    x402FacilitatorUrl: process.env.X402_FACILITATOR_URL || 'http://localhost:4000',

    // LLM Provider
    llm: {
        provider: process.env.LLM_PROVIDER || 'gemini',
        apiKey: process.env.LLM_API_KEY || '',
        model: process.env.LLM_MODEL || 'gemini-2.0-flash',
    },

    // Server
    port: parseInt(process.env.BACKEND_PORT || '4001', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
};
