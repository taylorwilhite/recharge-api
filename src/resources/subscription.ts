import { URLSearchParams } from 'url';
import { ResourceOptions } from '..';
interface AnalyticsData {
  utm_params: string[];
}
interface RechargeSubscription {
  id: number;
  address_id: number;
  analytics_data: AnalyticsData;
  cancellation_reason: string | null;
  cancellation_reason_comments: string | null;
  cancelled_at: string | null;
  charge_interval_frequency: string;
  created_at: string;
  customer_id: number;
  email: string;
  expire_after_specific_number_of_charges: number | null;
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
  price: string | number;
  product_title: string;
  properties: [
    {
      name: string;
      value: string;
    }
  ];
  quantity: number;
  recharge_product_id: number;
  shopify_product_id: number;
  shopify_variant_id: number;
  sku: string | null;
  sku_override: boolean;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  updated_at: string;
  variant_title: string | null;
}

class SubscriptionListParams {
  address_id: string;
  created_at_max: string;
  created_at_min: string;
  customer_id: string;
  ids: string; // TODO: turn this into array and join on request
  include_onetimes: string;
  limit: string;
  page: string;
  shopify_customer_id: string;
  shopify_variant_id: string;
  status: string;
  updated_at_max: string;
  updated_at_min: string;
}

export default class RechargeSubscriptionResource {
  options: ResourceOptions;
  constructor(options: ResourceOptions) {
    this.options = options;
  }

  /** Retrieve a subscription */
  async get(id: string): Promise<RechargeSubscription> {
    const result = this.options.request<null, RechargeSubscription>(
      `/subscriptions/${id}`
    );
    return result;
  }

  /** List all subscriptions for a store */
  async list(params: SubscriptionListParams): Promise<RechargeSubscription[]> {
    const query = Object.keys(params)
      .map(key => key + '=' + params[key])
      .join('&');
    const result = this.options.request<null, RechargeSubscription[]>(
      `/subscriptions?${query}`
    );
    return result;
  }

  /** Update a subscription by ID */
  async update(
    id: string,
    data: Partial<RechargeSubscription>
  ): Promise<RechargeSubscription> {
    const result = this.options.request<
      Partial<RechargeSubscription>,
      RechargeSubscription
    >(`/products/${id}`, data, { method: 'PUT' });
    return result;
  }

  async swapProduct(
    id: string,
    productId: number,
    variantId: number
  ): Promise<RechargeSubscription> {
    const result = await this.update(id, {
      shopify_variant_id: variantId,
      shopify_product_id: productId,
    });
    return result;
  }
}
