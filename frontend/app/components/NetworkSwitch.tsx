'use client';

import { useState, useEffect, useRef } from 'react';
import { initDapp } from '../lib/initDapp';
import styles from './NetworkSwitch.module.css';

const NETWORKS = [
    { id: 'devnet', label: 'Devnet', color: '#4ade80', api: 'devnet-api.multiversx.com' },
    { id: 'testnet', label: 'Testnet', color: '#facc15', api: 'testnet-api.multiversx.com' },
    { id: 'mainnet', label: 'Mainnet', color: '#f87171', api: 'api.multiversx.com' },
] as const;

export function NetworkSwitch() {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState('devnet');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('mvx-network');
        if (saved && NETWORKS.some((n) => n.id === saved)) {
            setActive(saved);
        }
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const activeNet = NETWORKS.find((n) => n.id === active) ?? NETWORKS[0];

    const switchNetwork = async (id: string) => {
        setActive(id);
        setOpen(false);
        localStorage.setItem('mvx-network', id);

        // Re-initialize sdk-dapp with new environment
        try {
            await initDapp(id);
        } catch (err) {
            console.error('[NetworkSwitch] Failed to re-init:', err);
        }
    };

    return (
        <div className={styles.wrapper} ref={ref} data-testid="network-switch">
            <button
                className={styles.pill}
                onClick={() => setOpen(!open)}
                aria-label="Switch network"
                aria-expanded={open}
            >
                <span className={styles.dot} style={{ background: activeNet.color }} />
                <span className={styles.label}>{activeNet.label}</span>
                <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {open && (
                <div className={styles.dropdown}>
                    {NETWORKS.map((net) => (
                        <button
                            key={net.id}
                            className={`${styles.option} ${net.id === active ? styles.optionActive : ''}`}
                            onClick={() => switchNetwork(net.id)}
                        >
                            <span className={styles.dot} style={{ background: net.color }} />
                            <span>{net.label}</span>
                            {net.id === active && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
