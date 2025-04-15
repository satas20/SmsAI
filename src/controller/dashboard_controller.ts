import { Request, Response } from 'express';
import { DashboardService } from '../services/dasboard_service';
import { AuthenticatedRequest } from '../types/types';
export class DashboardController {
  /**
   * Handles OTP request
   */
  public async getDashboardInfo(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> {
    try {
      const body = req.body;

      const userId: number = Number(req.user.id); // Extract user ID from the JWT payload and convert to number
      const phoneNumber = req.user.phoneNumber; // Extract phone number from the JWT payload

      // Fetch user-specific data (e.g., subscriptions, usage history)
      const dashboardService = new DashboardService();
      const { subscription, usageHistory } =
        await dashboardService.getDashboardInfo(userId, phoneNumber);
      res.status(200).json({
        subscription,
        usageHistory,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data.' });
    }
  }

  public async initPurchase(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> {
    try {
      const body = req.body;
      const userId: number = Number(req.user.id); // Extract user ID from the JWT payload and convert to number
      const phoneNumber = req.user.phoneNumber; // Extract phone number from the JWT payload
      const userIp = req.ip; // Extract user IP address from the request object
      const subscriptionId = body.subscriptionId; // Extract subscription ID from the request body
      const paymentInfo = body.paymentInfo; // Extract payment information from the request body
      const dashboardService = new DashboardService();
      paymentInfo.userIp = userIp; // Add user IP address to payment information
      // Initialize purchase process
      const iFrameToken = await dashboardService.initPurchase(
        userId,
        subscriptionId,
        paymentInfo,
      );
      // Send the iFrame token back to the client
      res.status(200).json({ iFrameToken });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Failed to generate iFrameToken' });
    }
  }
}
