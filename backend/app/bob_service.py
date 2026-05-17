from typing import Optional, List, Dict

REMEDIATION_MAP = {
    # A02 - Cryptographic Failures
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
    "A02": {
        "explanation": "Cryptographic failures occur when weak hashing algorithms, insecure ciphers, or hardcoded secrets are used.",
        "why": "Weak cryptography can be broken by attackers, exposing sensitive data like passwords, tokens, or personal information.",
        "steps": [
            "Replace MD5/SHA1 with SHA-256 or bcrypt for password hashing.",
            "Store secrets in environment variables or a secret manager (e.g., AWS Secrets Manager, HashiCorp Vault).",
            "Use TLS 1.2+ for data in transit.",
            "Encrypt sensitive data at rest with AES-256 or equivalent."
        ],
        "safe_code": "import bcrypt\nhashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())"
    },
    
    # A03 - Injection
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
    "A03": {
        "explanation": "Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query.",
        "why": "Attackers can trick the interpreter into executing unintended commands, leading to data theft, corruption, or system compromise.",
        "steps": [
            "Use parameterized queries for SQL (never concatenate user input).",
            "Use safe APIs that avoid shell execution (e.g., subprocess with list arguments).",
            "Validate and sanitize all user inputs.",
            "Apply least privilege to database accounts."
        ],
        "safe_code": "# SQL: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))\n# Shell: subprocess.run(['ls', user_dir], check=True)"
    },
    
    # A01 - Broken Access Control
    "A01": {
        "explanation": "Broken access control allows users to act outside their intended permissions.",
        "why": "Attackers can access unauthorized data, modify other users' accounts, or perform admin actions without proper authorization.",
        "steps": [
            "Enforce authorization checks on every sensitive endpoint.",
            "Validate that the authenticated user owns the resource being accessed.",
            "Deny access by default; require explicit permission grants.",
            "Use role-based access control (RBAC) or attribute-based access control (ABAC)."
        ],
        "safe_code": "if resource.owner_id != current_user.id:\n    raise PermissionError('Access denied')"
    },
    
    # A05 - Security Misconfiguration
    "A05": {
        "explanation": "Security misconfiguration occurs when systems are deployed with insecure default settings or overly permissive configurations.",
        "why": "Misconfigurations expose sensitive information, enable unauthorized access, or provide attack vectors through verbose errors or debug modes.",
        "steps": [
            "Disable debug mode in production environments.",
            "Remove or change default credentials.",
            "Restrict CORS to specific trusted origins (not '*').",
            "Minimize error message verbosity to avoid information leakage.",
            "Keep all software and dependencies up to date."
        ],
        "safe_code": "# FastAPI\napp.add_middleware(CORSMiddleware, allow_origins=['https://trusted-domain.com'])\n# Django\nDEBUG = False"
    },
    
    # A09 - Security Logging & Monitoring Failures
    "A09": {
        "explanation": "Insufficient logging and monitoring prevents detection of security incidents and breaches.",
        "why": "Without proper logs, attackers can operate undetected, and security teams cannot investigate or respond to incidents effectively.",
        "steps": [
            "Log all authentication attempts, authorization failures, and sensitive actions.",
            "Include sufficient context (user ID, IP, timestamp, action) in logs.",
            "Never log sensitive data like passwords or tokens.",
            "Set up alerts for suspicious patterns (e.g., repeated failed logins).",
            "Ensure log integrity and secure storage."
        ],
        "safe_code": "import logging\nlogger.warning(f'Failed login attempt for user {username} from IP {ip_address}')"
    },
    
    # Legacy/Generic
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