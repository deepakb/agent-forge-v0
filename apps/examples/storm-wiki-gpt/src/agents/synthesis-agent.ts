import { BaseAgent } from './base-agent';
import { AgentMessage, MessageType, SearchResult, SynthesisAgentConfig, TaskResult } from '../types';
import { OpenAIHelper } from '../utils/openai-helper';
import { Logger } from '@agent-forge/shared';
import { EventEmitter } from 'events';

export class SynthesisAgent extends BaseAgent {
  private openai: OpenAIHelper;
  private completionEmitter: EventEmitter;

  constructor(config: SynthesisAgentConfig) {
    super(config);
    this.openai = new OpenAIHelper(config);
    this.completionEmitter = new EventEmitter();
  }

  private generateTableOfContents(sections: string[]): string {
    return `
## Contents
${sections.map((section, index) => `${index + 1}. [${section}](#${section.toLowerCase().replace(/\s+/g, '-')})`).join('\n')}
`;
  }

  public async handleMessage(message: AgentMessage): Promise<TaskResult> {
    try {
      if (message.type !== MessageType.SEARCH_RESULTS) {
        throw new Error(`Invalid message type for SynthesisAgent: ${message.type}`);
      }

      const searchResults = message.data as SearchResult[];
      this.logger.info('Synthesizing article from search results', {
        agentId: this.getId(),
        resultCount: searchResults.length,
      });

      // Prepare content for synthesis with source tracking
      const contentForSynthesis = searchResults
        .map((result, index) => `[Source ${index + 1}]
Title: ${result.title}
URL: ${result.url}
Content: ${result.content}`)
        .join('\n\n');

      const prompt = `You are tasked with writing a comprehensive Wikipedia-style article based on the provided search results. Follow these requirements carefully:

1. Structure:
   - Start with a brief lead section (no heading) that summarizes the topic
   - Include a table of contents
   - Organize content into logical sections with proper headings (use ## for main sections)
   - Use subsections where appropriate (use ### for subsections)

2. Content Guidelines:
   - Write in an encyclopedic, neutral tone
   - Focus on factual information
   - Include relevant technical details
   - Maintain objectivity
   - Use formal language

3. Citations:
   - Add citations using [1], [2], etc.
   - Include a References section at the end
   - Link citations to the provided source URLs
   - Add citations after key facts and claims

4. Formatting:
   - Use Markdown formatting
   - Use bullet points or numbered lists where appropriate
   - Include relevant section headings like:
     * Overview/Introduction
     * History
     * Technical details/Technology
     * Applications/Uses
     * Impact/Significance
     * Future developments
     * See also
     * References

5. Special Elements:
   - Add a "See also" section with related topics
   - Include any relevant notes or external links

Here are the search results to use as sources:

${contentForSynthesis}

Write the article now, ensuring proper citation of sources and Wikipedia-style formatting.`;

      const article = await this.openai.complete(prompt);

      this.logger.info('Article synthesis completed', {
        agentId: this.getId(),
        articleLength: article.length,
      });

      const nextMessage: AgentMessage = {
        type: MessageType.ARTICLE,
        source: this.getId(),
        target: 'workflow',
        data: article,
      };

      await this.publishMessage(nextMessage);

      // Emit completion event
      this.completionEmitter.emit('synthesisComplete', { 
        content: article, 
        sources: searchResults.map(result => result.url) 
      });

      return {
        success: true,
        message: nextMessage,
      };
    } catch (error) {
      this.logger.error('Synthesis agent failed', error instanceof Error ? error : new Error('Unknown error'));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public onSynthesisComplete(callback: (result: { content: string; sources: string[] }) => void): void {
    try {
      this.completionEmitter.on('synthesisComplete', callback);
      Logger.info('SynthesisAgent registered completion callback');
    } catch (error) {
      Logger.error('Error registering synthesis completion callback', { error });
      throw error;
    }
  }

  public initialize(): void {
    Logger.info('SynthesisAgent initialized successfully', { agentId: this.getId() });
  }

  public cleanup(): void {
    this.completionEmitter.removeAllListeners();
    Logger.info('SynthesisAgent cleaned up successfully', { agentId: this.getId() });
  }
}
