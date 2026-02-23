// ====================================
// Gemini LLM Provider Implementation
// ====================================

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { LLMProvider, LLMMessage, LLMResponse, LLMStructuredResponse } from './llm-provider.interface';

export class GeminiProvider implements LLMProvider {
    private readonly client: GoogleGenerativeAI;
    private readonly model: GenerativeModel;

    constructor(apiKey: string, modelName: string = 'gemini-2.0-flash') {
        this.client = new GoogleGenerativeAI(apiKey);
        this.model = this.client.getGenerativeModel({ model: modelName });
    }

    async generateText(messages: LLMMessage[]): Promise<LLMResponse> {
        const systemMessage = messages.find((m) => m.role === 'system');
        const conversationMessages = messages.filter((m) => m.role !== 'system');

        const chat = this.model.startChat({
            systemInstruction: systemMessage?.content,
            history: conversationMessages.slice(0, -1).map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            })),
        });

        const lastMessage = conversationMessages[conversationMessages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response;

        return {
            content: response.text(),
            usage: response.usageMetadata
                ? {
                    promptTokens: response.usageMetadata.promptTokenCount ?? 0,
                    completionTokens: response.usageMetadata.candidatesTokenCount ?? 0,
                    totalTokens: response.usageMetadata.totalTokenCount ?? 0,
                }
                : undefined,
        };
    }

    async generateStructured<T>(
        messages: LLMMessage[],
        _schema: Record<string, unknown>,
    ): Promise<LLMStructuredResponse<T>> {
        // Append JSON instruction to the last user message
        const augmentedMessages = messages.map((m, i) => {
            if (i === messages.length - 1 && m.role === 'user') {
                return {
                    ...m,
                    content: `${m.content}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation. Just the raw JSON object.`,
                };
            }
            return m;
        });

        const response = await this.generateText(augmentedMessages);
        const cleaned = response.content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const data = JSON.parse(cleaned) as T;

        return {
            data,
            raw: response.content,
            usage: response.usage,
        };
    }
}
