"""MVP OWASP rule definitions for BobGuard."""

from __future__ import annotations

from .fix_templates import get_fix_template

OWASP_RULES = [
    {
        "rule_id": "A03",
        "title": "Injection",
        "owasp_category": "A03:2021 - Injection",
        "severity": "critical",
        "description": (
            "Detects unsafely concatenated SQL, shell, or template input that can be controlled "
            "by an attacker."
        ),
        "pattern_hints": [
            r"execute\(.*\+",
            r"SELECT\s+.*['\"].*\+",
            r"(os\.system|subprocess\..*)\(.*\+",
        ],
        "suggested_fix_template": get_fix_template("A03"),
    },
    {
        "rule_id": "A02",
        "title": "Cryptographic Failures",
        "owasp_category": "A02:2021 - Cryptographic Failures",
        "severity": "high",
        "description": (
            "Flags weak hashes, hardcoded secrets, insecure ciphers, and missing encryption for "
            "sensitive data."
        ),
        "pattern_hints": [
            r"\bmd5\(",
            r"\bsha1\(",
            r"(api|secret|token).{0,20}[=:].{0,20}['\"].+['\"]",
        ],
        "suggested_fix_template": get_fix_template("A02"),
    },
    {
        "rule_id": "A05",
        "title": "Security Misconfiguration",
        "owasp_category": "A05:2021 - Security Misconfiguration",
        "severity": "medium",
        "description": (
            "Finds debug mode, permissive CORS, default credentials, verbose error output, and "
            "overly broad server settings."
        ),
        "pattern_hints": [
            r"debug\s*=\s*True",
            r"allow_origins\s*=\s*\[\s*['\"]\*['\"]\s*\]",
            r"default(password|credential|admin)",
        ],
        "suggested_fix_template": get_fix_template("A05"),
    },
    {
        "rule_id": "A01",
        "title": "Broken Access Control",
        "owasp_category": "A01:2021 - Broken Access Control",
        "severity": "high",
        "description": (
            "Detects missing authorization checks, direct object access without ownership validation, "
            "and admin-only actions exposed to any user."
        ),
        "pattern_hints": [
            r"if\s+user\.(is_admin|role\s*==\s*['\"]admin['\"])",
            r"get\(request\.(args|json|form)\[.*\]\)",
            r"(delete|update|approve|export)_.*\(.*user_id",
        ],
        "suggested_fix_template": get_fix_template("A01"),
    },
    {
        "rule_id": "A09",
        "title": "Security Logging & Monitoring Failures",
        "owasp_category": "A09:2021 - Security Logging & Monitoring Failures",
        "severity": "medium",
        "description": (
            "Flags missing audit events, swallowed exceptions, and sensitive actions that do not "
            "leave an alertable trail."
        ),
        "pattern_hints": [
            r"except\s+Exception\s*:\s*pass",
            r"logger\.(debug|info)\(.*(auth|login|permission)",
            r"print\(.*(error|failed|denied)",
        ],
        "suggested_fix_template": get_fix_template("A09"),
    },
]

RULE_INDEX = {rule["rule_id"]: rule for rule in OWASP_RULES}


def list_rules():
    """Return all MVP OWASP rules in a stable order."""

    return list(OWASP_RULES)


def get_rule(rule_id: str):
    """Return a single rule by ID, or None when it does not exist."""

    return RULE_INDEX.get(rule_id)


__all__ = ["OWASP_RULES", "RULE_INDEX", "get_rule", "list_rules"]
