from fastapi import APIRouter
from app.schemas import BobExplainFindingRequest, BobExplainFindingResponse
from app.bob_service import explain_finding

router = APIRouter(prefix="/bob", tags=["bob"])

@router.post("/explain-finding", response_model=BobExplainFindingResponse)
def explain_finding_route(payload: BobExplainFindingRequest):
    result = explain_finding(
        issue_type=payload.issue_type,
        severity=payload.severity,
        owasp_category=payload.owasp_category,
        file_path=payload.file_path,
        description=payload.description,
        code_snippet=payload.code_snippet,
    )
    return BobExplainFindingResponse(**result)