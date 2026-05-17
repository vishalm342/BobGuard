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
    """
    Explain a security finding and provide remediation guidance.
    
    This tool helps IBM Bob provide detailed security explanations for vulnerabilities
    detected by BobGuard's security scanner. It returns expert remediation advice
    tailored to the specific vulnerability type.
    
    Args:
        issue_type: The type of security issue (e.g., "A03", "SQL Injection", "Hardcoded Secret")
        severity: Severity level (e.g., "critical", "high", "medium", "low")
        owasp_category: OWASP category (e.g., "A03:2021 - Injection")
        file_path: Path to the file containing the vulnerability
        description: Description of the security issue
        code_snippet: Optional code snippet showing the vulnerable code
    
    Returns:
        dict: Contains explanation, why_it_matters, remediation_steps, and safer_code_suggestion
    
    Example:
        explain_finding_tool(
            issue_type="A03",
            severity="critical",
            owasp_category="A03:2021 - Injection",
            file_path="app/database.py",
            description="SQL query concatenation detected",
            code_snippet="query = 'SELECT * FROM users WHERE id=' + user_id"
        )
    """
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