import { Workflow, WorkflowStep, WorkflowCondition } from '@agent-forge/core';

export interface DocumentWorkflowData {
  documentId: string;
  content?: string;
  sentiment?: string;
  topics?: string[];
  keyPhrases?: string[];
  summary?: string;
}

export const documentWorkflow: Workflow<DocumentWorkflowData> = {
  id: 'document-processing',
  name: 'Document Processing Workflow',
  description: 'Process and analyze documents with multiple agents',
  initialState: {
    documentId: '',
  },
  steps: [
    // Step 1: Extract text content
    {
      id: 'extract-content',
      name: 'Extract Document Content',
      agentId: 'document-processor',
      taskType: 'EXTRACT_CONTENT',
      dependencies: [],
      condition: (data) => !!data.documentId,
      onSuccess: (data, result) => ({
        ...data,
        content: result.content,
      }),
      onError: (error) => {
        throw new Error(`Content extraction failed: ${error.message}`);
      },
    },

    // Step 2a: Sentiment Analysis (parallel)
    {
      id: 'analyze-sentiment',
      name: 'Analyze Sentiment',
      agentId: 'sentiment-analyzer',
      taskType: 'ANALYZE_SENTIMENT',
      dependencies: ['extract-content'],
      condition: (data) => !!data.content,
      onSuccess: (data, result) => ({
        ...data,
        sentiment: result.sentiment,
      }),
    },

    // Step 2b: Topic Classification (parallel)
    {
      id: 'classify-topics',
      name: 'Classify Topics',
      agentId: 'topic-classifier',
      taskType: 'CLASSIFY_TOPICS',
      dependencies: ['extract-content'],
      condition: (data) => !!data.content,
      onSuccess: (data, result) => ({
        ...data,
        topics: result.topics,
      }),
    },

    // Step 2c: Key Phrase Extraction (parallel)
    {
      id: 'extract-phrases',
      name: 'Extract Key Phrases',
      agentId: 'phrase-extractor',
      taskType: 'EXTRACT_PHRASES',
      dependencies: ['extract-content'],
      condition: (data) => !!data.content,
      onSuccess: (data, result) => ({
        ...data,
        keyPhrases: result.phrases,
      }),
    },

    // Step 3: Generate Summary Report
    {
      id: 'generate-report',
      name: 'Generate Summary Report',
      agentId: 'report-generator',
      taskType: 'GENERATE_REPORT',
      dependencies: ['analyze-sentiment', 'classify-topics', 'extract-phrases'],
      condition: (data) => !!(data.sentiment && data.topics && data.keyPhrases),
      onSuccess: (data, result) => ({
        ...data,
        summary: result.summary,
      }),
    },
  ],
};
