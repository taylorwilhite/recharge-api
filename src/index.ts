import fetch from 'node-fetch';
import { TokenBucket } from 'limiter';
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

interface RateLimits {
  left: number;
  lastCheck: number;
  limit: number;
  refill: number;
  rate: number;
}

class Queue {
  elements: any[];
  constructor() {
    this.elements = [];
  }

  add(el) {
    this.elements.push(el);
  }
  remove() {
    return this.elements.shift();
  }
  isEmpty() {
    return this.elements.length === 0;
  }
  length() {
    return this.elements.length;
  }
}

class AutoQueue extends Queue {
  pendingPromise: boolean;
  constructor() {
    super();
    this.pendingPromise = false;
  }

  add<T>(action): Promise<T> {
    return new Promise((resolve, reject) => {
      super.add({ action, resolve, reject });
      this.remove();
    });
  }

  async remove() {
    if (this.pendingPromise) return false;
    let item = super.remove();
    if (!item) return false;
    try {
      this.pendingPromise = true;
      let payload = await item.action(this);
      this.pendingPromise = false;
      item.resolve(payload);
    } catch (err) {
      this.pendingPromise = false;
      item.reject(err);
    } finally {
      this.remove();
    }

    return true;
  }
}

export default class Recharge {
  options: RechargeClientOptions;
  baseUrl: string;
  product: RechargeProductResource;
  subscription: RechargeSubscriptionResource;
  limits: RateLimits;
  bucket: TokenBucket;
  queue: AutoQueue;

  constructor(options: RechargeClientOptions) {
    this.options = options;
    this.baseUrl = 'https://api.rechargeapps.com';
    this.limits = {
      left: 40,
      lastCheck: Date.now(),
      limit: 40,
      refill: 2,
      rate: 1000,
    };
    this.bucket = new TokenBucket({
      bucketSize: 40,
      tokensPerInterval: 2,
      interval: 'second',
    });
    this.queue = new AutoQueue();
    this.product = new RechargeProductResource({ request: this.rateRequest });
    this.subscription = new RechargeSubscriptionResource({
      request: this.rateRequest,
    });
  }

  rateRequest = async <T, R>(
    path: string,
    data?: T,
    options?: RequestOptions
  ): Promise<R> => {
    return this.queue.add<R>(this.request<T, R>(path, data, options));
  };

  request = async <T, R>(
    path: string,
    data?: T,
    options?: RequestOptions
  ): Promise<R> => {
    await this.bucket.removeTokens(1);
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
