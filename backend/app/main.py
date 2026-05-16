from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import ScanRequest, ScanResponse
from app.repo_service import clone_repository, cleanup_repository
from app.scanner import scan_repository

app = FastAPI(title="BobGuard Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "BobGuard API"}


@app.post("/scan", response_model=ScanResponse)
def scan_repo(request: ScanRequest):
    repo_path = None

    try:
        repo_path = clone_repository(str(request.repo_url))
        findings = scan_repository(repo_path)

        return ScanResponse(
            repo_url=str(request.repo_url),
            findings=findings,
            total_findings=len(findings)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if repo_path:
            cleanup_repository(repo_path)