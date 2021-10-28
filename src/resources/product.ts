import { RequestOptions } from '..';

interface ResourceOptions {
  request: <T, R>(
    path: string,
    data?: T,
    options?: RequestOptions
  ) => Promise<R>;
}

interface ProductCreateInput {
  collection_id?: number;
  discount_amount?: number;
  discount_type?: 'percentage';
  shopify_product_id: number;
  subscription_defaults: {
    cutoff_day_of_month?: number;
    cutoff_day_of_week?: number;
    expire_after_specific_number_of_charges?: number;
    modifiable_properties?: string[];
    number_charges_until_expiration?: number;
    order_day_of_month?: number | null;
    order_day_of_week?: number | null;
    order_interval_frequency_options?: string[];
    order_interval_unit?: 'day' | 'week' | 'month';
    storefront_purchase_options?:
      | 'subscription_only'
      | 'subscription_and_onetime';
  };
}

interface RechargeProduct {
  product: {
    id: number;
    collection_id?: number;
    created_at: Date;
    discount_amount: number;
    discount_type: string;
    handle: string;
    images: {
      large: string;
      medium: string;
      original: string;
      small: string;
    };
    product_id?: number;
    shopify_product_id: number;
    subscription_defaults: {
      charge_interval_frequency: number;
      cutoff_day_of_month: number | null;
      cutoff_day_of_week: number | null;
      expire_after_specific_number_of_charges: number | null;
      modifiable_properties: string[];
      number_charges_until_expiration?: number;
      order_day_of_month: number | null;
      order_day_of_week: number | null;
      order_interval_frequency_options: string[];
      order_interval_unit: 'day' | 'week' | 'month';
      storefront_purchase_options:
        | 'subscription_only'
        | 'subscription_and_onetime';
    };
    title: string;
    updated_at: Date;
  };
}

export default class RechargeProductResource {
  options: ResourceOptions;
  constructor(options: ResourceOptions) {
    this.options = options;
  }

  /** Create a new product */
  async create(data: ProductCreateInput): Promise<RechargeProduct> {
    const result = await this.options.request<
      ProductCreateInput,
      RechargeProduct
    >('/products', data, { method: 'POST' });
    return result;
  }

  async get(id: string): Promise<RechargeProduct> {
    const result = await this.options.request<null, RechargeProduct>(
      `/products/${id}`
    );
    return result;
  }

  /** Update product by ID */
  async update(
    id: string,
    data: Partial<ProductCreateInput>
  ): Promise<RechargeProduct> {
    const result = await this.options.request<
      Partial<ProductCreateInput>,
      RechargeProduct
    >(`/products/${id}`, data, { method: 'PUT' });
    return result;
  }

  /** Delete product by ID */
  async delete(id: string): Promise<RechargeProduct> {
    const result = await this.options.request<undefined, RechargeProduct>(
      `/products/${id}`,
      undefined,
      { method: 'DELETE' }
    );
    return result;
  }
}
