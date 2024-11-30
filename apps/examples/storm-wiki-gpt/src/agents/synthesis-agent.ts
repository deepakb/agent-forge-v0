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

3. Citations (VERY IMPORTANT):
   - EVERY fact or claim must have a citation
   - Use numbered citations like [1], [2], etc.
   - Citations should appear immediately after the fact they support
   - Each source can be cited multiple times
   - Include a "## References" section at the end listing all sources
   - Format references as:
     [1] Title - URL
     [2] Title - URL
     etc.

4. Formatting:
   - Use Markdown formatting
   - Use bullet points or numbered lists where appropriate
   - Include these sections in order:
     1. Introduction (no heading)
     2. Table of Contents
     3. Main content sections
     4. See Also
     5. References

5. Example Citation Format:
   "React uses a virtual DOM to efficiently update the UI [1]. This approach, combined with its component-based architecture [2], makes it highly performant for complex web applications [1]."

Here are the search results to use as sources:

${contentForSynthesis}

Write the article now, ensuring EVERY fact has a citation and all sources are properly referenced at the end.`;

      this.logger.info('Starting article synthesis', {
        agentId: this.getId(),
        promptLength: prompt.length,
        sourceCount: searchResults.length,
      });

      const article = await this.openai.complete(prompt);

      // Verify citations are present
      const hasCitations = /\[\d+\]/.test(article);
      const hasReferences = /## References/.test(article);

      this.logger.info('Article synthesis completed', {
        agentId: this.getId(),
        articleLength: article.length,
        hasCitations,
        hasReferences,
      });

      if (!hasCitations || !hasReferences) {
        this.logger.warn('Article may be missing citations or references', {
          agentId: this.getId(),
          hasCitations,
          hasReferences,
        });
      }

      // Emit completion event first
      this.completionEmitter.emit('synthesisComplete', { 
        content: article, 
        sources: searchResults.map(result => result.url) 
      });

      const nextMessage: AgentMessage = {
        type: MessageType.ARTICLE,
        source: this.getId(),
        target: 'workflow',
        data: article,
      };

      // Then publish message to workflow
      try {
        await this.publishMessage(nextMessage);
      } catch (error) {
        throw new Error(`Failed to publish article message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

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
