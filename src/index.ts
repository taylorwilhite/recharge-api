import fetch from 'node-fetch';
import {
  BurstyRateLimiter,
  RateLimiterQueue,
  RateLimiterMemory,
} from 'rate-limiter-flexible';
import RechargeProductResource from './resources/product';
import RechargeSubscriptionResource from './resources/subscription';
import RechargePlanResource from './resources/plan';

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
  plan: RechargePlanResource;
  bucket: RateLimiterQueue;

  constructor(options: RechargeClientOptions) {
    this.options = options;
    this.baseUrl = 'https://api.rechargeapps.com';
    const burstyLimiter = new BurstyRateLimiter(
      new RateLimiterMemory({
        points: 2,
        duration: 1,
      }),
      new RateLimiterMemory({
        keyPrefix: 'burst',
        points: 38,
        duration: 60,
      })
    );
    this.bucket = new RateLimiterQueue(burstyLimiter, {
      maxQueueSize: 100,
    });
    this.product = new RechargeProductResource({ request: this.rateRequest });
    this.subscription = new RechargeSubscriptionResource({
      request: this.rateRequest,
    });
    this.plan = new RechargePlanResource({ request: this.rateRequest });
  }

  rateRequest = async <T, R>(
    path: string,
    data?: T,
    options?: RequestOptions
  ): Promise<R> => {
    await this.bucket.removeTokens(1);
    return await this.request<T, R>(path, data, options);
  };

  request = async <T, R>(
    path: string,
    data?: T,
    options?: RequestOptions
  ): Promise<R> => {
    const fetchOptions = {
      headers: {
        'X-Recharge-Access-Token': this.options.accessToken,
        'X-Recharge-Version': '2021-11', // TODO: Allow setting this in options
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...fetchOptions.headers },
      body: data ? JSON.stringify(data) : null,
    });

    // only return status code for successful delete operations
    if (response.status == 204) {
      return response.status;
    }

    const result = await response.json();
    if (response.ok) {
      return result;
    } else if (result.errors) {
      const errors = Object.keys(result.errors).map(
        key => `${key}: ${result.errors[key].join(',')}`
      );
      throw new Error(`${response.status}: ${errors}`);
    } else if (result.error) {
      throw new Error(`${response.status}: ${result.error}`);
    } else {
      throw new Error(
        `Recharge returned an error with statuscode: ${response.status}`
      );
    }
  };
}
