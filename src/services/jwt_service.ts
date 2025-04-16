import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Replace with a secure secret key
const JWT_EXPIRY = '55m'; // Token expiry time (15 minutes)

export class JWTService {
  /**
   * Generates a JWT for the given payload.
   * @param payload - The data to include in the JWT (e.g., user ID, phone number).
   * @returns The generated JWT as a string.
   */
  public static generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  /**
   * Verifies a JWT and returns the decoded payload if valid.
   * @param token - The JWT to verify.
   * @returns The decoded payload if the token is valid, or null if invalid.
   */
  public static verifyToken(token: string): any | null {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Invalid JWT:', error);
      return null;
    }
  }
}
