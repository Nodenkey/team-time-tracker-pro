# Time Tracker PRO

Time Tracker PRO is a simple internal tool for recording daily time entries and viewing a flat list of team activity.

## Stack

- **Backend**: FastAPI with in-memory store (see `backend/`)
- **Frontend**: Plain HTML/CSS/JavaScript (see `frontend/`)
- **Containerisation**: Docker + docker-compose

## Running locally (backend only)

1. Install Python 3.11 and `uv`.
2. From the `backend/` directory, install dependencies:

   ```bash
   cd backend
   uv sync --no-dev
   ```

3. Start the FastAPI app:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. Open the interactive API docs at:

   - http://localhost:8000/docs
   - Health check: http://localhost:8000/health

## Running locally with Docker Compose (backend + frontend)

1. Ensure Docker is installed and running.
2. From the repository root, run:

   ```bash
   docker-compose up --build
   ```

3. Services:

   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

The frontend container serves the static HTML/CSS/JS app from `frontend/` via nginx. It calls the backend at `http://backend:8000` inside Docker and `http://localhost:8000` from your browser.

## Using the app

1. Open the frontend in your browser:

   - http://localhost:3000

2. Add a new time entry by filling in:

   - Name
   - Date
   - Activity description
   - Hours spent

3. Submit the form to create an entry. The entry will appear in the flat list below the form.
4. Use the inline **Edit** and **Delete** controls on each row to update or remove entries.

## Backend API

The backend exposes REST endpoints under `/api/time-entries`.

Example create request:

```http
POST /api/time-entries
Content-Type: application/json

{
  "userName": "Jane Doe",
  "date": "2026-04-13",
  "activityDescription": "Pair programming on backend",
  "hours": 1.5
}
```

Example list request:

```http
GET /api/time-entries
```

See the FastAPI docs at `http://localhost:8000/docs` for the full schema and responses.

## Deployment (Railway)

This project is intended to be deployed to Railway using a monorepo setup:

- Backend service root: `backend/`
- Frontend service root: `frontend/`

The DevOps engineer will configure:

- Backend PORT = `8000`
- Frontend PORT = `3000`
- Frontend `API_BASE_URL` environment variable pointing to the backend public domain

Once deployed, the README can be updated with the live URLs for both services.
