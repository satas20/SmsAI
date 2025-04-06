import { Router } from 'express';
import { AuthController } from '../controller/auth_controller';

const router = Router();
const authController = new AuthController();

// Route to request an OTP
router.post('/request-otp', (req: any, res: any) => {
  return authController.requestOTP(req, res);
});

router.post('/verify-otp', (req: any, res: any) => {
  return authController.verifyOTP(req, res);
});

export default router;
