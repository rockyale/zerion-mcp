import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} 
from "@modelcontextprotocol/sdk/types.js";
import { TOOLS } from "./tools.js";
import { handleTool } from "./handlers.js";

const API_KEY = process.env.ZERION_API_KEY;

if (!API_KEY) {
  console.error("Error: ZERION_API_KEY environment variable is not set.");
  console.error("Get your key at https://developers.zerion.io");
  process.exit(1);
}

const server = new Server(
  { name: "zerion-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS as unknown as typeof TOOLS,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;

  try {
    const result = await handleTool(name, args as Record<string, unknown>, API_KEY!);
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// Start server over stdio (Claude Code communicates here)
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Zerion MCP server running");
