import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: any; // Add the user property to the Request object
}
