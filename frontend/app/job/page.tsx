'use client';

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import styles from './job.module.css';

type TaskStatus = 'completed' | 'active' | 'pending';

interface PipelineTask {
    id: string;
    name: string;
    status: TaskStatus;
    agentName: string;
    agentReputation: number;
    price: string;
    result?: string;
}

const DEMO_TASKS: PipelineTask[] = [
    { id: 'task-1', name: 'Research AI Coding Tools', status: 'completed', agentName: 'ResearchBot Pro', agentReputation: 97, price: '0.12', result: 'Found 5 top tools: Cursor, Copilot, Codeium, Tabnine, Windsurf' },
    { id: 'task-2', name: 'Analyze Pricing Models', status: 'active', agentName: 'DataForge', agentReputation: 88, price: '0.15' },
    { id: 'task-3', name: 'Generate Comparison Report', status: 'pending', agentName: 'ContentCraft', agentReputation: 91, price: '0.08' },
];

export default function JobPage() {
    const [tasks] = useState<PipelineTask[]>(DEMO_TASKS);
    const [showPayment, setShowPayment] = useState(false);

    const totalCost = tasks.reduce((sum, t) => sum + parseFloat(t.price), 0).toFixed(2);
    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    return (
        <div className={styles.shell}>
            <Sidebar activePage="job" />

            <main className={styles.main}>
                <header className={styles.header}>
                    <div>
                        <h1 className="headline-large">Active Job</h1>
                        <p className="body-large" style={{ color: 'var(--md-on-surface-dim)', marginTop: 4 }}>
                            &ldquo;Find and compare top 5 AI coding assistants&rdquo;
                        </p>
                    </div>
                    <span className="badge badge-primary">{progress}% Complete</span>
                </header>

                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>

                <section className={styles.pipelineSection}>
                    <h2 className="title-large" style={{ marginBottom: 'var(--space-lg)' }}>Task Pipeline</h2>
                    <div className="pipeline">
                        {tasks.map((task, i) => (
                            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <div className={`pipeline-step pipeline-step-${task.status}`}>
                                    {task.status === 'completed' && '✓ '}
                                    {task.status === 'active' && '● '}
                                    {task.name}
                                </div>
                                {i < tasks.length - 1 && (
                                    <div className={`pipeline-connector ${task.status === 'completed' ? 'pipeline-connector-done' : ''}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.agentSection}>
                    <h2 className="title-large" style={{ marginBottom: 'var(--space-lg)' }}>Agent Assignments</h2>
                    <div className={styles.agentGrid}>
                        {tasks.map((task) => (
                            <div key={task.id} className={`glass-card ${styles.assignmentCard}`}>
                                <div className={styles.cardTop}>
                                    <div>
                                        <span className="label-small" style={{ color: 'var(--md-on-surface-faint)' }}>{task.id.toUpperCase()}</span>
                                        <h3 className="title-medium">{task.name}</h3>
                                    </div>
                                    <span className={`badge badge-${task.status === 'completed' ? 'success' : task.status === 'active' ? 'primary' : 'warning'}`}>
                                        {task.status}
                                    </span>
                                </div>
                                <div className={styles.agentInfo}>
                                    <div className={styles.agentAvatar}>{task.agentName.charAt(0)}</div>
                                    <div>
                                        <span className="body-medium" style={{ fontWeight: 500 }}>{task.agentName}</span>
                                        <span className="label-medium" style={{ color: 'var(--md-on-surface-dim)' }}>⭐ {task.agentReputation}/100</span>
                                    </div>
                                    <span className={styles.price}>${task.price}</span>
                                </div>
                                {task.result && (
                                    <div className={styles.resultPreview}>
                                        <span className="label-small" style={{ color: 'var(--color-success)' }}>Result</span>
                                        <p className="body-medium" style={{ color: 'var(--md-on-surface-dim)' }}>{task.result}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`glass-card-elevated ${styles.costSummary}`}>
                    <div className={styles.costLeft}>
                        <span className="label-medium" style={{ color: 'var(--md-on-surface-faint)' }}>TOTAL COST</span>
                        <span className="headline-large" style={{ color: 'var(--color-primary)' }}>${totalCost} USDC</span>
                        <span className="body-medium" style={{ color: 'var(--md-on-surface-dim)' }}>{tasks.length} tasks · {tasks.length} agents</span>
                    </div>
                    <div className={styles.costActions}>
                        <button className="btn btn-filled" onClick={() => setShowPayment(true)} id="submit-payment-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                            Submit Payment
                        </button>
                        <button className="btn btn-outlined">View Breakdown</button>
                    </div>
                </section>

                {showPayment && (
                    <div className={styles.modalOverlay} onClick={() => setShowPayment(false)}>
                        <div className={`glass-card-elevated ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
                            <h2 className="headline-medium" style={{ marginBottom: 'var(--space-lg)' }}>Confirm Payment</h2>
                            <div className={styles.modalDetails}>
                                <div className={styles.modalRow}><span className="body-medium">Total</span><span className="title-medium" style={{ color: 'var(--color-primary)' }}>${totalCost} USDC</span></div>
                                <div className={styles.modalRow}><span className="body-medium">Protocol</span><span className="title-medium">x402 (MultiversX)</span></div>
                                <div className={styles.modalRow}><span className="body-medium">Agents</span><span className="title-medium">{tasks.length}</span></div>
                                <div className={styles.modalRow}><span className="body-medium">Escrow</span><span className="badge badge-success">Protected</span></div>
                            </div>
                            <div className={styles.modalActions}>
                                <button className="btn btn-filled" style={{ flex: 1 }}>Sign & Pay</button>
                                <button className="btn btn-outlined" onClick={() => setShowPayment(false)} style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
