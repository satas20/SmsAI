import { Request, Response } from 'express';
import { DashboardService } from '../services/dasboard_service';
import { AuthenticatedRequest } from '../types/types';
import dotenv from 'dotenv';
import { LogManager } from '../services/log_manager';

dotenv.config();
const logManager = new LogManager('PurchaseController');

export class PurchaseController {
  public async processCallback(req: Request, res: Response) {
    try {
      const body = req.body;
      const dashboardService = new DashboardService();
      const result = await dashboardService.processCallback(body);
      const { status, conversationId, subscriptionId, phoneNumber } = result;

      const redirectUrl = `${process.env.FRONTEND_URL}/purchase/result?status=${status}&conversationId=${conversationId}&subscriptionId=${subscriptionId}&phoneNumber=${phoneNumber}`;
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redirecting...</title>
          <script>
            // Redirect to the desired URL
            window.location.href = "${redirectUrl}";
          </script>
        </head>
        <body>
          <p>Redirecting to <a href="${redirectUrl}">${redirectUrl}</a>...</p>
        </body>
        </html>
      `);
      // res.status(200).send(result);
    } catch (error) {
      logManager.log('error', `Error processing callback: ${error}`);
      res.status(500).json({ message: 'Failed to process callback' });
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
      const data = await dashboardService.initPurchase(
        userId,
        subscriptionId,
        paymentInfo,
      );

      res.status(200).json({
        message: 'Payment initialized successfully',
        data: data,
      });
    } catch (error) {
      logManager.log('error', `Error initializing purchase: ${error}`);
      res.status(500).json({ message: 'Failed to generate iFrameToken' });
    }
  }
}
