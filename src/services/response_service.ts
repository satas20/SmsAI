import OpenAIService from './openai_service';
import { removeLinks } from '../utils/remove_links';
import { SystemMessages } from '../utils/constants';

type KafkaMessage = {
  phoneNumber: string;
  jobId: string;
  id: string;
  message: string;
  timestamp: string;
  operator: string;
};

export class ResponseService {
  private openaiService: OpenAIService;

  constructor(openaiService: OpenAIService) {
    this.openaiService = openaiService;
  }
  public prepareReply(kafkaMessage: KafkaMessage) {
    if (this.isSystemMessage(kafkaMessage.message)) {
      return this.prepareSystemMessage(kafkaMessage);
    } else {
      return this.prepareAIReply(kafkaMessage);
    }
  }
  private async prepareSystemMessage(kafkaMessage: KafkaMessage) {
    throw new Error('Method not implemented.');
  }

  private async prepareAIReply(
    kafkaMessage: KafkaMessage,
  ): Promise<string | undefined> {
    try {
      console.log(
        `Response Service: Processing message: ${JSON.stringify(kafkaMessage)}`,
      );

      // Generate a response using OpenAI
      const openaiResponse = await this.openaiService.createResponse(
        kafkaMessage.message +
          'Do web search if needed dont return any links  keep it as short as possible  after you create the response refactor it and remove any links that is present as source ',
      );

      const { textResponse, isWebSearch } =
        this.formatOpenAIResponse(openaiResponse);

      if (!textResponse) {
        throw new Error('OpenAI did not return a valid response.');
      }

      // Remove links from the generated message
      const cleanedMessage = removeLinks(textResponse);
      console.log(`Response Service: Cleaned message: ${cleanedMessage}`);

      await this.updateCredits(kafkaMessage, isWebSearch);
      const finallMessage = await this.addCredditInfo(cleanedMessage);

      return finallMessage;
    } catch (error) {
      console.error('Response Service: Error processing response:', error);
    }
  }
  private async updateCredits(
    kafkaMessage: KafkaMessage,
    isWebSearch: boolean,
  ) {
    //TODO: look up to DBand get remainingCredits and decrement it
  }
  private addCredditInfo(cleanedMessage: string) {
    //TODO: look up to DBand get remainingCredits and add it to the message
    return cleanedMessage;
  }
  private isSystemMessage(message: any): boolean {
    return Object.values(SystemMessages).includes(message);
  }
  private formatOpenAIResponse(response: any) {
    const textResponse = response.output.find((x: any) => x.type === 'message')
      ?.content[0].text;

    const isWebSearch = response.output.some(
      (x: any) => x.type === 'web_search_call',
    );

    if (!textResponse) {
      throw new Error('OpenAI did not return a valid response.');
    }

    return { textResponse, isWebSearch };
  }
}
