import { Request, Response } from 'express';
import { OTPService } from '../services/otp_service';
import { JWTService } from '../services/jwt_service';
import { User } from '../models/user';
import SMSService from '../services/sms_service';
import { AuthService } from '../services/auth_service';
export class AuthController {
  /**
   * Handles OTP request
   */
  public async requestOTP(req: Request, res: Response): Promise<any> {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    try {
      const { otp, isOtpNew } = await OTPService.generateOTP(phoneNumber);
      const expiresAt = otp.getDataValue('expiresAt');
      const currentTime = new Date();
      const leftTime = expiresAt.getTime() - currentTime.getTime();
      const leftTimeInSeconds = Math.floor(leftTime / 1000); // Convert milliseconds to seconds
      const user = await User.findOne({
        where: { phoneNumber },
      });
      if (!isOtpNew) {
        return res.status(431).json({
          message: 'OTP already sent.',
          expiresIn: leftTimeInSeconds,
          isNewUser: !user,
        });
      }
      const otpText = otp.getDataValue('otp');
      const smsService = new SMSService();
      const smsResponse = await smsService.sendOTP(
        `Your OTP is: ${otpText}`,
        phoneNumber,
      );

      res.status(200).json({
        message: 'OTP sent.',
        expiresIn: leftTimeInSeconds,
        isNewUser: !user,
      });
    } catch (error) {
      console.error('Error r    equesting OTP:', error);
      res.status(500).json({ message: 'Failed to send OTP.' });
    }
  }

  /**
   * Handles OTP verification
   */
  public async verifyOTP(req: Request, res: Response): Promise<any> {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res
        .status(400)
        .json({ message: 'Phone number and OTP are required.' });
    }

    try {
      const token = await AuthService.verifyOTP(phoneNumber, otp);
      if (!token) {
        return res.status(401).json({ message: 'Invalid OTP.' });
      }
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Failed to verify OTP.' });
    }
  }
}
