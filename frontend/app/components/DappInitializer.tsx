'use client';

import { useEffect, useState, ReactNode } from 'react';
import { initDapp } from '../lib/initDapp';

interface DappInitializerProps {
    children: ReactNode;
}

export function DappInitializer({ children }: DappInitializerProps) {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const env = typeof window !== 'undefined'
            ? localStorage.getItem('mvx-network') || process.env.NEXT_PUBLIC_MVX_ENVIRONMENT || 'devnet'
            : 'devnet';

        initDapp(env)
            .then(() => setReady(true))
            .catch((err) => {
                console.error('[DappInitializer] Failed to init sdk-dapp:', err);
                setError(err.message);
                // Still render the app — wallet features will be disabled
                setReady(true);
            });
    }, []);

    if (!ready) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0A0E1A',
                color: '#8892b0',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
            }}>
                Initializing MultiversX...
            </div>
        );
    }

    return <>{children}</>;
}
