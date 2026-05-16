# BobGuard

BobGuard is an AI-assisted security audit tool that analyzes a GitHub repository for common insecure coding patterns and returns structured findings mapped to OWASP Top 10 style categories.

## What it does

- Accepts a public GitHub repository URL
- Clones the repository temporarily for analysis
- Scans source files for risky patterns using rule-based checks
- Maps findings to OWASP-style categories
- Returns findings through a FastAPI backend as structured JSON
- Supports quick testing through Swagger UI

## Current MVP scope

The current MVP focuses on backend-first validation of the core scanning flow:

1. Receive a repository URL
2. Clone the repository into a temporary folder
3. Walk through supported text-based source files
4. Match suspicious patterns such as hardcoded secrets, unsafe eval usage, weak crypto, risky subprocess usage, weak CORS configuration, and debug settings
5. Return a machine-readable JSON response with severity, description, OWASP category, and remediation guidance

This version is intentionally lightweight:

- No database yet
- No user authentication yet
- No persistent scan history yet
- Best suited for hackathon/demo workflows and rapid iteration

## Project structure

```text
BobGuard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app and API routes
│   │   ├── schemas.py           # Request/response models
│   │   ├── repo_service.py      # Git repo cloning and cleanup
│   │   ├── scanner.py           # File walking and rule execution
│   │   ├── owasp_rules.py       # Detection rules and OWASP mapping
│   │   └── fix_templates.py     # Suggested remediations
│   ├── temp_repos/              # Temporary cloned repositories
│   ├── test_repo/               # Local vulnerable sample for testing
│   └── requirements.txt         # Python dependencies
├── public/                      # Frontend static assets
├── src/                         # Frontend source code
├── package.json                 # Frontend dependencies/scripts
├── vite.config.js               # Vite frontend config
└── README.md
```

## Backend modules

### `main.py`
Bootstraps the FastAPI application and exposes API endpoints.

### `schemas.py`
Defines request and response data models using Pydantic.

### `repo_service.py`
Handles temporary cloning and cleanup of GitHub repositories.

### `owasp_rules.py`
Stores the regex-based scanning rules and their OWASP category mapping.

### `scanner.py`
Reads supported files and generates findings when rules match.

### `fix_templates.py`
Provides remediation suggestions for each issue type.

## API endpoints

### `GET /health`
Simple health check endpoint to verify that the backend is running.

**Sample response**

```json
{
  "status": "ok",
  "service": "BobGuard API"
}
```

### `POST /scan`
Scans a public GitHub repository.

**Request body**

```json
{
  "repo_url": "https://github.com/octocat/Hello-World.git"
}
```

**Sample response**

```json
{
  "repo_url": "https://github.com/octocat/Hello-World.git",
  "findings": [],
  "total_findings": 0
}
```

### Suggested next endpoint

A future `POST /scan-local` endpoint can be added for local folder testing during development, which makes rule testing much faster than pushing intentionally vulnerable code to a remote repository.

## Detection coverage in the current MVP

The current rule set is aimed at common developer mistakes and insecure patterns such as:

- Hardcoded secrets
- SQL injection-like string building
- Debug mode enabled
- Weak CORS configuration
- Weak cryptographic functions like MD5 or SHA1
- Dangerous `eval()` or `exec()` usage
- `subprocess` calls with `shell=True`
- Unsafe pickle deserialization

## Tech stack

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- GitPython

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS (if retained in current frontend)

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/BobGuard.git
cd BobGuard
```

### 2. Set up the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the backend

```bash
uvicorn app.main:app --reload
```

Backend should now be available at:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

### 4. Run the frontend

From the project root:

```bash
npm install
npm run dev
```

## Testing the scanner

### Option 1: Test with Swagger UI

Open:

```text
http://127.0.0.1:8000/docs
```

Use `POST /scan` and submit:

```json
{
  "repo_url": "https://github.com/octocat/Hello-World.git"
}
```

### Option 2: Test with curl

```bash
curl -X POST "http://127.0.0.1:8000/scan" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/octocat/Hello-World.git"
  }'
```

### Option 3: Local vulnerable test repo

Create files with insecure patterns and later use a local scan endpoint for fast validation.

Example vulnerable snippet:

```python
password = "supersecret123"
debug = True
query = f"SELECT * FROM users WHERE id = {user_id}"
import hashlib
hashlib.md5(b"hello").hexdigest()
eval("print(123)")
```

## Known limitations

- Regex-based detection can produce false positives and false negatives
- Currently designed for public GitHub repositories only
- No persistent storage or scan history yet
- No authentication or multi-user support yet
- No SARIF/export/report generation yet
- No advanced AST, taint, or dependency analysis yet

## Recommended immediate improvements

### Backend

- Add `POST /scan-local`
- Add better file filtering and exclusion rules
- Improve regex coverage for more languages/frameworks
- Add severity scoring logic
- Add optional JSON report export
- Add proper exception classes and cleaner error responses

### Frontend

- Connect repo input form to `/scan`
- Show loading state during scan
- Render findings in cards or a table
- Group findings by severity and OWASP category
- Add empty state and error state screens

### DevOps and repo hygiene

- Remove `node_modules` from Git tracking
- Ensure `.gitignore` covers Python and Node artifacts
- Rename `requirements.txt4` to `requirements.txt` if still present
- Use feature branches instead of pushing active work directly to `main`

## Suggested `.gitignore`

```gitignore
# Python
venv/
__pycache__/
*.pyc
.env

# Node
node_modules/
dist/

# OS/editor
.DS_Store
.vscode/
.idea/
```

## Example response format

Each finding follows a structure like:

```json
{
  "file_path": "app/config.py",
  "line_number": 12,
  "issue_type": "hardcoded_secret",
  "severity": "High",
  "owasp_category": "A02:2021 - Cryptographic Failures",
  "description": "Possible hardcoded secret found in source code.",
  "suggestion": "Move the secret to environment variables or a secure secret manager."
}
```

## Collaboration workflow

Recommended team workflow:

1. Create a feature branch
2. Work locally
3. Commit changes with clear messages
4. Push branch to GitHub
5. Open a pull request
6. Merge into `main` only after review or testing

Example branch names:

- `backend-scan-api`
- `frontend-results-ui`
- `scanner-rule-improvements`

## Vision

BobGuard can evolve from a regex-based MVP into a more capable AI security review assistant with:

- smarter code understanding
- remediation generation
- dependency risk checks
- policy-based scanning
- developer-friendly reports
- CI/CD integration

