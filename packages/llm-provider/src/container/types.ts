export const LLM_PROVIDER_TYPES = {
    Logger: Symbol.for('Logger'),
    ErrorHandler: Symbol.for('ErrorHandler'),
    OpenAIProvider: Symbol.for('OpenAIProvider'),
    AnthropicProvider: Symbol.for('AnthropicProvider'),
    FalAIProvider: Symbol.for('FalAIProvider'),
    LLMProviderFactory: Symbol.for('LLMProviderFactory'),
    ConfigValidator: Symbol.for('ConfigValidator')
} as const;
