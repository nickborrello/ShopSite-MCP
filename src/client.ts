import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { parseStringPromise } from 'xml2js';
import { ShopSiteConfig, ShopSiteAuthToken, Order, Product } from './types.js';

export class ShopSiteClient {
  private config: ShopSiteConfig;
  private client: AxiosInstance;
  private token: ShopSiteAuthToken | null = null;

  constructor(config: ShopSiteConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  private signRequest(params: Record<string, string>, timestamp: string, nonce: string): string {
    if (!this.token) throw new Error('No access token available');

    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map(key => `${key}=${params[key]}`).join('\n');

    // Format: token \n timestamp \n nonce \n param1=val1 \n param2=val2 ...
    const signatureBase = [
      this.token.access_token,
      timestamp,
      nonce,
      paramString
    ].join('\n');

    const hmac = crypto.createHmac('sha1', this.config.clientSecret);
    hmac.update(signatureBase);
    return hmac.digest('hex');
  }

  async authenticate(): Promise<void> {
    try {
      const response = await this.client.post('/authorize.cgi', {
        client_id: this.config.clientId,
        code: this.config.authCode,
        grant_type: 'authorization_code',
      });
      
      this.token = response.data; 
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  async getOrders(days: number = 30): Promise<Order[]> {
    if (!this.token) await this.authenticate();
    
    const params = {
      dbname: 'orders',
      version: '12.0',
      start_date: this.getDateDaysAgo(days),
    };

    return this.makeXmlRequest<Order[]>('db_xml.cgi', params, 'Orders');
  }

  async getProducts(limit: number = 50, offset: number = 0): Promise<Product[]> {
    if (!this.token) await this.authenticate();
    
    // ShopSite's XML API does not support native pagination for products.
    // We must fetch the full catalog and slice it in memory.
    const params = {
      dbname: 'products',
      version: '12.0',
    };

    const allProducts = await this.makeXmlRequest<Product[]>('db_xml.cgi', params, 'Products');
    return allProducts.slice(offset, offset + limit);
  }

  async updateInventory(sku: string, quantity: number): Promise<boolean> {
    if (!this.token) await this.authenticate();
    
    const xml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Products>
        <Product>
          <SKU>${sku}</SKU>
          <Inventory>${quantity}</Inventory>
        </Product>
      </Products>
    `.trim();

    const timestamp = this.generateTimestamp();
    const nonce = this.generateNonce();
    
    const params = {
      clientApp: '1',
      oauth_token: this.token!.access_token,
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
    };
    
    const signature = this.signRequest(params, timestamp, nonce);
    
    const urlParams = new URLSearchParams({
        ...params,
        oauth_signature: signature
    });

    try {
        await this.client.post(`/db_import.cgi?${urlParams.toString()}`, xml, {
            headers: { 'Content-Type': 'text/xml' }
        });
        return true;
    } catch (e) {
        console.error("Inventory update failed", e);
        return false;
    }
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format
  }

  private async makeXmlRequest<T>(endpoint: string, params: Record<string, string>, rootNode: string): Promise<T> {
    if (!this.token) await this.authenticate();

    const timestamp = this.generateTimestamp();
    const nonce = this.generateNonce();
    const signature = this.signRequest(params, timestamp, nonce);

    const requestBody = {
      ...params,
      oauth_token: this.token!.access_token,
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_signature: signature,
      clientApp: '1',
    };

    try {
      const response = await this.client.post(`/${endpoint}`, new URLSearchParams(requestBody));
      const result = await parseStringPromise(response.data, { explicitArray: false });
      
      if (result && result[rootNode]) {
          const items = result[rootNode];
          return (Array.isArray(items) ? items : [items]) as T;
      }
      return [] as T;

    } catch (error) {
      console.error(`Request to ${endpoint} failed:`, error);
      throw error;
    }
  }
}
