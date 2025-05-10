// filepath: src/services/openai.service.ts
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { DynamicRetrievalConfigMode, GoogleGenAI } from '@google/genai';
import { ResponseInput } from 'openai/resources/responses/responses';
import { LogManager } from './log_manager';

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY_FREE;
// const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
interface OpenAIChatResponse {
  role: string;
  content: string | null;
}

const logManager = new LogManager('AIService');
class AIService {
  private openaiGPT: OpenAI;
  private openaiDeepSeek: OpenAI;
  private gemini: GoogleGenAI;

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
    this.gemini = new GoogleGenAI({
      apiKey: GOOGLE_API_KEY,
    });
  }

  public async createGeminiWSResponse(prompt: string): Promise<any> {
    try {
      const response = await this.gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          tools: [
            {
              googleSearch: {
                dynamicRetrievalConfig: {
                  dynamicThreshold: 0.8,
                  mode: DynamicRetrievalConfigMode.MODE_DYNAMIC,
                },
              },
            },
          ],
        },
      });
      const geminiResponse = response.text;
      return geminiResponse;
    } catch (error: any) {
      logManager.log('error', `Error calling Gemini: ${error.message}`);
      throw new Error(`Failed to get response from Gemini: ${error.message}`);
    }
  }
  public async createWSDisabledResponse(prompt: any): Promise<any> {
    try {
      const response = await this.openaiGPT.responses.create({
        model: 'gpt-4.1-nano',
        // tools: [{ type: 'web_search_preview', search_context_size: 'low' }],
        input: prompt,
      });
      return response.output_text;
    } catch (error: any) {
      logManager.log('error', `Error calling OpenAI: ${error.message}`);
      throw new Error(`Failed to get response from OpenAI: ${error.message}`);
    }
  }
  public async createDeepseekResponse(messages: any): Promise<any> {
    try {
      const completion = await this.openaiDeepSeek.chat.completions.create({
        messages: messages,
        max_tokens: 250,
        model: 'deepseek-chat', // Use the DeepSeek model
      });

      const deepSeekResponse = completion.choices[0].message.content;
      return deepSeekResponse;
    } catch (error: any) {
      logManager.log('error', `Error calling DeepSeek: ${error.message}`);
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
      logManager.log('error', `Error calling OpenAI: ${error.message}`);
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
      logManager.log('error', `Error calling OpenAI: ${error.message}`);
      throw new Error(`Failed to get response from OpenAI: ${error.message}`);
    }
  }
}

export default AIService;
