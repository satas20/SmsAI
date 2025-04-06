import crypto from 'crypto';
import { OTP } from '../models/otp';
import { Op } from 'sequelize';

export class OTPService {
  private static OTP_EXPIRY = 3000; // OTP expiry time in seconds (5 minutes)

  /**
   * Generates a 6-digit OTP, stores it in the database, and returns it.
   */
  public static async generateOTP(phoneNumber: string): Promise<string | null> {
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY * 1000); // Set expiry time

    // Store OTP in the database
    const existingOTP = await OTP.findOne({
      where: {
        phoneNumber,
        expiresAt: {
          [Op.gt]: new Date(), // greater than current time
        },
      },
    });
    if (existingOTP) {
      return null;
    } else {
      await OTP.create({ phoneNumber, otp, expiresAt });
      return otp;
    }
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
        expiresAt: {
          [Op.gt]: new Date(), // greater than current time
        },
      },
    });
    if (otpRecord) {
      const currentTime = new Date();
      const expiresAt = otpRecord.getDataValue('expiresAt');
      await otpRecord.destroy(); // Delete OTP after successful validation
      if (expiresAt < currentTime) {
        return false; // OTP has expired
      } else {
        return true;
      }
    }
    return false;
  }
}
