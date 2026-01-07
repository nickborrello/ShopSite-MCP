# ShopSite MCP Server

<div align="center">
  <img src="https://www.shopsite.com/img/logo/shopsite-color-260.png" alt="ShopSite Logo" width="200" />
  <br />
</div>

A Model Context Protocol (MCP) server that connects AI agents to the [ShopSite](https://www.shopsite.com/) e-commerce platform.

This server allows LLMs to programmatically interact with a ShopSite store to retrieve orders, browse products, and update inventory, abstracting away the complexity of ShopSite's legacy XML/CGI interfaces and HMAC authentication.

## Features

- **Orders**: Fetch recent orders with date filtering.
- **Products**: Retrieve the full product catalog.
- **Inventory**: Update stock levels for specific SKUs.
- **Security**: Handles ShopSite's custom OAuth 1.0a-style HMAC-SHA1 signature generation automatically.
- **Type Safety**: Built with TypeScript and Zod for robust input validation.

## Tools

| Tool | Description | Inputs |
| :--- | :--- | :--- |
| `get_orders` | Retrieve list of recent orders | `days` (optional, default 30) |
| `get_products` | Retrieve product catalog | (none) |
| `update_inventory` | Update inventory quantity for a SKU | `sku` (string), `quantity` (number) |

## Prerequisites

- Node.js v18+ OR Docker
- A ShopSite store (Pro version recommended for XML API access)
- ShopSite API Credentials (Client ID, Secret, etc.)

## Configuration

You must provide the following environment variables (via `.env` or Docker env vars):

```bash
SHOPSITE_BASE_URL=https://mystore.com/cgi-bin/sc
SHOPSITE_CLIENT_ID=your_client_id
SHOPSITE_CLIENT_SECRET=your_client_secret
SHOPSITE_AUTH_CODE=your_auth_code
SHOPSITE_USER=your_username    # Optional, depending on auth setup
SHOPSITE_PASS=your_password    # Optional
```

To obtain credentials:
1. Log in to ShopSite Back Office.
2. Go to **Utilities > Applications**.
3. Register a new application to get the Client ID and Secret.

## Installation & Usage

### Option 1: Docker (Recommended)

Run directly with Docker, passing your environment variables:

```bash
docker run -i --rm \
  -e SHOPSITE_BASE_URL="https://mystore.com/cgi-bin/sc" \
  -e SHOPSITE_CLIENT_ID="your_id" \
  -e SHOPSITE_CLIENT_SECRET="your_secret" \
  -e SHOPSITE_AUTH_CODE="your_code" \
  ghcr.io/nickborrello/shopsite-mcp:latest
```

### Option 2: NPX

Run directly from the registry without cloning:

```bash
npx shopsite-mcp
```
*(Ensure environment variables are set in your shell or .env)*

### Option 3: Manual Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Run the server**:
   ```bash
   node dist/src/index.js
   ```

### Debugging
You can verify the signature logic without connecting to a real store by running the included test script:
```bash
node dist/test/verify_signature.js
```

## Development

- `src/client.ts`: Handles the OAuth HMAC signing and XML parsing.
- `src/index.ts`: Defines the MCP server and tools.
- `src/types.ts`: TypeScript interfaces for ShopSite XML structures.

## 🤬 A Note on Developer Experience

To the team at ShopSite (if you ever read this): **Please join us in the modern era.**

Working with your platform is an absolute nightmare for developers.
- **Complete Lack of Modern API**: It is baffling that in this day and age, we are still forced to wrangle with archaic XML over CGI. There is no clean JSON REST API, no GraphQL, nothing that resembles modern software standards.
- **Unnecessarily Complex Auth**: Your implementation of HMAC-SHA1 signatures is convoluted, poorly documented, and fragile. It wastes hours of developer time for no tangible security benefit over standard OAuth 2.0.
- **Hostile Ecosystem**: This entire MCP server exists solely because you have made it so incredibly painful to build even the simplest integrations.

You are making it actively difficult for businesses to extend your platform. Please, for the sake of anyone who has to write code against your software: **Build a real API.**

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

### Disclaimer

This project is an unofficial tool and is not affiliated with, endorsed by, or connected to ShopSite, Inc. "ShopSite" is a registered trademark of ShopSite, Inc.
