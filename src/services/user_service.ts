import { User } from '../models/user';
import { UserSubscription } from '../models/user_subscription';
import { Subscription } from '../models/subscription';
import SMSService from './sms_service';
import { UserSubscriptionLog } from '../models/user_subscription_log';
export class UserService {
  public async createNewUser(phoneNumber: string) {
    const user = await User.create({
      phoneNumber,
    });
    const userId = user.getDataValue('id');

    const freeSub = await Subscription.findOne({
      where: { name: 'free' },
    });
    const credits = freeSub?.getDataValue('credits') || 0;
    const subscriptionId = freeSub?.getDataValue('id') || null;
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
      'Welcome to SMS-AI! You have been given free ' +
        credits +
        ' credits. Enjoy your experience! :help: for help',
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
}
