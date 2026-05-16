"""Reusable remediation templates for the MVP OWASP rules."""

FIX_TEMPLATES = {
    "A03": (
        "Use parameterized queries, prepared statements, and strict input validation. "
        "Never concatenate untrusted input into SQL, shell commands, or templates."
    ),
    "A02": (
        "Use modern cryptographic primitives, store secrets in a managed secret store, "
        "and encrypt sensitive data in transit and at rest with approved algorithms."
    ),
    "A05": (
        "Disable debug and verbose error output in production, remove default credentials, "
        "and lock down configuration to least-privilege secure defaults."
    ),
    "A01": (
        "Enforce server-side authorization on every sensitive action, scope queries by the "
        "authenticated principal, and deny by default when ownership is not proven."
    ),
    "A09": (
        "Record security-relevant events with enough context for investigation, preserve log "
        "integrity, and alert on repeated or high-risk anomalies."
    ),
}


def get_fix_template(rule_id: str) -> str:
    """Return the remediation template for a rule."""

    return FIX_TEMPLATES[rule_id]


__all__ = ["FIX_TEMPLATES", "get_fix_template"]
