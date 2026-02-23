'use client';

import { useState, useEffect } from 'react';

interface WalletState {
    address: string;
    truncatedAddress: string;
    balance: string;
    formattedBalance: string;
    nonce: number;
    isLoggedIn: boolean;
    providerType: string | null;
    egldLabel: string;
    chainId: string;
}

const DEFAULT_STATE: WalletState = {
    address: '',
    truncatedAddress: '',
    balance: '0',
    formattedBalance: '0.0000',
    nonce: 0,
    isLoggedIn: false,
    providerType: null,
    egldLabel: 'EGLD',
    chainId: '',
};

/**
 * Custom wallet hook that dynamically imports sdk-dapp hooks.
 * This avoids webpack build-time resolution of sdk-dapp's broken ESM chunks.
 */
export function useWallet(): WalletState {
    const [state, setState] = useState<WalletState>(DEFAULT_STATE);

    useEffect(() => {
        let cancelled = false;

        async function loadWalletState() {
            try {
                const { getAccount } = await import(
                    /* webpackIgnore: true */
                    '@multiversx/sdk-dapp/out/methods/account/getAccount'
                );
                const { getLoginInfo } = await import(
                    /* webpackIgnore: true */
                    '@multiversx/sdk-dapp/out/methods/loginInfo/getLoginInfo'
                );
                const { getNetworkConfig } = await import(
                    /* webpackIgnore: true */
                    '@multiversx/sdk-dapp/out/methods/network/getNetworkConfig'
                );
                const { getStore } = await import(
                    /* webpackIgnore: true */
                    '@multiversx/sdk-dapp/out/store/store'
                );

                const updateState = () => {
                    if (cancelled) return;
                    try {
                        const account = getAccount();
                        const loginInfo = getLoginInfo();
                        const networkConfig = getNetworkConfig();

                        const address = account?.address ?? '';
                        const balance = account?.balance ?? '0';
                        const truncatedAddress = address
                            ? `${address.slice(0, 6)}...${address.slice(-4)}`
                            : '';
                        const formattedBalance = balance
                            ? (Number(balance) / 1e18).toFixed(4)
                            : '0.0000';

                        setState({
                            address,
                            truncatedAddress,
                            balance,
                            formattedBalance,
                            nonce: account?.nonce ?? 0,
                            isLoggedIn: loginInfo?.isLoggedIn ?? false,
                            providerType: loginInfo?.providerType ?? null,
                            egldLabel: networkConfig?.network?.egldLabel ?? 'EGLD',
                            chainId: networkConfig?.network?.chainId ?? '',
                        });
                    } catch {
                        // Store not initialized yet
                    }
                };

                // Initial read
                updateState();

                // Subscribe to store changes
                const store = getStore();
                const unsubscribe = store.subscribe(() => updateState());

                return () => {
                    cancelled = true;
                    unsubscribe();
                };
            } catch (err) {
                console.warn('[useWallet] Could not load sdk-dapp:', err);
            }
        }

        const cleanupPromise = loadWalletState();
        return () => {
            cancelled = true;
            cleanupPromise?.then((cleanup) => cleanup?.());
        };
    }, []);

    return state;
}
