# Time Tracker PRO

Time Tracker PRO is a simple internal tool for recording daily time entries and viewing a flat list of team activity.

## Stack

- **Backend**: FastAPI with in-memory store (see `backend/`)
- **Frontend**: Plain HTML/CSS/JavaScript served by nginx (see `frontend/`)
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

The frontend container serves the static HTML/CSS/JS app from `frontend/` via nginx. Inside Docker, the frontend calls the backend at `http://backend:8000` using the `API_BASE_URL` environment variable. From your browser, the app uses `http://localhost:8000` by default.

## Using the app

1. Open the frontend in your browser:

   - http://localhost:3000

2. Add a new time entry by filling in:

   - **Name**
   - **Date**
   - **Activity description**
   - **Hours spent**

3. Click **Add Entry** to create an entry. On success, the form clears and the new entry appears in the flat list below the form.
4. To edit an entry, click **Edit** on its row. The form is populated with the existing values; update the fields and click **Update Entry**.
5. To cancel editing, click **Cancel edit**.
6. To delete an entry, click **Delete** and confirm the prompt.

Everyone sees the same flat list of all time entries from the backend in real time.

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
- Frontend `API_BASE_URL` environment variable pointing to the backend public domain (e.g. `https://time-tracker-backend.up.railway.app`)

Once deployed, this README can be updated with the live URLs for both services.
