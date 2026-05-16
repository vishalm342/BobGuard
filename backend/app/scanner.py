import re
from pathlib import Path
from typing import List

from app.owasp_rules import OWASP_RULES
from app.schemas import Finding


ALLOWED_EXTENSIONS = {
    ".py", ".js", ".ts", ".java", ".go", ".rb", ".php",
    ".env", ".json", ".yaml", ".yml", ".ini", ".cfg", ".txt"
}


def is_text_file(file_path: Path) -> bool:
    return file_path.suffix.lower() in ALLOWED_EXTENSIONS


def scan_file(file_path: Path, repo_root: Path) -> List[Finding]:
    findings = []

    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return findings

    lines = content.splitlines()

    for idx, line in enumerate(lines, start=1):
        for rule in OWASP_RULES:
            for pattern in rule["pattern_hints"]:
                if re.search(pattern, line, re.IGNORECASE):
                    findings.append(
                        Finding(
                            file_path=str(file_path.relative_to(repo_root)),
                            line_number=idx,
                            issue_type=rule["rule_id"],
                            severity=rule["severity"],
                            owasp_category=rule["owasp_category"],
                            description=rule["description"],
                            suggestion=rule["suggested_fix_template"]
                        )
                    )
                    break  # only one finding per rule per line

    return findings


def scan_repository(repo_root: Path) -> List[Finding]:
    all_findings = []

    for file_path in repo_root.rglob("*"):
        if file_path.is_file() and is_text_file(file_path):
            all_findings.extend(scan_file(file_path, repo_root))

    return all_findings