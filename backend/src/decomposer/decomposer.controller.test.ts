// ====================================
// Decomposer Controller — TDD Tests
// ====================================

import request from 'supertest';
import express from 'express';
import { createDecomposerRouter } from './decomposer.controller';
import { DecomposerService } from './decomposer.service';
import { LLMProvider, LLMMessage, LLMResponse, LLMStructuredResponse } from '../llm';

// ---- Mock LLM ----
class MockLLMProvider implements LLMProvider {
    public mockResponse: unknown = {
        tasks: [
            {
                id: 'task-1',
                description: 'Test task',
                requiredSkills: ['test'],
                requiredDomains: [],
                estimatedComplexity: 'low',
                dependencies: [],
                priority: 1,
            },
        ],
        estimatedTotalCost: { min: 0.1, max: 0.2, currency: 'USDC' },
        parallelizable: false,
        suggestedFlow: 'sequential',
    };

    async generateText(messages: LLMMessage[]): Promise<LLMResponse> {
        return { content: JSON.stringify(this.mockResponse) };
    }

    async generateStructured<T>(
        messages: LLMMessage[],
        _schema: Record<string, unknown>,
    ): Promise<LLMStructuredResponse<T>> {
        return {
            data: this.mockResponse as T,
            raw: JSON.stringify(this.mockResponse),
        };
    }
}

function createTestApp(): express.Express {
    const app = express();
    app.use(express.json());
    const mockLLM = new MockLLMProvider();
    const service = new DecomposerService(mockLLM);
    app.use('/api', createDecomposerRouter(service));
    return app;
}

describe('POST /api/decompose', () => {
    let app: express.Express;

    beforeEach(() => {
        app = createTestApp();
    });

    it('should return 200 with decomposition result', async () => {
        const res = await request(app)
            .post('/api/decompose')
            .send({ request: 'Find the best AI assistants' })
            .expect(200);

        expect(res.body.originalRequest).toBe('Find the best AI assistants');
        expect(res.body.tasks).toHaveLength(1);
        expect(res.body.suggestedFlow).toBe('sequential');
    });

    it('should return 400 for empty request', async () => {
        const res = await request(app)
            .post('/api/decompose')
            .send({ request: '' })
            .expect(400);

        expect(res.body.error).toBeDefined();
    });

    it('should return 400 for missing request field', async () => {
        const res = await request(app)
            .post('/api/decompose')
            .send({})
            .expect(400);

        expect(res.body.error).toBeDefined();
    });

    it('should accept optional context parameter', async () => {
        const res = await request(app)
            .post('/api/decompose')
            .send({
                request: 'Analyze the revenue data',
                context: 'Q4 2025 report attached',
            })
            .expect(200);

        expect(res.body.originalRequest).toBe('Analyze the revenue data');
    });
});
