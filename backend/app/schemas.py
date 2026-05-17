from pydantic import BaseModel, HttpUrl
from typing import List, Optional


class ScanRequest(BaseModel):
    repo_url: HttpUrl


class Finding(BaseModel):
    file_path: str
    line_number: Optional[int] = None
    issue_type: str
    severity: str
    owasp_category: str
    description: str
    suggestion: str


class ScanResponse(BaseModel):
    repo_url: str
    findings: List[Finding]
    total_findings: int


class BobExplainFindingRequest(BaseModel):
    issue_type: str
    severity: str
    owasp_category: str
    file_path: str
    description: str
    code_snippet: Optional[str] = None

class BobExplainFindingResponse(BaseModel):
    explanation: str
    why_it_matters: str
    remediation_steps: List[str]
    safer_code_suggestion: Optional[str] = None