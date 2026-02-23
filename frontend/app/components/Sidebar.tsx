'use client';

import { useState } from 'react';
import styles from './Sidebar.module.css';

interface JobEntry {
    id: string;
    request: string;
    status: 'active' | 'completed' | 'failed';
    agentsUsed: number;
    totalCost: string;
    time: string;
}

const RECENT_JOBS: JobEntry[] = [
    { id: 'job-001', request: 'Find top 5 AI coding assistants', status: 'active', agentsUsed: 3, totalCost: '0.35', time: '2 min ago' },
    { id: 'job-002', request: 'Translate docs to 5 languages', status: 'completed', agentsUsed: 3, totalCost: '0.09', time: '1h ago' },
    { id: 'job-003', request: 'Audit DeFi smart contract', status: 'completed', agentsUsed: 1, totalCost: '1.20', time: '3h ago' },
    { id: 'job-004', request: 'Research competitor pricing', status: 'failed', agentsUsed: 2, totalCost: '0.00', time: 'Yesterday' },
    { id: 'job-005', request: 'Generate marketing copy', status: 'completed', agentsUsed: 2, totalCost: '0.06', time: '2 days ago' },
];

interface SidebarProps {
    activePage?: 'home' | 'discover' | 'job' | 'jobs';
}

export function Sidebar({ activePage = 'home' }: SidebarProps) {
    const [open, setOpen] = useState(true);

    return (
        <>
            <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
                <div className={styles.header}>
                    <a href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>⚛</span>
                        <span className={styles.logoText}>Orchestrator</span>
                    </a>
                    <button className={styles.toggle} onClick={() => setOpen(!open)} aria-label="Toggle sidebar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>
                </div>

                <a href="/" className={`btn btn-filled ${styles.newBtn}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    New Request
                </a>

                <nav className={styles.nav}>
                    <a href="/discover" className={`${styles.navItem} ${activePage === 'discover' ? styles.navItemActive : ''}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        Discover Agents
                    </a>
                </nav>

                <div className={styles.jobs}>
                    <span className={styles.sectionLabel}>Recent Jobs</span>
                    <div className={styles.jobList}>
                        {RECENT_JOBS.map((job) => (
                            <a key={job.id} href="/job" className={styles.jobItem}>
                                <span className={`${styles.dot} ${styles[`dot_${job.status}`]}`} />
                                <div className={styles.jobContent}>
                                    <span className={styles.jobText}>{job.request}</span>
                                    <span className={styles.jobMeta}>
                                        {job.agentsUsed} agent{job.agentsUsed > 1 ? 's' : ''} · ${job.totalCost} · {job.time}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className="btn btn-outlined" style={{ width: '100%', fontSize: 13 }} id="connect-wallet-btn">
                        Connect Wallet
                    </button>
                </div>
            </aside>

            {!open && (
                <button className={styles.floatingToggle} onClick={() => setOpen(true)} aria-label="Open sidebar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                </button>
            )}
        </>
    );
}
