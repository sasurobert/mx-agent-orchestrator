// ====================================
// Blockchain Service — MX-8004 Contract Queries
// Pattern: SmartContractController + ABI (matches template-solution)
// ====================================

import { Address, SmartContractController } from '@multiversx/sdk-core';
import { config } from '../config';
import * as identityAbiJson from './abis/identity-registry.abi.json';
import * as reputationAbiJson from './abis/reputation-registry.abi.json';
import * as validationAbiJson from './abis/validation-registry.abi.json';
import { createEntrypoint } from './utils/entrypoint';
import { createPatchedAbi } from './utils/abi';

export class BlockchainService {
    private identityController: SmartContractController;
    private reputationController: SmartContractController;
    private validationController: SmartContractController;

    constructor() {
        const entrypoint = createEntrypoint();
        this.identityController = entrypoint.createSmartContractController(
            createPatchedAbi(identityAbiJson),
        );
        this.reputationController = entrypoint.createSmartContractController(
            createPatchedAbi(reputationAbiJson),
        );
        this.validationController = entrypoint.createSmartContractController(
            createPatchedAbi(validationAbiJson),
        );
    }

    /**
     * Get agent details from Identity Registry
     */
    async getAgent(nonce: number): Promise<Record<string, unknown> | null> {
        try {
            const results = await this.identityController.query({
                contract: Address.newFromBech32(config.contracts.identityRegistry),
                function: 'get_agent',
                arguments: [nonce],
            });
            return results[0] as Record<string, unknown> | null;
        } catch {
            return null;
        }
    }

    /**
     * Get agent service price from Identity Registry
     */
    async getAgentServicePrice(nonce: number, serviceId: string): Promise<bigint> {
        try {
            const results = await this.identityController.query({
                contract: Address.newFromBech32(config.contracts.identityRegistry),
                function: 'get_agent_service_price',
                arguments: [nonce, Buffer.from(serviceId)],
            });
            const price = results[0];
            if (price === undefined || price === null) return 0n;
            return BigInt(price.toString());
        } catch {
            return 0n;
        }
    }

    /**
     * Get reputation score from Reputation Registry
     */
    async getReputationScore(nonce: number): Promise<number> {
        try {
            const results = await this.reputationController.query({
                contract: Address.newFromBech32(config.contracts.reputationRegistry),
                function: 'reputationScore',
                arguments: [nonce],
            });
            return Number(results[0] ?? 0);
        } catch {
            return 0;
        }
    }

    /**
     * Get total jobs from Reputation Registry
     */
    async getTotalJobs(nonce: number): Promise<number> {
        try {
            const results = await this.reputationController.query({
                contract: Address.newFromBech32(config.contracts.reputationRegistry),
                function: 'totalJobs',
                arguments: [nonce],
            });
            return Number(results[0] ?? 0);
        } catch {
            return 0;
        }
    }

    /**
     * Check if a job is verified on Validation Registry
     */
    async isJobVerified(jobId: string): Promise<boolean> {
        try {
            const results = await this.validationController.query({
                contract: Address.newFromBech32(config.contracts.validationRegistry),
                function: 'is_job_verified',
                arguments: [Buffer.from(jobId)],
            });
            return Boolean(results[0]);
        } catch {
            return false;
        }
    }
}
