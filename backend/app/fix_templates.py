"""
fix_templates.py
Provides human-readable, actionable fix suggestions keyed by issue_type.
Each key corresponds to an issue_type defined in owasp_rules.py.
"""

FIX_TEMPLATES: dict[str, str] = {
    "hardcoded_secret": (
        "Remove the hardcoded secret from source code. "
        "Store sensitive values (API keys, passwords, tokens) in environment variables "
        "or a secrets manager (e.g. HashiCorp Vault, AWS Secrets Manager) and load them "
        "at runtime via os.environ or a .env file that is excluded from version control."
    ),
    "sql_injection_risk": (
        "Avoid building SQL queries with string concatenation or f-strings. "
        "Use parameterised queries (prepared statements) provided by your database driver "
        "(e.g. cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))) "
        "or an ORM that handles escaping automatically (SQLAlchemy, Django ORM)."
    ),
    "debug_enabled": (
        "Set DEBUG=False in production. "
        "Control the debug flag through an environment variable "
        "(e.g. DEBUG=os.getenv('DEBUG', 'False').lower() == 'true') "
        "so it is never accidentally enabled in a deployed environment."
    ),
    "weak_cors": (
        "Replace the wildcard '*' origin with an explicit allowlist of trusted origins. "
        "For example: allow_origins=['https://yourdomain.com']. "
        "This prevents untrusted websites from making credentialed cross-origin requests "
        "to your API."
    ),
    "weak_crypto": (
        "Replace MD5 or SHA-1 with a strong, modern algorithm. "
        "For general hashing use SHA-256 or SHA-3 (hashlib.sha256). "
        "For password hashing use an adaptive algorithm such as bcrypt, scrypt, or Argon2 "
        "(e.g. passlib or the argon2-cffi library)."
    ),
    "dangerous_eval": (
        "Remove eval() and replace it with a safe alternative. "
        "For mathematical expressions consider ast.literal_eval() or the 'numexpr' library. "
        "For dynamic dispatch use a lookup dict or getattr(). "
        "eval() on untrusted input allows arbitrary code execution."
    ),
    "subprocess_shell_true": (
        "Pass shell=False (the default) and supply the command as a list of arguments "
        "instead of a single string: subprocess.run(['cmd', 'arg1', 'arg2']). "
        "If shell=True is unavoidable, rigorously validate and sanitise every user-supplied "
        "input with shlex.quote() before interpolating it into the command string."
    ),
    "pickle_load_risk": (
        "Do not deserialise pickle data from untrusted or unverified sources. "
        "Pickle can execute arbitrary Python code during deserialisation. "
        "Prefer safe serialisation formats such as JSON, MessagePack, or Protocol Buffers. "
        "If pickle must be used, cryptographically sign the payload and verify the "
        "signature before calling pickle.load()."
    ),
}

_DEFAULT_SUGGESTION = (
    "Review this finding carefully and apply the principle of least privilege. "
    "Consult the relevant OWASP Top 10 category for detailed remediation guidance."
)


def get_fix_suggestion(issue_type: str) -> str:
    """Return a human-readable fix suggestion for the given issue_type.

    Falls back to a generic suggestion if the issue_type is not recognised.
    """
    return FIX_TEMPLATES.get(issue_type, _DEFAULT_SUGGESTION)
