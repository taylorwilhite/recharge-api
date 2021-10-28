import fetch from 'node-fetch';
import RechargeProductResource from './resources/product';
import RechargeSubscriptionResource from './resources/subscription';
interface RechargeClientOptions {
  accessToken: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface ResourceOptions {
  request: <T, R>(
    path: string,
    data?: T,
    options?: RequestOptions
  ) => Promise<R>;
}

export default class Recharge {
  options: RechargeClientOptions;
  baseUrl: string;
  product: RechargeProductResource;
  subscription: RechargeSubscriptionResource;

  constructor(options: RechargeClientOptions) {
    this.options = options;
    this.baseUrl = 'https://api.rechargeapps.com';
    this.product = new RechargeProductResource({ request: this.request });
    this.subscription = new RechargeSubscriptionResource({
      request: this.request,
    });
  }

  request = async <T, R>(
    path: string,
    data?: T,
    options?: RequestOptions
  ): Promise<R> => {
    const fetchOptions = {
      headers: {
        'X-Recharge-Access-Token': this.options.accessToken,
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...fetchOptions.headers },
    });
    const result = response.json() as Promise<R>;
    return result;
  };
}
