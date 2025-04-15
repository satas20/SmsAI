import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: any; // Add the user property to the Request object
}

export interface IMerchantParams {
  merchant_id: string;
  merchant_key: string;
  merchant_salt: string;
  debug_on?: number;
  no_installment?: number;
  max_installment?: number;
  timeout_limit?: number;
  test_mode?: number;
  lang?: string;
}
