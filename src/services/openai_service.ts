// filepath: src/services/openai.service.ts
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
interface OpenAIChatResponse {
  role: string;
  content: string | null;
}

class OpenAIService {
  private openaiGPT: OpenAI;
  private openaiDeepSeek: OpenAI;

  constructor() {
    if (!OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY is not set in the environment variables.',
      );
    }
    this.openaiGPT = new OpenAI({ apiKey: OPENAI_API_KEY });
    this.openaiDeepSeek = new OpenAI({
      baseURL: 'https://api.deepseek.com', // DeepSeek API base URL
      apiKey: DEEPSEEK_API_KEY, // Use DeepSeek API key from environment variables
    });
  }
  public async createWSDisabledResponse(prompt: string): Promise<any> {
    try {
      const response = await this.openaiGPT.responses.create({
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
  public async createFreeResponse(messages: any): Promise<any> {
    try {
      const completion = await this.openaiDeepSeek.chat.completions.create({
        messages: messages,
        max_tokens: 250,
        model: 'deepseek-chat', // Use the DeepSeek model
      });

      const deepSeekResponse = completion.choices[0].message.content;
    } catch (error: any) {
      console.error('Error calling OpenAI:', error.message);
      throw new Error(`Failed to get response from OpenAI: ${error.message}`);
    }
  }

  public async createWSEnabledResponse(prompt: string): Promise<any> {
    try {
      const response = await this.openaiGPT.responses.create({
        model: 'gpt-4o',
        tools: [{ type: 'web_search_preview', search_context_size: 'low' }],
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
      const response = await this.openaiGPT.chat.completions.create({
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
