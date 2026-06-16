# Backend Setup (Phase 1)

Phase 1 adds repository cloning, indexing, and RAG chat over codebases.

## 1) Create a virtual environment

```bash
python -m venv venv
```

## 2) Activate the virtual environment

Windows:

```powershell
venv\Scripts\activate
```

Linux/Mac:

```bash
source venv/bin/activate
```

## 3) Install dependencies

```bash
pip install -r requirements.txt
```

## 4) Configure environment variables

Set `GEMINI_API_KEY` in `.env`:

```env
GEMINI_API_KEY=YOUR_KEY
```

## 5) Run the server

```bash
uvicorn app:app --reload
```

API base URL:

http://127.0.0.1:8000

## 6) Test the Phase 1 workflow

### Clone repository

`POST /repository/clone`

```json
{
  "repo_url": "https://github.com/user/project"
}
```

### Index repository

`POST /repository/index`

```json
{
  "repo_name": "project"
}
```

### Ask codebase question

`POST /chat`

```json
{
  "question": "How does authentication work?"
}
```
