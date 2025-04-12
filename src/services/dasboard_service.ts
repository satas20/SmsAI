import { UserSubscription } from '../models/user_subscription';
import { UsageHistory } from '../models/usage_history';
import { Subscription } from '../models/subscription';

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
        startDate: subscription?.getDataValue('startDate'),
        endDate: subscription?.getDataValue('endDate'),
        remainingCredits: subscription?.getDataValue('remainingCredits'),
        isActive: subscription?.getDataValue('isActive'),
        createdAt: subscription?.getDataValue('createdAt'),
        updatedAt: subscription?.getDataValue('updatedAt'),
      };

      return {
        subscription: finalSubscription,
        usageHistory,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }
}
