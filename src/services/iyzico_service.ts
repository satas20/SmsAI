import crypto from 'crypto';
import { IyzicoInitCfParams } from '../utils/constants';
import Iyzipay from 'iyzipay';

export class IyzicoService {
  private iyzicoEndpoint = 'https://api.iyzipay.com/payment';
  private initCFEndpoint = '/iyzipos/checkoutform/initialize/auth/ecom';
  private apikey =
    process.env.IYZICO_API_KEY || process.env.IYZICO_TEST_API_KEY || '';
  private secretKey =
    process.env.IYZICO_SECRET_KEY || process.env.IYZICO_TEST_SECRET_KEY || '';
  private iyzipay: Iyzipay;
  constructor() {
    if (!this.apikey || !this.secretKey) {
      throw new Error('Iyzico API key or secret key is not set');
    }
    this.iyzipay = new Iyzipay({
      apiKey: this.apikey,
      secretKey: this.secretKey,
      uri: 'https://sandbox-api.iyzipay.com',
    });
  }

  public async initCF(data: any) {
    try {
      const response = this.iyzipay.checkoutFormInitialize.create(
        this.prepareInitCFBody(data),
        (error: any, result: any) => {
          if (error) {
            throw error;
          }
          return result;
        },
      );
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  private prepareInitCFBody(data: any): any {
    throw new Error('Method not implemented.');
  }
}
