import { Router } from 'express';

import { HomeController } from '../controller/home_controller';

const router = Router();
const homeController = new HomeController();

// Protect the route with JWT middleware
router.get('/homeStats', (req, res) => {
  homeController.getHomeStats(req, res);
});

export default router;
