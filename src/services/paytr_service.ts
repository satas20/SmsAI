import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { IMerchantParams } from '../types/types';
import nodeBase64 from 'nodejs-base64';

dotenv.config();

const merchant_params: IMerchantParams = {
  merchant_id: process.env.PAYTR_MERCHANT_ID || '',
  merchant_key: process.env.PAYTR_MERCHANT_KEY || '',
  merchant_salt: process.env.PAYTR_MERCHANT_SALT || '',
};

export class PayTRService {
  private paytrEndpoint = 'https://www.paytr.com/odeme/api/get-token';

  /**
   * Generates a PayTR iFrame token.
   * @param data - The purchase data.
   * @returns A promise resolving to the iFrame token.
   */
  public async generateIframeToken(data: any): Promise<any> {
    try {
      // Validate the purchase data
      this.validatePurchaseData(data);

      // Prepare the request payload
      const payload = this.preparePayload(data);

      // Send the POST request to PayTR
      const response = await axios.post(this.paytrEndpoint, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      // Handle the response
      if (response.data.status === 'success') {
        return response.data.token; // Return the iFrame token
      } else {
        throw new Error(`PayTR Error: ${response.data.reason}`);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  validatePurchaseData(data: any): void {
    // Required fields validation
    if (!data.merchant_id || typeof data.merchant_id !== 'string') {
      throw new Error('Invalid merchant_id');
    }
    if (
      !data.user_ip ||
      typeof data.user_ip !== 'string' ||
      data.user_ip.length > 39
    ) {
      throw new Error('Invalid user_ip');
    }
    if (
      !data.merchant_oid ||
      typeof data.merchant_oid !== 'string' ||
      data.merchant_oid.length > 64
    ) {
      throw new Error('Invalid merchant_oid');
    }
    if (
      !data.email ||
      typeof data.email !== 'string' ||
      data.email.length > 100
    ) {
      throw new Error('Invalid email');
    }
    if (!data.payment_amount || !Number.isInteger(data.payment_amount)) {
      throw new Error('Invalid payment_amount');
    }
    if (!data.user_basket) {
      throw new Error('Invalid user_basket');
    }
    if (
      typeof data.no_installment !== 'number' ||
      ![0, 1].includes(data.no_installment)
    ) {
      throw new Error('Invalid no_installment');
    }
    if (
      typeof data.max_installment !== 'number' ||
      ![0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(data.max_installment)
    ) {
      throw new Error('Invalid max_installment');
    }
    if (
      !data.user_name ||
      typeof data.user_name !== 'string' ||
      data.user_name.length > 60
    ) {
      throw new Error('Invalid user_name');
    }
    if (
      !data.user_address ||
      typeof data.user_address !== 'string' ||
      data.user_address.length > 400
    ) {
      throw new Error('Invalid user_address');
    }
    if (
      !data.user_phone ||
      typeof data.user_phone !== 'string' ||
      data.user_phone.length > 20
    ) {
      throw new Error('Invalid user_phone');
    }
    if (
      !data.merchant_ok_url ||
      typeof data.merchant_ok_url !== 'string' ||
      data.merchant_ok_url.length > 400
    ) {
      throw new Error('Invalid merchant_ok_url');
    }
    if (
      !data.merchant_fail_url ||
      typeof data.merchant_fail_url !== 'string' ||
      data.merchant_fail_url.length > 400
    ) {
      throw new Error('Invalid merchant_fail_url');
    }
  }
  handleError(arg0: Error) {
    throw new Error('Method not implemented.');
  }

  /**
   * Prepares the payload for the PayTR iFrame token request.
   * @param data - The purchase data.
   * @returns The prepared payload.
   */
  private preparePayload(data: any): any {
    const {
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      currency = 'TRY',
      user_basket,
      no_installment = 0,
      max_installment = 0,
      user_name,
      user_address,
      user_phone,
      merchant_ok_url,
      merchant_fail_url,
      test_mode = 1,
      debug_on = 1,
      timeout_limit = 30,
      lang = 'tr',
    } = data;
    const hashedUserBasket = nodeBase64.base64encode(user_basket);
    // Generate the PayTR token (hash)
    const hashSTR = `${merchant_params.merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${hashedUserBasket}${no_installment}${max_installment}${currency}${test_mode}`;

    const paytr_token = hashSTR + merchant_params.merchant_salt;

    const token = crypto
      .createHmac('sha256', merchant_params.merchant_key)
      .update(paytr_token)
      .digest('base64');

    // Prepare the payload
    return {
      merchant_id: merchant_params.merchant_id,
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      currency,
      user_basket: hashedUserBasket,
      no_installment,
      max_installment,
      paytr_token: token,
      user_name,
      user_address,
      user_phone,
      merchant_ok_url,
      merchant_fail_url,
      test_mode,
      debug_on,
      timeout_limit,
    };
  }
}
