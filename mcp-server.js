
[36m🔍 KAVLR analyzing: ""...[0m
[32m✅ [ALLOWED] Action permitted.[0m
#!/usr/bin/env node
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { exec } = require("child_process");
const axios = require("axios");

// Configuration
const KAVLR_API = 'http://localhost:3000/api/intercept';
const API_KEY = process.env.KAVLR_API_KEY || '';

// Initialize MCP Server
const server = new Server(
  { name: "kavlr-security", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 1. Tell the AI what tools it has
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_command",
        description: "Execute a terminal command on the host machine. REQUIRED: All commands must go through this tool.",
        inputSchema: {
          type: "object",
          properties: {
            command: { type: "string", description: "The shell command to execute" }
          },
          required: ["command"]
        }
      }
    ]
  };
});

// 2. Intercept the AI's command execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "execute_command") {
    const cmd = request.params.arguments.command;

    try {
      // Ask KAVLR if this command is safe
      const response = await axios.post(KAVLR_API, {
        agent_id: 'mcp-cursor-agent',
        action_type: 'terminal_command',
        payload: cmd
      }, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      // If KAVLR says ALLOWED, run the command
      return new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            resolve({ content: [{ type: "text", text: `Error: ${error.message}\n${stderr}` }], isError: true });
          } else {
            resolve({ content: [{ type: "text", text: stdout }] });
          }
        });
      });

    } catch (error) {
      // If KAVLR returns 403 (Blocked) or fails, reject the command!
      if (error.response && error.response.status === 403) {
        return {
          content: [{ type: "text", text: `🛑 KAVLR SECURITY BLOCK: ${error.response.data.message}` }],
          isError: true
        };
      }
      return {
        content: [{ type: "text", text: `🛑 KAVLR CONNECTION ERROR: Command blocked for safety.` }],
        isError: true
      };
    }
  }
  throw new Error("Tool not found");
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🛡️ KAVLR MCP Server running on stdio");
}

main().catch(console.error);
