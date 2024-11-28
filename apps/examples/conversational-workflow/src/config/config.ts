export interface AgentConfig {
  id: string;
  type: string;
  capabilities: string[];
  apiKeys: {
    openai?: string;
    tavily?: string;
  };
}

export interface APIConfig {
  openai: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  tavily: {
    searchDepth: string;
    includeDomains: string[];
  };
}

export interface Config {
  agents: {
    chatbot: AgentConfig;
    knowledge: AgentConfig;
    newsFetcher: AgentConfig;
    summarization: AgentConfig;
  };
  api: APIConfig;
  workflowDefaults: {
    maxRetries: number;
    timeoutMs: number;
    concurrentTasks: number;
  };
}

export const config: Config = {
  agents: {
    chatbot: {
      id: 'chatbot-agent',
      type: 'chatbot',
      capabilities: ['query_parsing', 'conversation_management'],
      apiKeys: {
        openai: process.env.OPENAI_API_KEY
      }
    },
    knowledge: {
      id: 'knowledge-agent',
      type: 'knowledge',
      capabilities: ['knowledge_retrieval', 'fact_checking'],
      apiKeys: {
        openai: process.env.OPENAI_API_KEY,
        tavily: process.env.TAVILY_API_KEY
      }
    },
    newsFetcher: {
      id: 'news-fetcher-agent',
      type: 'newsFetcher',
      capabilities: ['news_search'],
      apiKeys: {
        tavily: process.env.TAVILY_API_KEY
      }
    },
    summarization: {
      id: 'summarization-agent',
      type: 'summarization',
      capabilities: ['content_summarization'],
      apiKeys: {
        openai: process.env.OPENAI_API_KEY
      }
    }
  },
  api: {
    openai: {
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 1000
    },
    tavily: {
      searchDepth: "advanced",
      includeDomains: [
        "news.google.com",
        "reuters.com",
        "bloomberg.com",
        "techcrunch.com",
        "theverge.com"
      ]
    }
  },
  workflowDefaults: {
    maxRetries: 3,
    timeoutMs: 60000, // Increased to 60 seconds
    concurrentTasks: 2  // Reduced to prevent rate limiting
  }
};
