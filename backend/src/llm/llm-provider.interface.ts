// ====================================
// LLM Provider Interface
// Configurable adapter — any LLM can implement this
// ====================================

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface LLMStructuredResponse<T> {
    data: T;
    raw: string;
    usage?: LLMResponse['usage'];
}

export interface LLMProvider {
    /**
     * Generate a text completion from messages.
     */
    generateText(messages: LLMMessage[]): Promise<LLMResponse>;

    /**
     * Generate a structured JSON response parsed into type T.
     * The provider should instruct the LLM to return valid JSON.
     */
    generateStructured<T>(
        messages: LLMMessage[],
        schema: Record<string, unknown>,
    ): Promise<LLMStructuredResponse<T>>;
}
