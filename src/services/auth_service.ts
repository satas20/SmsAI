import { OTPService } from './otp_service';
import { JWTService } from './jwt_service';
import { UserService } from './user_service';
export class AuthService {
  /**
   * Verifies the OTP and generates a JWT if valid.
   * @param phoneNumber - The user's phone number.
   * @param otp - The OTP to validate.
   * @returns A JWT if the OTP is valid, or null if invalid.
   */
  public static async verifyOTP(
    phoneNumber: string,
    otp: string,
  ): Promise<string | null> {
    // Validate OTP
    const isValid = await OTPService.validateOTP(phoneNumber, otp);
    if (!isValid) {
      return null;
    }
    const userService = new UserService();
    let user = await userService.findUserByPhoneNumber(phoneNumber);
    if (!user) {
      const result = await userService.createNewUser(phoneNumber);
      user = result.user;
    }
    const userId = user?.getDataValue('id');
    // Generate JWT
    const token = JWTService.generateToken({
      id: userId,
      phoneNumber,
    });

    return token;
  }
}
