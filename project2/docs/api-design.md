# QuickNotes API Design

The QuickNotes API is a RESTful HTTP API that allows authenticated users to create, read, update, delete and organise notes.

## Endpoints

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/notes` | List the authenticated user's notes | 200 OK |
| GET | `/notes/{id}` | Get one note by ID | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PATCH | `/notes/{id}` | Update part of an existing note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | List available tags | 200 OK |
| POST | `/notes/{id}/tags` | Add a tag to a note | 201 Created |

## Create a Note

### Request

```http
POST /notes
Content-Type: application/json
Authorization: Bearer <token>
````

```json
{
  "title": "Study plan",
  "body": "Review SQL joins tonight."
}
```

### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "id": 42,
  "userId": 7,
  "title": "Study plan",
  "body": "Review SQL joins tonight.",
  "createdAt": "2026-10-08T18:30:00Z",
  "updatedAt": "2026-10-08T18:30:00Z"
}
```

## List Notes

### Request

```http
GET /notes?limit=20&offset=0
Authorization: Bearer <token>
```

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "items": [
    {
      "id": 42,
      "userId": 7,
      "title": "Study plan",
      "body": "Review SQL joins tonight.",
      "createdAt": "2026-10-08T18:30:00Z",
      "updatedAt": "2026-10-08T18:30:00Z"
    },
    {
      "id": 41,
      "userId": 7,
      "title": "Shopping list",
      "body": "Milk, bread and fruit.",
      "createdAt": "2026-10-08T17:00:00Z",
      "updatedAt": "2026-10-08T17:00:00Z"
    }
  ],
  "limit": 20,
  "offset": 0,
  "total": 2
}
```

## Error Status Codes

### 400 Bad Request

The request contains invalid data.

Example:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Title is required and must be 100 characters or fewer."
}
```

### 401 Unauthorized

The user has not provided valid authentication credentials.

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication is required."
}
```

### 403 Forbidden

The user is authenticated but does not have permission to access the resource.

```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to access this note."
}
```

### 404 Not Found

The requested resource does not exist.

```json
{
  "error": "NOT_FOUND",
  "message": "Note not found."
}
```

### 500 Internal Server Error

An unexpected server-side error occurred.

```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred."
}
```

## API Design Principles

The API uses resource-oriented URLs, standard HTTP methods and status codes, JSON request and response bodies, authentication for protected resources, and consistent error responses.

```

