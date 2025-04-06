// filepath: src/services/openai.service.ts
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

interface OpenAIChatResponse {
  role: string;
  content: string | null;
}

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not set in the environment variables.',
      );
    }
    this.openai = new OpenAI({ apiKey });
  }
  public async createResponse(prompt: string): Promise<any> {
    try {
      const response = await this.openai.responses.create({
        model: 'gpt-4o',
        // tools: [{ type: 'web_search_preview', search_context_size: 'low' }],
        input: [{ role: 'system', content: prompt }],
      });
      return response;
    } catch (error: any) {
      console.error('Error calling OpenAI:', error.message);
      throw new Error(`Failed to get response from OpenAI: ${error.message}`);
    }
  }
  public async getUserInput(prompt: string): Promise<OpenAIChatResponse> {
    try {
      const response = await this.openai.chat.completions.create({
        messages: [{ role: 'system', content: prompt }],
        model: 'gpt-4-1106-preview',
        max_tokens: 250,
      });

      if (response.choices && response.choices.length > 0) {
        return {
          role: response.choices[0].message.role,
          content: response.choices[0].message.content,
        };
      } else {
        throw new Error('No response from OpenAI');
      }
    } catch (error: any) {
      console.error('Error calling OpenAI:', error.message);
      throw new Error(`Failed to get response from OpenAI: ${error.message}`);
    }
  }
}

export default OpenAIService;
