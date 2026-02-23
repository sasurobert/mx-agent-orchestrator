'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { Sidebar } from './components/Sidebar';
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
            <Sidebar activePage="home" />

            {/* =============================================
                MAIN CONTENT — Gemini-Style Welcome
                ============================================= */}
            <main className={styles.main}>
                {/* Vanta.js animated background */}
                <div ref={vantaRef} className={styles.vantaBg} />



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
