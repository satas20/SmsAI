import { User } from '../models/user';
import { UserSubscription } from '../models/user_subscription';
import { Subscription } from '../models/subscription';
import SMSService from './sms_service';
import { UserSubscriptionLog } from '../models/user_subscription_log';
import { UsageHistory } from '../models/usage_history';
export class UserService {
  async updateUserSubscription(userId: number, subscriptionId: number) {
    const userSubscription = await UserSubscription.findOne({
      where: { userId: userId },
    });
    const subscription = await Subscription.findOne({
      where: { id: subscriptionId },
    });
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (userSubscription) {
      await userSubscription.destroy();
    }
    const credits = subscription?.getDataValue('credits') || 0;
    UserSubscription.create({
      userId: userId,
      subscriptionId: subscriptionId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      remainingCredits: credits,
      isActive: true,
    });
    UserSubscriptionLog.create({
      userId: userId,
      subscriptionId: subscriptionId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
  }
  public async createNewUser(phoneNumber: string) {
    const user = await User.create({
      phoneNumber,
    });
    const userId = user.getDataValue('id');

    const freeSub = await Subscription.findOne({
      where: { name: 'free' },
    });
    const credits = freeSub?.getDataValue('credits') || 0;
    const subscriptionId = freeSub?.getDataValue('id') || 1;
    const userSubscription = await UserSubscription.create({
      userId: userId, // Replace with actual default subscription ID
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subscriptionId: subscriptionId,
      remainingCredits: credits,
      isActive: true,
    });
    const userSubscriptionLog = await UserSubscriptionLog.create({
      userId: userId,
      subscriptionId: subscriptionId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    const smsService = new SMSService();
    await smsService.sendSMS(
      "SMS-AI'ye Hoş Geldiniz! Size " +
        credits +
        ' ücretsiz mesaj tanımlandı. İyi deneyimler! SMSAI hakkında bilgi almak için :smsai: mevcut komutlar ve yardım için :help: yazın. Ücretsiz deneme süresi 30 gündür ve web araması mevcut değildir.\nBu hizmeti kullanmak Gizlilik ve Kullanıcı Sözleşmesini kabul ettiğiniz anlamına gelir. Gizlilik ve Kullanıcı Sözleşmesi ve detaylar için www.smsai.site adresini ziyaret et.',
      phoneNumber,
    );
    return { user, userSubscription };
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await User.findOne({
      where: { id },
    });
    return user;
  }
  public async findUserByPhoneNumber(
    phoneNumber: string,
  ): Promise<User | null> {
    const user = await User.findOne({
      where: { phoneNumber },
    });
    return user;
  }
  public async getUserwithUserId(userId: number): Promise<User | null> {
    const user = await User.findOne({
      where: { id: userId },
    });
    return user;
  }
  public async getUserSubscriptionWithUserId(
    userId: string,
  ): Promise<UserSubscription | null> {
    const userSubscription = await UserSubscription.findOne({
      where: { userId: userId },
    });
    return userSubscription;
  }
  public async updateUserCreditsWithUserId(
    userId: string,
    credits: number,
  ): Promise<void> {
    await UserSubscription.update(
      { remainingCredits: credits },
      { where: { userId } },
    );
  }

  public async getHomeStats() {
    const totalUsers = await User.count();
    const totalMessages = await UsageHistory.count();
    const totalSubscriptions = await UserSubscription.count();
    const result = {
      totalUsers,
      totalMessages,
      totalSubscriptions,
    };
    return result;
  }
}
