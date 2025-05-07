import AIService from './ai_service';
import { removeLinks } from '../utils/remove_links';
import { CreditCosts, SystemMessages } from '../utils/constants';
import { UserService } from './user_service';
import { User } from '../models/user';
import { UserSubscription } from '../models/user_subscription';
import { UsageHistory } from '../models/usage_history';
import SMSService from './sms_service';
import { Subscription } from '../models/subscription';
import { Op } from 'sequelize';
type KafkaMessage = {
  phoneNumber: string;
  jobId: string;
  id: string;
  message: string;
  timestamp: string;
  operator: string;
};

const freeSystemPrompt =
  'You are SMS AI,  SMS-based AI assistant founded by yound entepuneur Ata Ayyıldız.  You are runing for free verison.Answer user questions based on the following:' +
  ' SMS AI allows AI interaction via SMS, even without internet.' +
  ' Features: web search, summaries, creative content. Future: MMS for images/music.' +
  ' Free users: 10 messages (non-web search).' +
  ' Target: users with limited/no internet (e.g., military personnel, remote areas).' +
  ' If answer requires web search, suggest using paid version free version dont have websearches.' +
  ' Rules:' +
  ' - Simulate SMS responses.' +
  ' - Keep responses concise (under 100 tokens).' +
  ' - Avoid technical details unless explicitly asked.';
const paidSystemPrompt =
  'You are SMS AI, an SMS-based AI assistant founded by young entrepreneur Ata Ayyıldız. Answer user questions based on the following:' +
  ' SMS AI allows AI interaction via SMS, even without internet.' +
  ' User has disabled web search for this prompt.' +
  ' If answer requires web search, suggest using :ws: prefix to enable web searches. like this ":ws: your question?"' +
  ' Rules:' +
  ' - Simulate SMS responses.' +
  ' - Keep responses concise (under 300 tokens).' +
  ' - Avoid technical details unless explicitly asked.' +
  ' - Be helpful and informative using your existing knowledge.';

export class ResponseService {
  private aiService: AIService;

  constructor(openaiService: AIService) {
    this.aiService = openaiService;
  }
  public prepareReply(kafkaMessage: KafkaMessage) {
    if (this.isSystemMessage(kafkaMessage.message)) {
      return this.prepareSystemMessage(kafkaMessage);
    } else {
      return this.prepareAIReply(kafkaMessage);
    }
  }
  private async prepareSystemMessage(kafkaMessage: KafkaMessage) {
    const message = kafkaMessage.message.trim();
    const userService = new UserService();
    let user;
    let userSubscription;
    user = await userService.findUserByPhoneNumber(kafkaMessage.phoneNumber);
    let response: string = 'systemmessage';
    if (!user) {
      const newUserData = await userService.createNewUser(
        kafkaMessage.phoneNumber,
      );
      user = newUserData.user;
      userSubscription = newUserData.userSubscription;
    }
    if (!userSubscription) {
      userSubscription = await userService.getUserSubscriptionWithUserId(
        user.getDataValue('id'),
      );
    }
    if (message === SystemMessages.ADMIN) {
      response = 'admin hesabı tanımlandı';
      const proSub = await Subscription.findOne({
        where: { name: 'pro' },
      });
      const credits = proSub?.getDataValue('credits') || 0;
      const subscriptionId = proSub?.getDataValue('id') || 1;
      await UserSubscription.destroy({
        where: { userId: user.getDataValue('id') },
      });

      await UserSubscription.create({
        userId: user.getDataValue('id'),
        subscriptionId: subscriptionId,
        remainingCredits: credits,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
    }

    if (message === SystemMessages.HELP) {
      response = `Kullanılabilir Komutlar:
    :info: - Mevcut paket bilginiz ve kalan mesaj hakkınızı öğrenin
    :buy: - Yeni paket satın alın
    :smsai: - SMS-AI hakkında bilgi alın
    :help: - Bu mesajı tekrar gönderin

    Mesaj Gönderme Seçenekleri:
    1. Normal Mesaj: Direkt sorunuzu yazın (Yapay zeka gerektiğinde web araması yapar)
    2.  Web Aramalı: Mesajın başına :ws: ekleyin (örn: :ws: hava durumu)
    3. Web Aramasız: Mesajın başına :ws!: ekleyin (örn: :ws!: 2+2 kaç)

    Not: Web araması özelliği  ücretsiz deneme paketinde mevcut değildir.`;
    }
    if (message === SystemMessages.INFO) {
      const remainingCredits =
        userSubscription?.getDataValue('remainingCredits') || 0;
      const subscription = await Subscription.findOne({
        where: { id: userSubscription?.getDataValue('subscriptionId') },
      });
      if (!subscription) {
        throw new Error('Subscription not found.');
      }
      const subscriptionName = subscription.getDataValue('name');
      const subscriptionCredits = subscription.getDataValue('credits');
      const subscriptionPrice = subscription.getDataValue('price');
      response = 'Mevcut paketiniz: ' + subscriptionName;
      response += `\nPaketinizin fiyatı: ${subscriptionPrice} TL`;
      response += `\nKalan mesaj hakkınız: ${remainingCredits} / ${subscriptionCredits} mesaj`;
      response += '\n paket özellikleri:';
      const features = subscription.getDataValue('webSearch')
        ? 'web araması mevcut'
        : 'web araması yok';
      response += `${features}`;
      const endDate = userSubscription?.getDataValue('endDate');
      response += `\nPaket Bitiş Tarihi: ${endDate ? new Date(endDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}`;
      response += `\nPaketinizi değiştirmek için :buy: yazabilirsiniz.`;
    }
    if (message === SystemMessages.BUY) {
      const subscriptions = await Subscription.findAll({
        where: { name: { [Op.ne]: 'free' } },
      });
      response = 'Alabileceğiniz paketler: ';
      let packageinfo = '';

      subscriptions.forEach((subscription) => {
        packageinfo += `\n${subscription.getDataValue('name')}: ${subscription.getDataValue(
          'credits',
        )} mesaj - ${subscription.getDataValue('price')} TL`;
      });

      response +=
        '\nPaketleri smsai.site üzerinden alabilirsiniz. SMS ile satın almak çok yakında aktif olacak.';
    }
    if (message === SystemMessages.SMSAI) {
      response = `SMS-AI, yapay zeka destekli bir mesajlaşma hizmetidir.İnternete ihtiyaç duymadan yapay zeka kullanabilirsiniz. Web araması yapabilme özelliği ile güncel bilgilere ulaşmanızı sağlar. detaylı bilgi  ve kullanım talimatı için :help: yazabilirsiniz.`;
    }
    this.logUsage(
      user.getDataValue('id'),
      kafkaMessage.phoneNumber,
      0,
      'system_message',
      kafkaMessage.message,
      response,
    );
    return response;
  }

  private async prepareAIReply(
    kafkaMessage: KafkaMessage,
  ): Promise<string | undefined> {
    try {
      const userService = new UserService();
      const { remainingCredits, subscription } =
        await this.checkUserCredits(kafkaMessage);

      if (remainingCredits <= 0) {
        return 'Mesaj gönderme hakkınız kalmadı. Yeni bir paket almak için :buy: yazabilirsiniz.';
      }

      const user = await userService.findUserByPhoneNumber(
        kafkaMessage.phoneNumber,
      );
      const userId = user?.getDataValue('id');

      // Handle the 4 cases
      let textResponse: string;
      let isWebSearch: boolean;

      if (subscription.getDataValue('name') === 'free') {
        // Case 1: Free user
        ({ textResponse, isWebSearch } =
          await this.handleFreeUser(kafkaMessage));
      } else {
        // Cases 2, 3, and 4: Paid user
        const forceWS = kafkaMessage.message.startsWith(':ws:');
        const disableWS = kafkaMessage.message.startsWith(':ws!:');

        if (forceWS) {
          // Case 2: Force web search
          ({ textResponse, isWebSearch } = await this.handleForceWebSearch(
            kafkaMessage,
            remainingCredits,
          ));
        } else if (disableWS) {
          // Case 3: Disable web search
          ({ textResponse, isWebSearch } =
            await this.handleDisableWebSearch(kafkaMessage));
        } else {
          // Case 4: Neutral (default behavior)
          ({ textResponse, isWebSearch } =
            await this.handleDisableWebSearch(kafkaMessage));
          // await this.handleNeutralSearch(kafkaMessage));
        }
      }

      if (!textResponse) {
        throw new Error('OpenAI did not return a valid response.');
      }

      // Finalize the response
      return await this.finalizeResponse(
        userId,
        kafkaMessage,
        textResponse,
        isWebSearch,
      );
    } catch (error) {
      console.error('Response Service: Error processing response:', error);
      return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }
  private async handleFreeUser(
    kafkaMessage: KafkaMessage,
  ): Promise<{ textResponse: string; isWebSearch: boolean }> {
    const deepseekMessage = [
      { role: 'system', content: freeSystemPrompt },
      { role: 'user', content: kafkaMessage.message },
    ];

    const textResponse =
      await this.aiService.createDeepseekResponse(deepseekMessage);
    return { textResponse, isWebSearch: false };
  }
  private async handleForceWebSearch(
    kafkaMessage: KafkaMessage,
    remainingCredits: number,
  ): Promise<{ textResponse: string; isWebSearch: boolean }> {
    if (remainingCredits < CreditCosts.WEB_SEARCH) {
      throw new Error(
        `Web araması yapabilmek için yeterli krediniz yok. Kalan mesajlarınız: ${remainingCredits}`,
      );
    }

    kafkaMessage.message = kafkaMessage.message.replace(':ws:', '');
    // const openaiResponse = await this.openaiService.createWSEnabledResponse(
    //   kafkaMessage.message +
    //     ' Do web search even if you know the answer. Don’t return any links. Keep it as short as possible.',
    // );
    // const formattedData = this.formatOpenAIResponse(openaiResponse);
    const textResponse = await this.aiService.createGeminiWSResponse(
      kafkaMessage.message,
    );
    return { textResponse: textResponse, isWebSearch: true };
  }
  private async handleDisableWebSearch(
    kafkaMessage: KafkaMessage,
  ): Promise<{ textResponse: string; isWebSearch: boolean }> {
    kafkaMessage.message = kafkaMessage.message.replace(':ws!:', '');
    const deepseekMessage = [
      { role: 'system', content: paidSystemPrompt },
      { role: 'user', content: kafkaMessage.message },
    ];

    const textResponse =
      await this.aiService.createDeepseekResponse(deepseekMessage);
    return { textResponse, isWebSearch: false };
  }
  private async handleNeutralSearch(
    kafkaMessage: KafkaMessage,
  ): Promise<{ textResponse: string; isWebSearch: boolean }> {
    const openaiResponse = await this.aiService.createWSEnabledResponse(
      kafkaMessage.message +
        ' Perform web search only if necessary for recent or specific information. Keep the response concise and factual.',
    );

    const formattedData = this.formatOpenAIResponse(openaiResponse);
    return {
      textResponse: formattedData.textResponse,
      isWebSearch: formattedData.isWebSearch,
    };
  }
  private async finalizeResponse(
    userId: string,
    kafkaMessage: KafkaMessage,
    textResponse: string,
    isWebSearch: boolean,
  ): Promise<string> {
    const cleanedMessage = removeLinks(textResponse);

    const { cost, newCredits } = await this.updateCredits(userId, isWebSearch);

    let finalMessage = cleanedMessage;
    finalMessage += ` \n Kullanım: ${isWebSearch ? 'web araması - ' : ''}${cost} Mesaj`;
    finalMessage += `\n Kalan Mesaj: ${newCredits}`;

    await this.logUsage(
      userId,
      kafkaMessage.phoneNumber,
      isWebSearch ? CreditCosts.WEB_SEARCH : CreditCosts.NORMAL_RESPONSE,
      'response',
      kafkaMessage.message,
      finalMessage,
    );

    return finalMessage;
  }
  async checkUserCredits(kafkaMessage: KafkaMessage) {
    const userService = new UserService();
    let user, userSubscription;
    user = await userService.findUserByPhoneNumber(kafkaMessage.phoneNumber);
    if (!user) {
      const newUserData = await userService.createNewUser(
        kafkaMessage.phoneNumber,
      );
      user = newUserData.user;
      userSubscription = newUserData.userSubscription;
    }
    const userId = user?.getDataValue('id');
    userSubscription = await userService.getUserSubscriptionWithUserId(userId);
    if (!userSubscription) {
      const newUserData = await userService.createNewUser(
        kafkaMessage.phoneNumber,
      );
      user = newUserData.user;
      userSubscription = newUserData.userSubscription;
    }
    const remainingCredits = userSubscription.getDataValue('remainingCredits');
    const subscription = await Subscription.findOne({
      where: { id: userSubscription.getDataValue('subscriptionId') },
    });
    if (!subscription) {
      throw new Error('Subscription not found.');
    }
    return { remainingCredits, subscription };
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
    return { cost, newCredits };
  }

  private isSystemMessage(message: any): boolean {
    const trimmedMessage = message.trim();
    return Object.values(SystemMessages).includes(trimmedMessage.toLowerCase());
  }
  private formatGpt_5Response(response: any) {
    const textResponse = response.choices[0].message.content;
    return { textResponse, isWebSearch: false };
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
    } catch (error) {
      console.error('Error logging usage history:', error);
    }
  }
}
