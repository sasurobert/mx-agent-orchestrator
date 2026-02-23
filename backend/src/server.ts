// ====================================
// Express Server — mx-agent-orchestrator
// ====================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { GeminiProvider } from './llm';
import { DecomposerService, createDecomposerRouter } from './decomposer';
import { DiscoveryService, createDiscoveryRouter } from './discovery';
import { RouterService, createRouterRouter } from './router';
import { PaymentService, createPaymentRouter } from './payment';
import { AggregatorService, createAggregatorRouter } from './aggregator';
import { FeedbackService, createFeedbackRouter } from './feedback';
import { A2AService } from './a2a';

const app = express();

// ====================================
// Middleware
// ====================================
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// ====================================
// Service Initialization
// ====================================
const llm = new GeminiProvider(config.llm.apiKey, config.llm.model);
const decomposerService = new DecomposerService(llm);
const discoveryService = new DiscoveryService();
const routerService = new RouterService();
const paymentService = new PaymentService(config.chainId, config.x402FacilitatorUrl);
const aggregatorService = new AggregatorService(llm);
const feedbackService = new FeedbackService();
const a2aService = new A2AService();

// Agent provider stub — will be replaced with real blockchain queries
const agentProvider = {
    getAgents: async () => {
        // TODO: Fetch from IdentityRegistry + ReputationRegistry
        return [];
    },
};

// ====================================
// Health Check
// ====================================
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'mx-agent-orchestrator',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// ====================================
// API Routes
// ====================================
app.use('/api', createDecomposerRouter(decomposerService));
app.use('/api', createDiscoveryRouter(discoveryService, agentProvider));
app.use('/api', createRouterRouter(routerService, discoveryService, agentProvider));
app.use('/api', createPaymentRouter(paymentService));
app.use('/api', createAggregatorRouter(aggregatorService));
app.use('/api', createFeedbackRouter(feedbackService));

// ====================================
// Error Handler
// ====================================
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// ====================================
// Start
// ====================================
export { app };

if (require.main === module) {
    app.listen(config.port, async () => {
        console.log(`🚀 mx-agent-orchestrator backend running on port ${config.port}`);
        console.log(`   Chain: ${config.chainId} | API: ${config.apiUrl}`);
        console.log(`   LLM: ${config.llm.provider} / ${config.llm.model}`);

        // Initialize A2A authentication identity
        await a2aService.initialize().catch(err => {
            console.error('[A2A] Failed to initialize Orchestrator wallet:', err.message);
        });
    });
}
