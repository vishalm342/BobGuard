RULES = [
    {
        "name": "Hardcoded Secret",
        "issue_type": "hardcoded_secret",
        "pattern": r"(api[_-]?key|secret|token|password)\s*[:=]\s*[\"'][^\"'\n]{4,}[\"']",
        "severity": "High",
        "owasp_category": "A02:2021 - Cryptographic Failures",
        "description": "Possible hardcoded secret found in source code."
    },
    {
        "name": "Bearer Token Pattern",
        "issue_type": "hardcoded_secret",
        "pattern": r"Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*",
        "severity": "High",
        "owasp_category": "A02:2021 - Cryptographic Failures",
        "description": "Possible bearer token exposed in code or config."
    },
    {
        "name": "SQL Injection Risk",
        "issue_type": "sql_injection_risk",
        "pattern": r"(SELECT|INSERT|UPDATE|DELETE).*(\+|%s|format\(|f\")",
        "severity": "High",
        "owasp_category": "A03:2021 - Injection",
        "description": "Possible SQL query built unsafely using interpolation or concatenation."
    },
    {
        "name": "Debug Enabled",
        "issue_type": "debug_enabled",
        "pattern": r"debug\s*=\s*True|FLASK_DEBUG\s*=\s*1|DEBUG\s*=\s*True",
        "severity": "Medium",
        "owasp_category": "A05:2021 - Security Misconfiguration",
        "description": "Debug mode appears to be enabled."
    },
    {
        "name": "Weak CORS",
        "issue_type": "weak_cors",
        "pattern": r"allow_origins\s*=\s*\[\s*[\"']\*[\"']\s*\]|Access-Control-Allow-Origin[\"']?\s*[:=]\s*[\"']\*[\"']",
        "severity": "Medium",
        "owasp_category": "A05:2021 - Security Misconfiguration",
        "description": "Wildcard CORS configuration detected."
    },
    {
        "name": "Weak Crypto",
        "issue_type": "weak_crypto",
        "pattern": r"\b(md5|sha1)\s*\(",
        "severity": "Medium",
        "owasp_category": "A02:2021 - Cryptographic Failures",
        "description": "Weak cryptographic primitive detected."
    },
    {
        "name": "Dangerous Eval",
        "issue_type": "dangerous_eval",
        "pattern": r"\b(eval|exec)\s*\(",
        "severity": "High",
        "owasp_category": "A03:2021 - Injection",
        "description": "Dangerous dynamic code execution detected."
    },
    {
        "name": "Subprocess shell=True",
        "issue_type": "subprocess_shell_true",
        "pattern": r"subprocess\.(run|Popen|call)\(.*shell\s*=\s*True",
        "severity": "High",
        "owasp_category": "A03:2021 - Injection",
        "description": "subprocess with shell=True can be dangerous."
    },
    {
        "name": "Pickle Load Risk",
        "issue_type": "pickle_load_risk",
        "pattern": r"pickle\.load\s*\(",
        "severity": "High",
        "owasp_category": "A08:2021 - Software and Data Integrity Failures",
        "description": "Untrusted pickle deserialization can lead to code execution."
    }
]