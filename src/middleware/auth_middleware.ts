import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwt_service';
import { AuthenticatedRequest } from '../types/types';

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): any => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Authorization: Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access token is missing or invalid.' });
  }

  try {
    const decoded = JWTService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    // Attach decoded token data to the request object for further use
    (req as AuthenticatedRequest).user = decoded;
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
  // Pass control to the next middleware or route handler
};
