import { Router } from 'express';
import { DashboardController } from '../controller/dashboard_controller';
import { authenticateJWT } from '../middleware/auth_middleware';

const router = Router();
const dashboardController = new DashboardController();

// Protect the route with JWT middleware
router.get('/info', authenticateJWT, (req, res) => {
  dashboardController.getDashboardInfo(req, res);
});

router.post('/initPurchase', authenticateJWT, (req, res) => {
  dashboardController.initPurchase(req, res);
});

export default router;
