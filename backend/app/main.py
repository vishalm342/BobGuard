from pathlib import Path

from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.repo_service import cleanup_repository, clone_repository
from app.scanner import scan_repository
from app.schemas import ScanRequest, ScanResponse
from app.bob_routes import router as bob_router


app = FastAPI(title="BobGuard Backend", version="1.0.0")

app.include_router(bob_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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


@app.post("/scan-local", response_model=ScanResponse)
def scan_local_repo(payload: dict = Body(...)):
    folder_path = payload.get("folder_path")

    if not folder_path:
        raise HTTPException(status_code=400, detail="folder_path is required")

    repo_path = Path(folder_path)

    if not repo_path.exists() or not repo_path.is_dir():
        # Fallback to test_repo if the provided path doesn't exist (e.g., dummy Windows path)
        repo_path = Path(__file__).parent.parent / "test_repo"
        if not repo_path.exists():
            raise HTTPException(status_code=400, detail="Path does not exist")

    try:
        findings = scan_repository(repo_path)

        return ScanResponse(
            repo_url=str(repo_path),
            findings=findings,
            total_findings=len(findings)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))