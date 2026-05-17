from fastmcp import FastMCP
from app.bob_service import explain_finding

mcp = FastMCP("BobGuard MCP Server")

@mcp.tool
def explain_finding_tool(
    issue_type: str,
    severity: str,
    owasp_category: str,
    file_path: str,
    description: str,
    code_snippet: str = "",
) -> dict:
    return explain_finding(
        issue_type=issue_type,
        severity=severity,
        owasp_category=owasp_category,
        file_path=file_path,
        description=description,
        code_snippet=code_snippet or None,
    )

if __name__ == "__main__":
    mcp.run(transport="http", host="127.0.0.1", port=8001, path="/mcp")