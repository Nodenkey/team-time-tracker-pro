# Backend Manual Testing - Time Tracker PRO

Base URL (local): `http://localhost:8000`

## 1. Health Check
- [ ] `GET /health` returns `200` and `{ "status": "ok" }`.

## 2. List Time Entries
- [ ] `GET /api/time-entries` returns `200`.
- [ ] Response is a JSON array with seeded sample entries.

## 3. Create Time Entry
- [ ] `POST /api/time-entries` with body:
```json
{
  "userName": "Jane Doe",
  "date": "2026-04-13",
  "activityDescription": "Pair programming on backend",
  "hours": 1.5
}
```
- [ ] Returns `201` with created entry including `id`, `createdAt`, and `updatedAt`.

## 4. Update Time Entry
- [ ] Take an existing `id` from list/create.
- [ ] `PUT /api/time-entries/{id}` with body:
```json
{
  "userName": "Jane Doe",
  "date": "2026-04-13",
  "activityDescription": "Updated description",
  "hours": 2.0
}
```
- [ ] Returns `200` with updated fields and a newer `updatedAt`.
- [ ] `PUT` with non-existent `id` returns `404` and error payload.

## 5. Delete Time Entry
- [ ] `DELETE /api/time-entries/{id}` for an existing entry returns `204`.
- [ ] Subsequent `GET /api/time-entries` no longer shows that entry.
- [ ] `DELETE` with non-existent `id` returns `404` and error payload.

## 6. Validation / Error Cases
- [ ] `POST /api/time-entries` with missing `userName` or `activityDescription` returns `422`.
- [ ] `POST /api/time-entries` with `hours <= 0` returns `422`.
