/**
 * UnMarket MCP Server
 * Exposes UnMarket functionality via Model Context Protocol
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getProductManager } from '../core/product-manager.js';
import { ContentGenerator } from '../core/content-generator.js';
import { Crawler } from '../core/crawler.js';
import { AccountRegistrar } from '../core/account-registrar.js';
import { getAccountManager } from '../storage/accounts.js';
import { initDatabase } from '../storage/database.js';

// Initialize database
initDatabase();

const server = new Server(
  {
    name: 'unmarket',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const TOOLS = [
  {
    name: 'analyze_product',
    description: 'Analyze a product URL and extract information (name, tagline, description, features)',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Product URL to analyze' }
      },
      required: ['url']
    }
  },
  {
    name: 'list_products',
    description: 'List all registered products',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'add_product',
    description: 'Add a new product manually',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name' },
        url: { type: 'string', description: 'Product URL' },
        tagline: { type: 'string', description: 'Product tagline' },
        description: { type: 'string', description: 'Product description' }
      },
      required: ['name', 'url']
    }
  },
  {
    name: 'generate_content',
    description: 'Generate marketing content for a product',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'Product ID' },
        platforms: {
          type: 'array',
          items: { type: 'string' },
          description: 'Target platforms (e.g., twitter, linkedin, reddit)'
        },
        languages: {
          type: 'array',
          items: { type: 'string' },
          description: 'Target languages (e.g., en, zh, ja)'
        }
      },
      required: ['productId']
    }
  },
  {
    name: 'list_accounts',
    description: 'List all configured platform accounts',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'gmail_status',
    description: 'Check Gmail connection status for auto-registration',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'register_account',
    description: 'Auto-register an account on a platform',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          description: 'Platform to register on (e.g., twitter, reddit, devto)'
        }
      },
      required: ['platform']
    }
  }
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'analyze_product': {
        const url = args.url as string;
        if (!url) {
          return { content: [{ type: 'text', text: 'Error: url is required' }], isError: true };
        }
        const crawler = new Crawler();
        const result = await crawler.analyze(url);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }

      case 'list_products': {
        const manager = getProductManager();
        const products = manager.list(false);
        return {
          content: [{ type: 'text', text: JSON.stringify(products, null, 2) }]
        };
      }

      case 'add_product': {
        const name = args.name as string;
        const url = args.url as string;
        if (!name || !url) {
          return { content: [{ type: 'text', text: 'Error: name and url are required' }], isError: true };
        }
        const manager = getProductManager();
        const product = manager.add({
          name,
          url,
          tagline: (args.tagline as string) || undefined,
          description: (args.description as string) || undefined
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(product, null, 2) }]
        };
      }

      case 'generate_content': {
        const productId = args.productId as string;
        if (!productId) {
          return { content: [{ type: 'text', text: 'Error: productId is required' }], isError: true };
        }
        const manager = getProductManager();
        const product = manager.getById(productId);
        if (!product) {
          return {
            content: [{ type: 'text', text: 'Error: Product not found' }],
            isError: true
          };
        }

        const generator = new ContentGenerator();
        const contents = await generator.generate(product, {
          platforms: (args.platforms as string[]) || ['twitter', 'linkedin'],
          languages: (args.languages as string[]) || ['en']
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(contents, null, 2) }]
        };
      }

      case 'list_accounts': {
        const manager = getAccountManager();
        const accounts = manager.list();
        return {
          content: [{ type: 'text', text: JSON.stringify(accounts, null, 2) }]
        };
      }

      case 'gmail_status': {
        const registrar = new AccountRegistrar();
        const status = await registrar.getGmailStatus();
        return {
          content: [{ type: 'text', text: JSON.stringify(status, null, 2) }]
        };
      }

      case 'register_account': {
        const platform = args.platform as string;
        if (!platform) {
          return { content: [{ type: 'text', text: 'Error: platform is required' }], isError: true };
        }
        const registrar = new AccountRegistrar();
        const result = await registrar.register(platform);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UnMarket MCP server started');
}

main().catch(console.error);
