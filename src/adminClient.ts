import axios, { AxiosInstance } from 'axios';
import { ShopSiteConfig } from './types.js';

export class ShopSiteAdminClient {
  private config: ShopSiteConfig;
  private client: AxiosInstance;

  constructor(config: ShopSiteConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      auth: config.username && config.password ? {
        username: config.username,
        password: config.password
      } : undefined,
      headers: {
        'User-Agent': 'Mozilla/5.0 (ShopSite Admin Scraper)',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  async searchProducts(query: string): Promise<any[]> {
    if (!this.config.username || !this.config.password) {
      throw new Error('Admin username and password are required for Back Office search.');
    }

    try {
      const response = await this.client.post('/product_mgr.cgi', new URLSearchParams({
        func: 'search',
        search_field: 'Name',
        search_pattern: query,
        start: '1'
      }));

      return this.parseSearchResults(response.data);
    } catch (error) {
      console.error('Back Office search failed:', error);
      throw error;
    }
  }

  private parseSearchResults(html: string): any[] {
    const results: any[] = [];
    
    const productRegex = /<a[^>]+func=show_product[^>]+>([^<]+)<\/a>.*?<td[^>]*>([^<]*)<\/td>/gis;
    
    let match;
    while ((match = productRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const possibleSku = match[2].trim();
      
      if (name) {
        results.push({
          Name: name,
          SKU: possibleSku || 'Unknown',
          Source: 'BackOfficeScraper'
        });
      }
    }
    
    return results;
  }

    try {
      const response = await this.client.post('/product_mgr.cgi', new URLSearchParams({
        func: 'search',
        search_field: 'Name',
        search_pattern: query,
        start: '1'
      }));

      return this.parseSearchResults(response.data);
    } catch (error) {
      console.error('Back Office search failed:', error);
      throw error;
    }
  }

  private parseSearchResults(html: string): any[] {
    const results: any[] = [];
    
    // Pattern looks for: <a href="...func=show_product...">(Product Name)</a> ... (SKU) ... (Price)
    const productRegex = /<a[^>]+func=show_product[^>]+>([^<]+)<\/a>.*?<td[^>]*>([^<]*)<\/td>/gis;
    
    let match;
    while ((match = productRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const possibleSku = match[2].trim();
      
      if (name) {
        results.push({
          Name: name,
          SKU: possibleSku || 'Unknown',
          Source: 'BackOfficeScraper'
        });
      }
    }
    
    return results;
  }

    try {
      const response = await this.client.post('/product_mgr.cgi', new URLSearchParams({
        func: 'search',
        search_field: 'Name',
        search_pattern: query,
        start: '1'
      }));

      return this.parseSearchResults(response.data);
    } catch (error) {
      console.error('Back Office search failed:', error);
      throw error;
    }
  }

  private parseSearchResults(html: string): any[] {
    const results: any[] = [];
    
    // Pattern looks for: <a href="...func=show_product...">(Product Name)</a> ... (SKU) ... (Price)
    const productRegex = /<a[^>]+func=show_product[^>]+>([^<]+)<\/a>.*?<td[^>]*>([^<]*)<\/td>/gis;
    
    let match;
    while ((match = productRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const possibleSku = match[2].trim();
      
      if (name) {
        results.push({
          Name: name,
          SKU: possibleSku || 'Unknown',
          Source: 'BackOfficeScraper'
        });
      }
    }
    
    return results;
  }

    try {
      // product_mgr.cgi is the standard back-office script for managing products.
      // We simulate a search form submission.
      const response = await this.client.post('/product_mgr.cgi', new URLSearchParams({
        func: 'search',
        search_field: 'Name', // Defaulting to Name, could be 'SKU'
        search_pattern: query,
        start: '1'
      }));

      return this.parseSearchResults(response.data);
    } catch (error) {
      console.error('Back Office search failed:', error);
      throw error;
    }
  }

  private parseSearchResults(html: string): any[] {
    const results: any[] = [];
    
    // Regex to find rows in the product table.
    // This is fragile and depends on ShopSite's HTML structure (likely v10-14).
    // Pattern looks for: <a href="...func=show_product...">(Product Name)</a> ... (SKU) ... (Price)
    
    // Attempt 1: capturing the product name link and maybe SKU
    const productRegex = /<a[^>]+func=show_product[^>]+>([^<]+)<\/a>.*?<td[^>]*>([^<]*)<\/td>/gis;
    
    let match;
    while ((match = productRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const possibleSku = match[2].trim();
      
      if (name) {
        results.push({
          Name: name,
          SKU: possibleSku || 'Unknown', // SKU often appears in the next column
          Source: 'BackOfficeScraper'
        });
      }
    }
    
    return results;
  }
}
