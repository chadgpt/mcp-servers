#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  CallToolResult,
  TextContent,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Define the tools once to avoid repetition
const TOOLS: Tool[] = [
  {
    name: "get_current_time",
    description: "Get the current server time",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// Global state
const consoleLogs: string[] = [];

async function handleToolCall(name: string, args: any): Promise<CallToolResult> {
  switch (name) {
    case "get_current_time":
      const currentTime = new Date().toISOString();
      console.error(currentTime);
      return {
        content: [{
          type: "text",
          text: `Current server time: ${currentTime}`,
        }],
        isError: false,
      };

    default:
      return {
        content: [{
          type: "text",
          text: `Unknown tool: ${name}`,
        }],
        isError: true,
      };
  }
}

const server = new Server(
  {
    name: "custom-servers/ts-time",
    version: "0.1.1",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

// Setup request handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  throw new Error(`Resource not found: ${request.params.uri}`);
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) =>
  handleToolCall(request.params.name, request.params.arguments ?? {})
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error);

process.stdin.on("close", () => {
  console.error("Time MCP Server closed");
  server.close();
});
