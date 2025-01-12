import subprocess
import json
from mcp import McpServer, McpError, ErrorCode

class NpmSearchServer(McpServer):
    def __init__(self):
        super().__init__(
            name="npm-search-server",
            version="0.1.0",
            tools={
                "search_npm_packages": {
                    "description": "Search for npm packages",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query"
                            }
                        },
                        "required": ["query"]
                    }
                }
            }
        )

    async def handle_tool_call(self, tool_name, arguments):
        if tool_name != "search_npm_packages":
            raise McpError(ErrorCode.METHOD_NOT_FOUND, f"Unknown tool: {tool_name}")

        query = arguments.get("query")
        if not query:
            raise McpError(ErrorCode.INVALID_PARAMS, "Invalid search arguments")

        try:
            result = subprocess.run(["npm", "search", query], capture_output=True, text=True)
            if result.stderr:
                raise McpError(ErrorCode.INTERNAL_ERROR, f"npm search error: {result.stderr}")

            return {
                "content": [
                    {
                        "type": "text",
                        "text": result.stdout
                    }
                ]
            }
        except Exception as e:
            raise McpError(ErrorCode.INTERNAL_ERROR, f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    server = NpmSearchServer()
    server.run()
