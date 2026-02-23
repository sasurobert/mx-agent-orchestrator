import { NetworkEntrypoint } from '@multiversx/sdk-core';
import { config } from '../../config';

/**
 * Creates a network-aware entrypoint using config values.
 */
export function createEntrypoint(): NetworkEntrypoint {
    return new NetworkEntrypoint({
        networkProviderUrl: config.apiUrl,
        networkProviderKind: 'api',
        chainId: config.chainId,
    });
}
