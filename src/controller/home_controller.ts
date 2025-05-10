import { Request, Response } from 'express';
import { DashboardService } from '../services/dasboard_service';
import { UserService } from '../services/user_service';
import { LogManager } from '../services/log_manager';
const logManager = new LogManager('HomeController');
export class HomeController {
  public async getHomeStats(req: Request, res: Response): Promise<any> {
    try {
      const body = req.body;
      const userService = new UserService();
      const homeStats = await userService.getHomeStats();
      res.status(200).json({
        message: 'Home stats fetched successfully',
        data: homeStats,
      });
    } catch (error) {
      logManager.log('error', `Error fetching home stats: ${error}`);
      res.status(500).json({ message: 'Failed to fetch home stats' });
    }
  }
}
