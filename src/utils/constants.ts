export enum SystemMessages {
  INFO = ':info:',
  HELP = ':help:',
  BUY = ':buy:',
  SMSAI = ':smsai:',
  ADMIN = ':admin:',
}
export enum CreditCosts {
  WEB_SEARCH = 8,
  NORMAL_RESPONSE = 1,
}
export const MAX_SMS_LENGTH = 870;
export type IyzicoInitCfParams = {
  price: number;
  paidPrice: number;
  currency: string;
  basketId?: string;
  paymentGroup?: 'PRODUCT' | 'LISTING' | 'SUBSCRIPTION';
  paymentSource?:
    | 'SHOPIFY'
    | 'MAGENTO'
    | 'PRESTASHOP'
    | 'WOOCOMMERCE'
    | 'OPENCART';
  callbackUrl: string;
  enabledInstallments?: 1 | 2 | 3 | 6 | 9;
  conversationId?: string;
  locale?: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    identityNumber: string;
    email: string;
    gsmNumber?: string;
    registrationDate?: string;
    lastLoginDate?: string;
    registrationAddress: string;
    city: string;
    country: string;
    zipCode?: string;
    ip: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1?: string;
    category2?: string;
    itemType: 'PHYSICAL' | 'VIRTUAL';
    price: number;
  }>;
};
