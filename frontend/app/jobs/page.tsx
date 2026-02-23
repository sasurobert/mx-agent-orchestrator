'use client';

import styles from './jobs.module.css';

interface Job {
    id: string;
    request: string;
    status: 'completed' | 'active' | 'failed';
    agentsUsed: number;
    totalCost: string;
    createdAt: string;
    completedAt?: string;
}

const DEMO_JOBS: Job[] = [
    { id: 'job-001', request: 'Find and compare top 5 AI coding assistants', status: 'active', agentsUsed: 3, totalCost: '0.35', createdAt: '2 min ago' },
    { id: 'job-002', request: 'Translate product docs to Spanish, French, German', status: 'completed', agentsUsed: 3, totalCost: '0.09', createdAt: '1 hour ago', completedAt: '45 min ago' },
    { id: 'job-003', request: 'Audit my DeFi smart contract for vulnerabilities', status: 'completed', agentsUsed: 1, totalCost: '1.20', createdAt: '3 hours ago', completedAt: '2 hours ago' },
    { id: 'job-004', request: 'Research competitor pricing strategy', status: 'failed', agentsUsed: 2, totalCost: '0.00', createdAt: 'Yesterday' },
];

export default function JobsPage() {
    return (
        <div className={styles.jobsPage}>
            <nav className={styles.nav}>
                <div className={`container ${styles.navInner}`}>
                    <a href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>⚛</span>
                        <span className="title-medium">Agent Orchestrator</span>
                    </a>
                    <div className={styles.navLinks}>
                        <a href="/discover" className="btn btn-text">Discover</a>
                        <button className="btn btn-outlined" id="connect-wallet-btn">Connect Wallet</button>
                    </div>
                </div>
            </nav>

            <main className="container page-content">
                <header className={styles.header}>
                    <h1 className="headline-large">My Jobs</h1>
                    <a href="/" className="btn btn-filled">+ New Request</a>
                </header>

                <div className={styles.jobList}>
                    {DEMO_JOBS.map((job) => (
                        <a key={job.id} href="/job" className={`glass-card ${styles.jobRow}`}>
                            <div className={styles.jobMain}>
                                <span className={`badge badge-${job.status === 'completed' ? 'success' : job.status === 'active' ? 'primary' : 'error'}`}>
                                    {job.status}
                                </span>
                                <span className="body-large">{job.request}</span>
                            </div>
                            <div className={styles.jobMeta}>
                                <span className="label-medium" style={{ color: 'var(--md-on-surface-dim)' }}>
                                    {job.agentsUsed} agent{job.agentsUsed > 1 ? 's' : ''}
                                </span>
                                <span className="label-medium" style={{ color: 'var(--color-primary)' }}>
                                    ${job.totalCost} USDC
                                </span>
                                <span className="label-medium" style={{ color: 'var(--md-on-surface-faint)' }}>
                                    {job.createdAt}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </main>
        </div>
    );
}
