'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import styles from './page.module.css';

// Dynamic import for Vanta to avoid SSR issues
let VANTA_NET: any = null;
if (typeof window !== 'undefined') {
    import('three').then((THREE) => {
        (window as any).THREE = THREE;
        import('vanta/dist/vanta.net.min').then((mod) => {
            VANTA_NET = mod.default;
        });
    });
}

// =============================================
// Job History Data (sidebar)
// =============================================
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

const SUGGESTIONS = [
    { icon: '🔍', text: 'Research top AI coding tools and compare pricing' },
    { icon: '🌐', text: 'Translate my documentation to 5 languages' },
    { icon: '🛡️', text: 'Audit this smart contract for vulnerabilities' },
    { icon: '📊', text: 'Analyze competitor market positioning' },
];

// =============================================
// Main App — Gemini-Style Layout
// =============================================
export default function HomePage() {
    const [request, setRequest] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeJob, setActiveJob] = useState<string | null>(null);
    const vantaRef = useRef<HTMLDivElement>(null);
    const vantaEffect = useRef<any>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initialize Vanta.js NET effect
    useEffect(() => {
        const initVanta = () => {
            if (vantaRef.current && VANTA_NET && !vantaEffect.current) {
                vantaEffect.current = VANTA_NET({
                    el: vantaRef.current,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.0,
                    minWidth: 200.0,
                    scale: 1.0,
                    scaleMobile: 1.0,
                    color: 0x22D1EE,
                    backgroundColor: 0x0A0E1A,
                    points: 12.0,
                    maxDistance: 22.0,
                    spacing: 18.0,
                    showDots: true,
                });
            }
        };

        // Wait for dynamic imports
        const timer = setTimeout(initVanta, 500);
        const timer2 = setTimeout(initVanta, 1500);

        return () => {
            clearTimeout(timer);
            clearTimeout(timer2);
            if (vantaEffect.current) {
                vantaEffect.current.destroy();
                vantaEffect.current = null;
            }
        };
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!request.trim() || loading) return;
        setLoading(true);
        // Simulate job creation
        setTimeout(() => {
            setActiveJob('job-new');
            setLoading(false);
            window.location.href = `/job?request=${encodeURIComponent(request.trim())}`;
        }, 1200);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleSuggestion = (text: string) => {
        setRequest(text);
        inputRef.current?.focus();
    };

    return (
        <div className={styles.appShell}>
            {/* =============================================
                SIDEBAR
                ============================================= */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>⚛</span>
                        <span className={styles.logoText}>Orchestrator</span>
                    </div>
                    <button
                        className={styles.sidebarToggle}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>
                </div>

                <button className={`btn btn-filled ${styles.newJobBtn}`} onClick={() => { setActiveJob(null); setRequest(''); }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    New Request
                </button>

                <nav className={styles.sidebarNav}>
                    <a href="/discover" className={styles.navItem}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        Discover Agents
                    </a>
                </nav>

                <div className={styles.jobsSection}>
                    <span className={styles.sectionLabel}>Recent Jobs</span>
                    <div className={styles.jobList}>
                        {RECENT_JOBS.map((job) => (
                            <button
                                key={job.id}
                                className={`${styles.jobItem} ${activeJob === job.id ? styles.jobItemActive : ''}`}
                                onClick={() => setActiveJob(job.id)}
                            >
                                <span className={`${styles.jobDot} ${styles[`jobDot_${job.status}`]}`} />
                                <div className={styles.jobItemContent}>
                                    <span className={styles.jobItemText}>{job.request}</span>
                                    <span className={styles.jobItemMeta}>
                                        {job.agentsUsed} agent{job.agentsUsed > 1 ? 's' : ''} · ${job.totalCost} · {job.time}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.sidebarFooter}>
                    <button className="btn btn-outlined" style={{ width: '100%', fontSize: 13 }} id="connect-wallet-btn">
                        Connect Wallet
                    </button>
                </div>
            </aside>

            {/* =============================================
                MAIN CONTENT — Gemini-Style Welcome
                ============================================= */}
            <main className={styles.main}>
                {/* Vanta.js animated background */}
                <div ref={vantaRef} className={styles.vantaBg} />

                {/* Floating toggle when sidebar is closed */}
                {!sidebarOpen && (
                    <button
                        className={styles.floatingToggle}
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>
                )}

                <div className={styles.mainContent}>
                    {/* Greeting */}
                    <div className={styles.greeting}>
                        <h1 className={styles.greetingTitle}>
                            <span className={styles.greetingGradient}>Hello there</span>
                        </h1>
                        <p className={styles.greetingSubtitle}>
                            What can I help you with? Describe a task and I&apos;ll decompose it, find the best agents, and handle payments.
                        </p>
                    </div>

                    {/* Suggestion Cards */}
                    <div className={styles.suggestions}>
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s.text}
                                className={styles.suggestionCard}
                                onClick={() => handleSuggestion(s.text)}
                                type="button"
                            >
                                <span className={styles.suggestionIcon}>{s.icon}</span>
                                <span className={styles.suggestionText}>{s.text}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bottom Input Bar — Gemini Style */}
                <div className={styles.inputArea}>
                    <form onSubmit={handleSubmit} className={styles.inputBar}>
                        <textarea
                            ref={inputRef}
                            className={styles.inputField}
                            placeholder="Describe what you need..."
                            value={request}
                            onChange={(e) => setRequest(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            rows={1}
                            id="main-request-input"
                            aria-label="Enter your request for AI agents"
                        />
                        <div className={styles.inputActions}>
                            <button
                                type="submit"
                                className={styles.sendButton}
                                disabled={loading || !request.trim()}
                                id="submit-request-btn"
                                aria-label="Send request"
                            >
                                {loading ? (
                                    <span className={styles.spinner} />
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94l18.04-8.01a.75.75 0 0 0 0-1.37L3.478 2.404Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>
                    <p className={styles.disclaimer}>
                        Agents execute tasks on-chain via MX-8004. Payments are escrowed until results are validated.
                    </p>
                </div>
            </main>
        </div>
    );
}
