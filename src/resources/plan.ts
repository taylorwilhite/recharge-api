import { RequestOptions } from '..';

interface ResourceOptions {
  request: <T, R>(
    path: string,
    data?: T,
    options?: RequestOptions
  ) => Promise<R>;
}

interface PlanCreateInput {
  channel_settings?: {
    api: RechargeChannel;
    checkout_page: RechargeChannel;
    customer_portal: RechargeChannel;
    merchant_portal: RechargeChannel;
  };
  discount_amount?: string | null;
  discount_type?: string | null;
  external_product_id: {
    ecommerce: string;
  };
  sort_order?: number;
  subscription_preferences?: {
    charge_interval_frequency: number;
    cutoff_day_of_month?: number;
    cutoff_day_of_week?: number;
    expire_after_specific_number_of_charges?: number;
    order_day_of_month?: number;
    order_day_of_week?: number;
    order_interval_frequency: number;
    interval_unit: 'day' | 'week' | 'month';
  };
  title: string;
  type: 'subscription' | 'prepaid' | 'onetime';
}

interface RechargeChannel {
  display: boolean;
}

interface RechargePlan {
  id: number;
  channel_settings: {
    api: RechargeChannel;
    checkout_page: RechargeChannel;
    customer_portal: RechargeChannel;
    merchant_portal: RechargeChannel;
  };
  created_at: Date;
  deleted_at: Date | null;
  discount_amount: string | null;
  discount_type: string | null;
  external_product_id: {
    ecommerce: string;
  };
  sort_order: number;
  subscription_preferences: {
    charge_interval_frequency: number;
    cutoff_day_of_month?: number;
    cutoff_day_of_week?: number;
    expire_after_specific_number_of_charges?: number;
    order_day_of_month?: number;
    order_day_of_week?: number;
    order_interval_frequency: number;
    interval_unit: 'day' | 'week' | 'month';
  };
  title: string;
  type: 'subscription' | 'prepaid' | 'onetime';
  updated_at: Date;
}

class PlanListParams {
  external_product_id?: string;
  type?: 'subscription' | 'prepaid' | 'onetime';
  updated_at_max?: Date;
  updated_at_min?: Date;
  page?: number;
  limit?: number;
}

export default class RechargePlanResource {
  options: ResourceOptions;
  constructor(options: ResourceOptions) {
    this.options = options;
  }

  /** Create a new plan */
  async create(
    data: PlanCreateInput
  ): Promise<RechargePlan | { plan: RechargePlan }> {
    const result = await this.options.request<
      PlanCreateInput,
      { plan: RechargePlan }
    >('/plans', data, { method: 'POST' });
    return result.plan;
  }

  /** retrieve plan by id */
  async get(id: number): Promise<RechargePlan> {
    const result = await this.options.request<null, RechargePlan>(
      `/plans/${id}`
    );
    return result;
  }

  async list(params: PlanListParams): Promise<RechargePlan[]> {
    const query = Object.keys(params)
      .map(key => {
        let value = params[key];
        if (Array.isArray(value)) {
          value = value.join(',');
        }
        return key + '=' + value;
      })
      .join('&');
    const result = await this.options.request<null, { plans: RechargePlan[] }>(
      `/plans?${query}`
    );
    return result.plans;
  }

  /** Update plan by ID */
  async update(
    id: number,
    data: Partial<PlanCreateInput>
  ): Promise<RechargePlan> {
    const result = await this.options.request<
      Partial<PlanCreateInput>,
      { plan: RechargePlan }
    >(`/plans/${id}`, data, { method: 'PUT' });
    return result.plan;
  }

  /** Delete plan by ID */
  async delete(id: number): Promise<Number> {
    const result = await this.options.request<undefined, Number>(
      `/plans/${id}`,
      undefined,
      { method: 'DELETE' }
    );
    return result;
  }
}
