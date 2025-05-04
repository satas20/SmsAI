import crypto from 'crypto';
import { IyzicoInitCfParams } from '../utils/constants';
import Iyzipay, {
  BASKET_ITEM_TYPE,
  CheckoutFormRetrieveResult,
  ThreeDSInitializePaymentRequestData,
} from 'iyzipay';
import { IyzicoPayment } from '../models/iyzico_payment';

export class IyzicoService {
  async checkPaymentStatus(
    token: any,
  ): Promise<{ status: string; userId: number; subscriptionId: number }> {
    const iyzicoPayment = await IyzicoPayment.findOne({
      where: { token: token },
    });
    if (!iyzicoPayment) {
      throw new Error('Payment not found');
    }
    const paymentResult: CheckoutFormRetrieveResult = await new Promise(
      (resolve, reject) => {
        this.iyzipay.checkoutForm.retrieve(
          { token },
          (error: any, result: any) => {
            if (error) {
              console.error('Error retrieving payment:', error);
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
      },
    );
    const returndata = {
      status: paymentResult.status,
      userId: iyzicoPayment.getDataValue('user_id'),
      subscriptionId: iyzicoPayment.getDataValue('subscription_id'),
    };
    if (paymentResult.status === 'success') {
      await IyzicoPayment.update(
        { paymentStatus: 'success' },
        { where: { token: token } },
      );
    } else {
      await IyzicoPayment.update(
        { paymentStatus: 'failure' },
        { where: { token: token } },
      );
    }
    return returndata;
  }
  private iyzicoEndpoint = 'https://api.iyzipay.com/payment';
  private initCFEndpoint = '/iyzipos/checkoutform/initialize/auth/ecom';
  private apikey =
    process.env.IYZICO_API_KEY || process.env.IYZICO_TEST_API_KEY || '';
  private secretKey =
    process.env.IYZICO_SECRET_KEY || process.env.IYZICO_TEST_SECRET_KEY || '';
  private iyzipay: Iyzipay;
  private calbackUrl =
    process.env.IYZICO_CALLBACK_URL ||
    'https://6a2b-92-44-29-219.ngrok-free.app/purchase/iyzicoCallback';
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
      const response = new Promise((resolve, reject) => {
        this.iyzipay.checkoutFormInitialize.create(
          initCFBody,
          (error: any, result: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
      });
      const result: any = await response;
      IyzicoPayment.create({
        user_id: data.userId,
        price: initCFBody.price,
        subscription_id: data.subscription.getDataValue('id'),
        conversationId: initCFBody.conversationId,
        token: result.token,
      });
      return result;
    } catch (error) {
      return {
        error: true,

        message: 'Failed to initialize payment',
        details: error,
      };
    }
  }
  public createInitCFBody(data: any): ThreeDSInitializePaymentRequestData {
    const price = Number(data.subscription.getDataValue('price'));
    const subscriptionId = data.subscription.getDataValue('id');
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
      city: data.user_address,
      country: 'Turkey',
      address: data.user_address,
    };

    const buyer = {
      id: data.userId.toString(),
      name: data.user_name,
      surname: data.user_surname,
      email: data.email,
      identityNumber: data.identityNumber,
      registrationAddress: data.user_address,
      ip: data.userIp,
      city: data.user_address,
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
