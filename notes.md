# Checklist

<!-- Make sure you fill out this checklist with what you've done before submitting! -->

- [x] Read the README [please please please]
- [ ] Something cool!
- [x] Back-end
  - [x] Minimum Requirements
    - [x] Setup MongoDB database
    - [x] Setup item requests collection
    - [x] `PUT /api/request`
    - [x] `GET /api/request?page=_`
  - [x] Main Requirements
    - [x] `GET /api/request?status=pending`
    - [x] `PATCH /api/request`
  - [x] Above and Beyond
    - [x] Batch edits
    - [x] Batch deletes
- [ ] Front-end
  - [ ] Minimum Requirements
    - [ ] Dropdown component
    - [ ] Table component
    - [ ] Base page [table with data]
    - [ ] Table dropdown interactivity
  - [ ] Main Requirements
    - [ ] Pagination
    - [ ] Tabs
  - [ ] Above and Beyond
    - [ ] Batch edits
    - [ ] Batch deletes

# Notes

## Backend Implementation

### Database
- MongoDB Atlas database: `nonprofit-requests`
- Collection: `requests`
- Connection configured via `MONGODB_URI` environment variable

### API Endpoints

#### PUT /api/request
Creates a new item request.

**Request Body:**
```json
{
  "requestorName": "Jane Doe",
  "itemRequested": "Flashlights"
}
```

**Response:** 201 Created
- Sets `createdDate`, `lastEditedDate` to current date
- Sets `status` to `pending`

#### GET /api/request
Retrieves paginated item requests.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `status` (optional): Filter by status (pending/completed/approved/rejected)

**Response:** 200 OK
```json
{
  "data": [...],
  "totalPages": 1,
  "totalRecords": 5
}
```
- Sorted by `createdDate` descending

#### PATCH /api/request
Updates request status.

**Request Body:**
```json
{
  "id": "request_id",
  "status": "approved"
}
```

**Response:** 200 OK
- Updates `lastEditedDate` to current date

#### PATCH /api/request/batch
Batch updates multiple requests to the same status.

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"],
  "status": "approved"
}
```

**Response:** 200 OK
```json
{
  "updated": [...],
  "failed": []
}
```

#### DELETE /api/request/batch
Batch deletes multiple requests.

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

**Response:** 200 OK
```json
{
  "deleted": 2,
  "failed": []
}
```

### Validation
- Requestor name: 3-30 characters
- Item requested: 2-100 characters
- Status: pending, approved, completed, or rejected
- IDs: Valid MongoDB ObjectIds

### Error Codes
- 400: Invalid input
- 201: Created
- 200: Success
- 500: Internal server error
