export interface ShopSiteConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  authCode: string;
  username?: string;
  password?: string;
}

export interface ShopSiteAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export interface ShopSiteXmlResponse<T> {
  [key: string]: T;
}

export interface Order {
  OrderID: string;
  OrderDate: string;
  BillingAddress: Address;
  ShippingAddress: Address;
  Items: OrderItem[];
  Total: string;
}

export interface Address {
  FirstName: string;
  LastName: string;
  Company?: string;
  Address1: string;
  Address2?: string;
  City: string;
  State: string;
  Zip: string;
  Country: string;
  Phone?: string;
  Email: string;
}

export interface OrderItem {
  Name: string;
  SKU: string;
  Quantity: string;
  Price: string;
}

export interface Product {
  Name: string;
  SKU: string;
  Price: string;
  Taxable: string;
}
