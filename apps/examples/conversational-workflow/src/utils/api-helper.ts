import axios from 'axios';

export class TavilyAPI {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async searchNews(query: string): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/search`,
        {
          query,
          search_depth: 'advanced',
          include_domains: ['news.google.com', 'reuters.com', 'bloomberg.com', 'cnbc.com'],
          include_answer: false,
          include_images: false,
          max_results: 5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
          },
        }
      );

      return response.data.results || [];
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  }

  public async searchKnowledge(query: string): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/search`,
        {
          query,
          search_depth: 'advanced',
          include_answer: true,
          include_images: false,
          max_results: 5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
          },
        }
      );

      return response.data.results || [];
    } catch (error) {
      console.error('Error searching knowledge:', error);
      throw error;
    }
  }
}
