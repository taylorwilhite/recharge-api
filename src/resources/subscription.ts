import { URLSearchParams } from 'url';
import { ResourceOptions } from '..';
interface AnalyticsData {
  utm_params: RechargeUTMParams;
}

interface RechargeUTMParams {
  utm_campaign: string;
  utm_content: string;
  utm_data_source: string;
  utm_source: string;
  utm_medium: string;
  utm_term: string;
  utm_timestamp: string;
}

interface RechargeSubscription {
  id: number;
  address_id: number;
  customer_id: number;
  analytics_data: AnalyticsData;
  cancellation_reason: string | null;
  cancellation_reason_comments: string | null;
  cancelled_at: string | null;
  charge_interval_frequency: string;
  created_at: string;
  email: string;
  expire_after_specific_number_of_charges: number | null;
  external_product_id: {
    ecommerce: string;
  };
  external_variant_id: {
    ecommerce: string;
  };
  has_queued_charges: boolean;
  is_prepaid: boolean;
  is_skippable: boolean;
  is_swappable: boolean;
  max_retries_reached: boolean;
  next_charge_scheduled_at: string;
  order_day_of_month: number | null;
  order_day_of_week: number | null;
  order_interval_frequency: string;
  order_interval_unit: 'day' | 'week' | 'month';
  price: string;
  product_title: string;
  properties: [
    {
      name: string;
      value: string;
    }
  ];
  quantity: number;
  sku: string | null;
  sku_override: boolean;
  status: 'active' | 'cancelled' | 'expired';
  updated_at: string;
  variant_title: string | null;
}

class SubscriptionListParams {
  address_id?: string;
  address_ids?: string; // TODO: turn this into array and join on request
  created_at_max?: string;
  created_at_min?: string;
  cursor?: string;
  customer_id?: string;
  ids?: string; // TODO: turn this into array and join on request
  limit?: string;
  page?: string;
  status?: 'active' | 'cancelled' | 'expired';
  updated_at_max?: string;
  updated_at_min?: string;
}

export default class RechargeSubscriptionResource {
  options: ResourceOptions;
  constructor(options: ResourceOptions) {
    this.options = options;
  }

  /** Retrieve a subscription */
  async get(id: string): Promise<RechargeSubscription> {
    const result = await this.options.request<
      null,
      { subscription: RechargeSubscription }
    >(`/subscriptions/${id}`);
    return result.subscription;
  }

  /** List all subscriptions for a store */
  async list(params: SubscriptionListParams): Promise<RechargeSubscription[]> {
    const query = Object.keys(params)
      .map(key => key + '=' + params[key])
      .join('&');
    const result = await this.options.request<
      null,
      { subscriptions: RechargeSubscription[] }
    >(`/subscriptions?${query}`);
    return result.subscriptions;
  }

  /** Update a subscription by ID */
  async update(
    id: string,
    data: Partial<RechargeSubscription>
  ): Promise<RechargeSubscription> {
    const result = await this.options.request<
      Partial<RechargeSubscription>,
      { subscription: RechargeSubscription }
    >(`/products/${id}`, data, { method: 'PUT' });
    return result.subscription;
  }

  async swapProduct(
    id: string,
    productId: string,
    variantId: string
  ): Promise<RechargeSubscription> {
    const result = await this.update(id, {
      external_variant_id: { ecommerce: variantId },
      external_product_id: { ecommerce: productId },
    });
    return result;
  }
}
