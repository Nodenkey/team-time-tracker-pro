from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app import store

app = FastAPI(title="Time Tracker PRO Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/time-entries")
def list_time_entries():
    return store.list_time_entries()


@app.post("/api/time-entries", status_code=201)
def create_time_entry(entry: store.TimeEntryCreate):
    return store.create_time_entry(entry)


@app.put("/api/time-entries/{entry_id}")
def update_time_entry(entry_id: str, entry: store.TimeEntryUpdate):
    updated = store.update_time_entry(entry_id, entry)
    if not updated:
        raise HTTPException(status_code=404, detail={"error": "not_found", "message": f"Time entry with id {entry_id} not found", "detail": None})
    return updated


@app.delete("/api/time-entries/{entry_id}", status_code=204)
def delete_time_entry(entry_id: str):
    deleted = store.delete_time_entry(entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail={"error": "not_found", "message": f"Time entry with id {entry_id} not found", "detail": None})
    return None
