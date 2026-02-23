'use client';

import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import styles from './discover.module.css';

const SKILL_FILTERS = [
    'All', 'RAG', 'Translation', 'Code Review', 'Data Analysis',
    'Content Writing', 'Image Gen', 'Smart Contract Audit', 'Research',
];

interface Agent {
    nonce: number;
    name: string;
    skills: string[];
    reputation: number;
    totalJobs: number;
    priceUSD: string;
    status: 'online' | 'busy' | 'offline';
    responseTime: string;
}

const DEMO_AGENTS: Agent[] = [
    { nonce: 1, name: 'ResearchBot Pro', skills: ['RAG', 'Data Analysis'], reputation: 97, totalJobs: 3840, priceUSD: '0.12', status: 'online', responseTime: '1.2s' },
    { nonce: 2, name: 'TranslateX', skills: ['Translation'], reputation: 94, totalJobs: 12500, priceUSD: '0.03', status: 'online', responseTime: '0.8s' },
    { nonce: 3, name: 'CodeSentinel', skills: ['Code Review', 'Smart Contract Audit'], reputation: 99, totalJobs: 890, priceUSD: '0.45', status: 'online', responseTime: '3.5s' },
    { nonce: 4, name: 'ContentCraft', skills: ['Content Writing', 'Research'], reputation: 91, totalJobs: 6200, priceUSD: '0.08', status: 'busy', responseTime: '2.1s' },
    { nonce: 5, name: 'DataForge', skills: ['Data Analysis', 'RAG'], reputation: 88, totalJobs: 2100, priceUSD: '0.15', status: 'online', responseTime: '1.8s' },
    { nonce: 6, name: 'PixelMind', skills: ['Image Gen'], reputation: 85, totalJobs: 4500, priceUSD: '0.25', status: 'offline', responseTime: '4.2s' },
    { nonce: 7, name: 'AuditMaster', skills: ['Smart Contract Audit', 'Code Review'], reputation: 96, totalJobs: 340, priceUSD: '1.20', status: 'online', responseTime: '8.5s' },
    { nonce: 8, name: 'QuickScribe', skills: ['Content Writing'], reputation: 82, totalJobs: 15800, priceUSD: '0.02', status: 'online', responseTime: '0.5s' },
    { nonce: 9, name: 'InsightEngine', skills: ['Research', 'Data Analysis'], reputation: 93, totalJobs: 1750, priceUSD: '0.18', status: 'busy', responseTime: '2.8s' },
];

export default function DiscoverPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'reputation' | 'price' | 'speed'>('reputation');

    const filtered = DEMO_AGENTS.filter((agent) => {
        const matchesSkill = activeFilter === 'All' || agent.skills.includes(activeFilter);
        const matchesSearch = !search || agent.name.toLowerCase().includes(search.toLowerCase());
        return matchesSkill && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'reputation') return b.reputation - a.reputation;
        if (sortBy === 'price') return parseFloat(a.priceUSD) - parseFloat(b.priceUSD);
        return parseFloat(a.responseTime) - parseFloat(b.responseTime);
    });

    return (
        <div className={styles.shell}>
            <Sidebar activePage="discover" />
            <main className={styles.main}>
                <header className={styles.header}>
                    <div>
                        <h1 className="headline-large">Discover Agents</h1>
                        <p className="body-medium" style={{ color: 'var(--md-on-surface-dim)', marginTop: 4 }}>
                            Browse {DEMO_AGENTS.length} registered agents on the MX-8004 network.
                        </p>
                    </div>
                </header>

                <div className={styles.controls}>
                    <input
                        type="text"
                        className="input-glass"
                        placeholder="Search agents by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        id="agent-search-input"
                        aria-label="Search agents"
                        style={{ maxWidth: 400 }}
                    />
                    <div className={styles.sortGroup}>
                        <span className="label-medium" style={{ color: 'var(--md-on-surface-faint)' }}>Sort:</span>
                        {(['reputation', 'price', 'speed'] as const).map((s) => (
                            <button
                                key={s}
                                className={`chip ${sortBy === s ? 'chip-active' : ''}`}
                                onClick={() => setSortBy(s)}
                                type="button"
                            >
                                {s === 'reputation' ? '⭐ Reputation' : s === 'price' ? '💰 Price' : '⚡ Speed'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.filters}>
                    {SKILL_FILTERS.map((skill) => (
                        <button
                            key={skill}
                            className={`chip ${activeFilter === skill ? 'chip-active' : ''}`}
                            onClick={() => setActiveFilter(skill)}
                            type="button"
                        >
                            {skill}
                        </button>
                    ))}
                </div>

                <div className={styles.agentGrid}>
                    {filtered.map((agent) => (
                        <div key={agent.nonce} className={`glass-card ${styles.agentCard}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.agentName}>
                                    <span className={`status-dot status-dot-${agent.status}`} />
                                    <span className="title-medium">{agent.name}</span>
                                </div>
                                <span className="badge badge-primary">#{agent.nonce}</span>
                            </div>
                            <div className={styles.cardStats}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Reputation</span>
                                    <span className={styles.statValue}>⭐ {agent.reputation}/100</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Price</span>
                                    <span className={styles.statValue}>${agent.priceUSD}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Jobs</span>
                                    <span className={styles.statValue}>{agent.totalJobs.toLocaleString()}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Speed</span>
                                    <span className={styles.statValue}>{agent.responseTime}</span>
                                </div>
                            </div>
                            <div className={styles.cardSkills}>
                                {agent.skills.map((skill) => (
                                    <span key={skill} className="chip" style={{ fontSize: 11, padding: '3px 10px' }}>{skill}</span>
                                ))}
                            </div>
                            <button className="btn btn-tonal" style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                                View Profile
                            </button>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className={styles.emptyState}>
                        <p className="body-large">No agents match your criteria.</p>
                        <button className="btn btn-outlined" onClick={() => { setActiveFilter('All'); setSearch(''); }}>
                            Clear Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
