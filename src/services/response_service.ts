import OpenAIService from './openai_service';
import { removeLinks } from '../utils/remove_links';
import { CreditCosts, SystemMessages } from '../utils/constants';
import { UserService } from './user_service';
import { User } from '../models/user';
import { UserSubscription } from '../models/user_subscription';
import { UsageHistory } from '../models/usage_history';
import SMSService from './sms_service';
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
      const userService = new UserService();

      const credits = await this.checkUserCredits(kafkaMessage);
      if (credits <= 0) {
        console.log(
          `Response Service: No credits left for user ${kafkaMessage.phoneNumber}.`,
        );
        return 'No credits left. Please recharge your account.';
      }
      const user = await userService.findUserByPhoneNumber(
        kafkaMessage.phoneNumber,
      );
      const userId = user?.getDataValue('id');
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

      const remainingCredits = await this.updateCredits(userId, isWebSearch);
      const finallMessage =
        cleanedMessage + '    remainingCredits: ' + remainingCredits;

      // Log usage history
      await this.logUsage(
        userId,
        kafkaMessage.phoneNumber,
        isWebSearch ? CreditCosts.WEB_SEARCH : CreditCosts.NORMAL_RESPONSE,
        'response',
        kafkaMessage.message,
        finallMessage,
      );

      return finallMessage;
    } catch (error) {
      const userService = new UserService();
      const user = await userService.findUserByPhoneNumber(
        kafkaMessage.phoneNumber,
      );
      const userId = user?.getDataValue('id');
      await this.logUsage(
        userId,
        kafkaMessage.phoneNumber,
        0,
        'error',
        kafkaMessage.message,
        'something went wrong',
      );
      console.error('Response Service: Error processing response:', error);
    }
  }
  async checkUserCredits(kafkaMessage: KafkaMessage) {
    const userService = new UserService();
    const user = await userService.findUserByPhoneNumber(
      kafkaMessage.phoneNumber,
    );
    if (!user) {
      const { user, userSubscription } = await userService.createNewUser(
        kafkaMessage.phoneNumber,
      );
      return userSubscription.getDataValue('remainingCredits');
    }
    const userId = user?.getDataValue('id');
    const userSubscription =
      await userService.getUserSubscriptionWithUserId(userId);
    if (!userSubscription) {
      const { user, userSubscription } = await userService.createNewUser(
        kafkaMessage.phoneNumber,
      );
      return userSubscription.getDataValue('remainingCredits');
    }
    const remainingCredits = userSubscription.getDataValue('remainingCredits');
    return remainingCredits;
  }
  private async updateCredits(userId: string, isWebSearch: boolean) {
    const userService = new UserService();
    const userSubscription =
      await userService.getUserSubscriptionWithUserId(userId);
    const cost = isWebSearch
      ? CreditCosts.WEB_SEARCH
      : CreditCosts.NORMAL_RESPONSE;
    const remainingCredits = userSubscription?.getDataValue('remainingCredits');
    const newCredits = remainingCredits - cost;
    await userService.updateUserCreditsWithUserId(userId, newCredits);
    return newCredits;
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

  public async logUsage(
    userId: string,
    phoneNumber: string,
    creditsUsed: number,
    action: string,
    message: string,
    response: string,
  ): Promise<void> {
    try {
      const usageHistory = await UsageHistory.create({
        userId,
        phoneNumber,
        creditsUsed,
        action,
        message,
        response,
      });
      console.log('Usage history logged:', usageHistory);
    } catch (error) {
      console.error('Error logging usage history:', error);
    }
  }
}
