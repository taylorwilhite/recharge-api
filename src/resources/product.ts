import { RequestOptions } from '..';

interface ResourceOptions {
  request: <T, R>(
    path: string,
    data?: T,
    options?: RequestOptions
  ) => Promise<R>;
}

interface ProductImage {
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
  sort_order?: number;
}

interface ProductOption {
  name: string;
  position: string;
  values: ProductOptionValue[];
}

interface ProductOptionValue {
  label: string;
  position: number;
}

interface ProductVariant {
  dimensions?: {
    weight?: number;
    weight_unit?: string;
  };
  external_variant_id: string;
  image?: ProductImage;
  option_values: ProductOptionValue[];
  prices?: {
    compare_at_price?: string;
    unit_price: string;
  };
  requires_shipping?: boolean;
  sku?: string;
  tax_code?: string;
  taxable?: string;
  title: string;
}

interface ProductCreateInput {
  external_product_id: {
    ecommerce: string;
  };
  brand?: string;
  external_created_at?: string;
  external_updated_at?: string;
  images?: ProductImage[];
  options: ProductOption[];
  published_at?: string;
  requires_shipping?: boolean;
  title: string;
  variants?: ProductVariant[];
  vendor: string;
}

interface RechargeProduct {
  external_product_id: {
    ecommerce: string;
  };
  brand?: string;
  external_created_at?: string;
  external_updated_at?: string;
  images?: ProductImage[];
  options: ProductOption[];
  published_at?: string;
  requires_shipping?: boolean;
  title: string;
  variants?: ProductVariant[];
  vendor: string;
}

class ProductListParams {
  external_product_ids: string; // TODO: make this an array and combine
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
      { product: RechargeProduct }
    >('/products', data, { method: 'POST' });
    return result.product;
  }

  /** retrieve product by external_product_id */
  async get(id: string): Promise<RechargeProduct> {
    const result = await this.options.request<null, RechargeProduct>(
      `/products/${id}`
    );
    return result;
  }

  async list(params: ProductListParams): Promise<RechargeProduct[]> {
    const query = Object.keys(params)
      .map(key => {
        let value = params[key];
        if (Array.isArray(value)) {
          value = value.join(',');
        }
        return key + '=' + value;
      })
      .join('&');
    const result = await this.options.request<
      null,
      { products: RechargeProduct[] }
    >(`/products?${query}`);
    return result.products;
  }

  /** Update product by ID */
  async update(
    id: string,
    data: Partial<ProductCreateInput>
  ): Promise<RechargeProduct> {
    const result = await this.options.request<
      Partial<ProductCreateInput>,
      { product: RechargeProduct }
    >(`/products/${id}`, data, { method: 'PUT' });
    return result.product;
  }

  /** Delete product by ID */
  async delete(id: string): Promise<RechargeProduct> {
    const result = await this.options.request<
      undefined,
      { product: RechargeProduct }
    >(`/products/${id}`, undefined, { method: 'DELETE' });
    return result.product;
  }
}
