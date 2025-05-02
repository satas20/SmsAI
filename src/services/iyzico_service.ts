import crypto from 'crypto';
import { IyzicoInitCfParams } from '../utils/constants';
import Iyzipay, {
  BASKET_ITEM_TYPE,
  ThreeDSInitializePaymentRequestData,
} from 'iyzipay';

export class IyzicoService {
  private iyzicoEndpoint = 'https://api.iyzipay.com/payment';
  private initCFEndpoint = '/iyzipos/checkoutform/initialize/auth/ecom';
  private apikey =
    process.env.IYZICO_API_KEY || process.env.IYZICO_TEST_API_KEY || '';
  private secretKey =
    process.env.IYZICO_SECRET_KEY || process.env.IYZICO_TEST_SECRET_KEY || '';
  private iyzipay: Iyzipay;
  private calbackUrl = process.env.CALLBACK_URL || 'smsai.site/callback';
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
      const initCFBody = this.createInitCFBody(data);
      const response = this.iyzipay.checkoutFormInitialize.create(
        initCFBody,
        (error: any, result: any) => {
          if (error) {
            throw error;
          }
          return result;
        },
      );
      return response;
    } catch (error) {
      return {
        error: true,

        message: 'Failed to initialize payment',
        details: error,
      };
    }
  }
  public createInitCFBody(data: any): ThreeDSInitializePaymentRequestData {
    const { userIp, subscriptionId, price, phoneNumber } = data;

    const basketitems = [
      {
        id: data.subscription.getDataValue('id').toString(),
        name: data.subscription.getDataValue('name'),
        category1: 'Subscription',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: price.toString(),
      },
    ];
    const billingAddress = {
      contactName: data.user_name,
      city: 'ankara',
      country: 'Turkey',
      address: data.user_address,
    };

    const buyer = {
      id: data.userId.toString(),
      name: data.user_name,
      surname: data.user_surname,
      email: data.email,
      identityNumber: '47854764634',
      registrationAddress: data.user_address,
      ip: userIp,
      city: 'ankara',
      country: 'Turkey',
    };
    const initCFBody: any = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: crypto.randomUUID(),
      price: price.toString(),
      paidPrice: price.toString(),
      currency: 'TRY',
      basketId: subscriptionId.toString(),
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: this.calbackUrl,
      buyer: buyer,
      basketItems: basketitems,
      shippingAddress: data.user_address,
      billingAddress: billingAddress,
    };
    return initCFBody;
  }
}
