import { UserSubscription } from '../models/user_subscription';
import { UsageHistory } from '../models/usage_history';
import { Subscription } from '../models/subscription';
import { PayTRService } from './paytr_service';
import { IyzicoService } from './iyzico_service';
export class DashboardService {
  /**
   * Fetches dashboard information for a specific user
   * @param userId - The ID of the user
   * @param phoneNumber - The phone number of the user
   * @returns Object containing welcome message, subscriptions, and usage history
   */
  public async getDashboardInfo(userId: number, phoneNumber: string) {
    try {
      // Fetch active subscriptions for the user
      const subscription = await UserSubscription.findOne({
        where: { userId, isActive: true },
      });
      const subscriptionDetails = await Subscription.findOne({
        where: { id: subscription?.getDataValue('subscriptionId') },
      });

      // Fetch recent usage history for the user
      const usageHistory = await UsageHistory.findAll({
        where: { userId },
        limit: 30,
        order: [['createdAt', 'ASC']],
      });
      const finalSubscription = {
        name: subscriptionDetails?.getDataValue('name'),
        websSearch: subscriptionDetails?.getDataValue('websSearch'),
        price: subscriptionDetails?.getDataValue('price'),
        credits: subscriptionDetails?.getDataValue('credits'),
        id: subscription?.getDataValue('id'),
        subscriptionId: subscription?.getDataValue('subscriptionId'),
        startDate: subscription?.getDataValue('startDate')
          ? new Date(subscription.getDataValue('startDate')).toLocaleDateString(
              'tr-TR',
            )
          : null,
        endDate: subscription?.getDataValue('endDate')
          ? new Date(subscription.getDataValue('endDate')).toLocaleDateString(
              'tr-TR',
            )
          : null,
        remainingCredits: subscription?.getDataValue('remainingCredits'),
        isActive: subscription?.getDataValue('isActive'),
        createdAt: subscription?.getDataValue('createdAt')
          ? new Date(subscription.getDataValue('createdAt')).toLocaleDateString(
              'tr-TR',
            )
          : null,
        updatedAt: subscription?.getDataValue('updatedAt')
          ? new Date(subscription.getDataValue('updatedAt')).toLocaleDateString(
              'tr-TR',
            )
          : null,
      };

      const formatedUsageHistory = usageHistory.map((history) => {
        return {
          id: history.getDataValue('id'),
          userId: history.getDataValue('userId'),
          type: history.getDataValue('type'),
          action: history.getDataValue('action'),
          response: history.getDataValue('response'),
          message: history.getDataValue('message'),
          creditUsed: history.getDataValue('creditUsed'),
          phoneNumber: history.getDataValue('phoneNumber'),
          createdAt: history.getDataValue('createdAt')
            ? new Date(history.getDataValue('createdAt')).toLocaleDateString(
                'tr-TR',
              )
            : null,
          updatedAt: history.getDataValue('updatedAt')
            ? new Date(history.getDataValue('updatedAt')).toLocaleDateString(
                'tr-TR',
              )
            : null,
        };
      });

      return {
        subscription: finalSubscription,
        usageHistory: formatedUsageHistory,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  public async initPurchase(
    userId: number,
    subscriptionId: number,
    paymentInfo: any,
  ): Promise<any> {
    try {
      const iyzicoService = new IyzicoService();

      const subscription = await Subscription.findOne({
        where: { id: subscriptionId },
      });
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      const price = Number(subscription.getDataValue('price'));
      const response = await iyzicoService.initCF({
        price: price,
        userId: userId,
        ...paymentInfo,
        subscription: subscription,
      });
      return response;
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      throw new Error('Failed to purchase subscription');
    }
  }
}
