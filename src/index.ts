import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import { ShopSiteClient } from "./client.js";

dotenv.config();

const requiredEnv = ['SHOPSITE_BASE_URL', 'SHOPSITE_CLIENT_ID', 'SHOPSITE_CLIENT_SECRET', 'SHOPSITE_AUTH_CODE'];
for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.error(`Error: Missing required environment variable ${env}`);
    process.exit(1);
  }
}

const client = new ShopSiteClient({
  baseUrl: process.env.SHOPSITE_BASE_URL!,
  clientId: process.env.SHOPSITE_CLIENT_ID!,
  clientSecret: process.env.SHOPSITE_CLIENT_SECRET!,
  authCode: process.env.SHOPSITE_AUTH_CODE!,
  username: process.env.SHOPSITE_USER,
  password: process.env.SHOPSITE_PASS,
});

const server = new McpServer({
  name: "shopsite-mcp",
  version: "1.0.0",
});

server.tool(
  "get_orders",
  "Retrieve list of recent orders from ShopSite",
  {
    days: z.number().optional().default(30).describe("Number of days to look back"),
  },
  async ({ days }) => {
    try {
      const orders = await client.getOrders(days);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(orders, null, 2),
          },
        ],
      };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `Error fetching orders: ${errorMessage}` }],
            isError: true,
        };
    }
  }
);

server.tool(
  "get_products",
  "Retrieve product catalog from ShopSite",
  {},
  async () => {
    try {
      const products = await client.getProducts();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(products, null, 2),
          },
        ],
      };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `Error fetching products: ${errorMessage}` }],
            isError: true,
        };
    }
  }
);

server.tool(
  "update_inventory",
  "Update inventory quantity for a specific product SKU",
  {
    sku: z.string().describe("Product SKU"),
    quantity: z.number().describe("New inventory quantity"),
  },
  async ({ sku, quantity }) => {
    try {
      const success = await client.updateInventory(sku, quantity);
      return {
        content: [
          {
            type: "text",
            text: success ? `Successfully updated inventory for SKU ${sku} to ${quantity}` : `Failed to update inventory for SKU ${sku}`,
          },
        ],
        isError: !success
      };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `Error updating inventory: ${errorMessage}` }],
            isError: true,
        };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
