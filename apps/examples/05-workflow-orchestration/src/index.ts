import { WorkflowEngine, WorkflowExecutor } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { documentWorkflow } from './workflow-definition';
import { DocumentProcessor } from './agents/document-processor';
import { SentimentAnalyzer, TopicClassifier, PhraseExtractor } from './agents/analyzer-agents';
import { ReportGenerator } from './agents/report-generator';

async function main() {
  try {
    // Create workflow engine
    const workflowEngine = new WorkflowEngine();

    // Create agents
    const documentProcessor = new DocumentProcessor({
      id: 'document-processor',
      name: 'Document Processor',
      type: 'processor',
      capabilities: ['text-extraction']
    });

    const sentimentAnalyzer = new SentimentAnalyzer({
      id: 'sentiment-analyzer',
      name: 'Sentiment Analyzer',
      type: 'analyzer',
      capabilities: ['sentiment-analysis']
    });

    const topicClassifier = new TopicClassifier({
      id: 'topic-classifier',
      name: 'Topic Classifier',
      type: 'analyzer',
      capabilities: ['topic-classification']
    });

    const phraseExtractor = new PhraseExtractor({
      id: 'phrase-extractor',
      name: 'Phrase Extractor',
      type: 'analyzer',
      capabilities: ['phrase-extraction']
    });

    const reportGenerator = new ReportGenerator({
      id: 'report-generator',
      name: 'Report Generator',
      type: 'generator',
      capabilities: ['report-generation']
    });

    // Initialize agents
    await Promise.all([
      documentProcessor.initialize({}),
      sentimentAnalyzer.initialize({}),
      topicClassifier.initialize({}),
      phraseExtractor.initialize({}),
      reportGenerator.initialize({})
    ]);

    // Register agents with workflow engine
    workflowEngine.registerAgent(documentProcessor);
    workflowEngine.registerAgent(sentimentAnalyzer);
    workflowEngine.registerAgent(topicClassifier);
    workflowEngine.registerAgent(phraseExtractor);
    workflowEngine.registerAgent(reportGenerator);

    // Create workflow executor
    const executor = new WorkflowExecutor(workflowEngine);

    // Start workflow execution
    Logger.info('Starting document processing workflow');
    
    const result = await executor.execute(documentWorkflow, {
      documentId: 'doc-001'
    });

    Logger.info('Workflow completed', { result });

    // Display final summary
    if (result.success && result.data.summary) {
      console.log('\nFinal Report:');
      console.log('--------------');
      console.log(result.data.summary);
    }

    // Cleanup
    await Promise.all([
      documentProcessor.stop(),
      sentimentAnalyzer.stop(),
      topicClassifier.stop(),
      phraseExtractor.stop(),
      reportGenerator.stop()
    ]);

  } catch (error) {
    Logger.error('Error in main', { error });
    process.exit(1);
  }
}

main().catch(error => {
  Logger.error('Unhandled error', { error });
  process.exit(1);
});
