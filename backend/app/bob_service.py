from typing import Optional, List, Dict

REMEDIATION_MAP = {
    "Hardcoded Secret": {
        "explanation": "A hardcoded secret means sensitive credentials are stored directly in source code.",
        "why": "If the repository is leaked or shared, attackers can immediately use the exposed key or password.",
        "steps": [
            "Remove the secret from source code.",
            "Move the value to environment variables or a secure secret manager.",
            "Rotate the exposed secret immediately.",
            "Add the file pattern to .gitignore if needed."
        ],
        "safe_code": "api_key = os.getenv('API_KEY')"
    },
    "SQL Injection": {
        "explanation": "SQL Injection happens when user input is directly concatenated into a database query.",
        "why": "Attackers may read, modify, or delete database records by injecting malicious SQL.",
        "steps": [
            "Use parameterized queries or prepared statements.",
            "Validate and sanitize user input.",
            "Avoid building SQL strings with user-controlled values."
        ],
        "safe_code": "cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))"
    },
    "Insecure Deserialization": {
        "explanation": "Unsafe deserialization allows untrusted data to be converted into objects without validation.",
        "why": "Attackers may execute arbitrary code or manipulate application state.",
        "steps": [
            "Avoid unsafe deserialization libraries or methods.",
            "Validate data format before parsing.",
            "Use safer serialization formats like JSON where possible."
        ],
        "safe_code": None
    }
}

def explain_finding(
    issue_type: str,
    severity: str,
    owasp_category: str,
    file_path: str,
    description: str,
    code_snippet: Optional[str] = None,
) -> Dict:
    matched = REMEDIATION_MAP.get(issue_type, None)

    if matched:
        explanation = matched["explanation"]
        why_it_matters = matched["why"]
        remediation_steps = matched["steps"]
        safer_code_suggestion = matched["safe_code"]
    else:
        explanation = f"{issue_type} was detected in {file_path} under {owasp_category}."
        why_it_matters = (
            f"This {severity.lower()} severity issue may expose the application to security risk "
            f"if left unresolved."
        )
        remediation_steps = [
            "Review the affected code section carefully.",
            "Reduce trust in external or user-controlled input.",
            "Apply secure coding best practices for this vulnerability type.",
            "Retest after applying the fix."
        ]
        safer_code_suggestion = None

    if code_snippet:
        explanation += " The provided code snippet should be reviewed around the highlighted logic."

    return {
        "explanation": explanation,
        "why_it_matters": why_it_matters,
        "remediation_steps": remediation_steps,
        "safer_code_suggestion": safer_code_suggestion,
    }