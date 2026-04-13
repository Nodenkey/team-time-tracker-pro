from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, date
import uuid
from typing import List, Dict

from pydantic import BaseModel, field_validator


@dataclass
class TimeEntry:
    id: str
    userName: str
    date: str
    activityDescription: str
    hours: float
    createdAt: str
    updatedAt: str


class TimeEntryCreate(BaseModel):
    userName: str
    date: str
    activityDescription: str
    hours: float

    @field_validator("userName", "activityDescription")
    @classmethod
    def non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("must not be empty")
        return v

    @field_validator("hours")
    @classmethod
    def positive_hours(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("hours must be positive")
        return v


class TimeEntryUpdate(TimeEntryCreate):
    pass


_store: Dict[str, TimeEntry] = {}


def _seed_store() -> None:
    if _store:
        return
    now = datetime.utcnow().isoformat()
    samples = [
        TimeEntry(
            id=str(uuid.uuid4()),
            userName="Samuel Abbey",
            date=date(2026, 4, 13).isoformat(),
            activityDescription="Implemented initial FastAPI backend for Time Tracker PRO",
            hours=3.5,
            createdAt=now,
            updatedAt=now,
        ),
        TimeEntry(
            id=str(uuid.uuid4()),
            userName="Kofi Mensah",
            date=date(2026, 4, 13).isoformat(),
            activityDescription="Reviewed API contract and wrote documentation",
            hours=2.0,
            createdAt=now,
            updatedAt=now,
        ),
    ]
    for entry in samples:
        _store[entry.id] = entry


_seed_store()


def list_time_entries() -> List[dict]:
    return [asdict(entry) for entry in _store.values()]


def create_time_entry(data: TimeEntryCreate) -> dict:
    now = datetime.utcnow().isoformat()
    entry = TimeEntry(
        id=str(uuid.uuid4()),
        userName=data.userName,
        date=data.date,
        activityDescription=data.activityDescription,
        hours=data.hours,
        createdAt=now,
        updatedAt=now,
    )
    _store[entry.id] = entry
    return asdict(entry)


def update_time_entry(entry_id: str, data: TimeEntryUpdate) -> dict | None:
    if entry_id not in _store:
        return None
    existing = _store[entry_id]
    existing.userName = data.userName
    existing.date = data.date
    existing.activityDescription = data.activityDescription
    existing.hours = data.hours
    existing.updatedAt = datetime.utcnow().isoformat()
    return asdict(existing)


def delete_time_entry(entry_id: str) -> bool:
    if entry_id not in _store:
        return False
    del _store[entry_id]
    return True
