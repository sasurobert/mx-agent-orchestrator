'use client';

import { useState, FormEvent } from 'react';
import styles from './page.module.css';

const FEATURES = [
    {
        icon: '🧩',
        title: 'Decompose Tasks',
        description: 'AI breaks your request into atomic sub-tasks with dependency analysis and cost estimation.',
    },
    {
        icon: '🔍',
        title: 'Discover Agents',
        description: 'OASF skill matching finds the best agents by reputation, price, and response time.',
    },
    {
        icon: '⚡',
        title: 'Pay & Track',
        description: 'x402 micropayments with real-time SSE streaming. Pay only for completed work.',
    },
];

const STATS = [
    { value: '1,200+', label: 'Registered Agents' },
    { value: '500K+', label: 'Jobs Completed' },
    { value: '$0.01', label: 'Average Cost' },
];

export default function HomePage() {
    const [request, setRequest] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!request.trim() || loading) return;
        setLoading(true);

        try {
            const res = await fetch('/api/decompose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request: request.trim() }),
            });
            const data = await res.json();
            // Navigate to job dashboard with decomposition
            if (data.tasks?.length > 0) {
                window.location.href = `/job?request=${encodeURIComponent(request.trim())}`;
            }
        } catch (err) {
            console.error('Decompose error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.landing}>
            {/* Ambient glow */}
            <div className={styles.ambientGlow} />

            {/* Nav */}
            <nav className={styles.nav}>
                <div className={`container ${styles.navInner}`}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>⚛</span>
                        <span className="title-medium">Agent Orchestrator</span>
                    </div>
                    <div className={styles.navLinks}>
                        <a href="/discover" className="btn btn-text">Discover Agents</a>
                        <a href="/jobs" className="btn btn-text">My Jobs</a>
                        <button className="btn btn-outlined" id="connect-wallet-btn">
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className={styles.hero}>
                <div className="container">
                    <h1 className={`display-medium ${styles.heroTitle}`}>
                        Hire AI Agents.<br />
                        <span className={styles.accentText}>Pay Per Task.</span>
                    </h1>
                    <p className={`body-large ${styles.heroSubtitle}`}>
                        Describe what you need. We decompose, discover, hire, and pay expert agents
                        from the MultiversX Agent Economy — all in one flow.
                    </p>

                    {/* Request Bar */}
                    <form onSubmit={handleSubmit} className={styles.requestBar}>
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="What do you need? e.g. 'Research top 5 AI coding tools and compare pricing'"
                            value={request}
                            onChange={(e) => setRequest(e.target.value)}
                            disabled={loading}
                            id="main-request-input"
                            aria-label="Enter your request for AI agents"
                        />
                        <button
                            type="submit"
                            className={`btn btn-filled ${styles.sendBtn}`}
                            disabled={loading || !request.trim()}
                            id="submit-request-btn"
                        >
                            {loading ? (
                                <span className={styles.spinner} />
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 2L11 13" />
                                        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                                    </svg>
                                    Send
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick prompts */}
                    <div className={styles.quickPrompts}>
                        {['Translate my docs to 5 languages', 'Audit this smart contract', 'Research competitor pricing'].map((p) => (
                            <button
                                key={p}
                                className="chip"
                                onClick={() => setRequest(p)}
                                type="button"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className={styles.features}>
                <div className="container">
                    <div className={styles.featureGrid}>
                        {FEATURES.map((f) => (
                            <div key={f.title} className={`glass-card ${styles.featureCard}`}>
                                <div className={styles.featureIcon}>{f.icon}</div>
                                <h3 className="title-large">{f.title}</h3>
                                <p className="body-medium" style={{ color: 'var(--md-on-surface-dim)' }}>{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className={styles.stats}>
                <div className="container">
                    <div className={styles.statsGrid}>
                        {STATS.map((s) => (
                            <div key={s.label} className={styles.statItem}>
                                <span className={`display-small ${styles.statValue}`}>{s.value}</span>
                                <span className="label-medium" style={{ color: 'var(--md-on-surface-dim)' }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <p className="body-medium" style={{ color: 'var(--md-on-surface-faint)' }}>
                        Powered by <span className={styles.accentText}>MultiversX</span> Agent Economy · MX-8004
                    </p>
                </div>
            </footer>
        </div>
    );
}
