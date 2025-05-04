import { Router } from 'express';
import { DashboardController } from '../controller/dashboard_controller';
import { authenticateJWT } from '../middleware/auth_middleware';
import { PurchaseController } from '../controller/purchase_controller';

const router = Router();
const purchaseController = new PurchaseController();

router.post('/initPurchase', authenticateJWT, (req, res) => {
  purchaseController.initPurchase(req, res);
});
router.post('/iyzicoCallback', (req, res) => {
  purchaseController.processCallback(req, res);
});

export default router;
