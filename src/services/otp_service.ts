import crypto from 'crypto';
import { OTP } from '../models/otp';

export class OTPService {
  private static OTP_EXPIRY = 3000; // OTP expiry time in seconds (5 minutes)

  /**
   * Generates a 6-digit OTP, stores it in the database, and returns it.
   */
  public static async generateOTP(phoneNumber: string): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY * 1000); // Set expiry time

    // Store OTP in the database
    await OTP.create({ phoneNumber, otp, expiresAt });

    return otp;
  }

  /**
   * Validates the OTP for a given phone number.
   * Returns true if valid, otherwise false.
   */
  public static async validateOTP(
    phoneNumber: string,
    otp: string,
  ): Promise<boolean> {
    const otpRecord = await OTP.findOne({
      where: {
        phoneNumber,
        otp,
      },
    });

    if (otpRecord) {
      const currentTime = new Date();
      if (otpRecord.getDataValue('expiresAt') < currentTime) {
        await otpRecord.destroy(); // Delete OTP after successful validation
        return false; // OTP has expired
      }
      await otpRecord.destroy(); // Delete OTP after successful validation
      return true;
    }

    return false;
  }
}
