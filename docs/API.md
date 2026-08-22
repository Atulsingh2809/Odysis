# API Specification

Base URL: `http://localhost:3001/api`

Interactive docs: `http://localhost:3001/api/docs`

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Human readable message",
  "code": "ERROR_CODE"
}
```

### Paginated
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/signup | No | Register user |
| POST | /auth/login | No | Login |
| POST | /auth/logout | Yes | Revoke refresh token |
| POST | /auth/refresh | No | Refresh access token |
| POST | /auth/forgot-password | No | Request reset token |
| POST | /auth/reset-password | No | Reset with token |
| GET | /auth/me | Yes | Current user |

## Trips

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /trips | Yes | List user trips |
| POST | /trips | Yes | Create trip |
| GET | /trips/:id | Yes | Get trip details |
| PUT | /trips/:id | Yes | Update trip |
| DELETE | /trips/:id | Yes | Delete trip |
| POST | /trips/:id/duplicate | Yes | Duplicate trip |

## Stops

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /trips/:tripId/stops | Yes | List stops |
| POST | /trips/:tripId/stops | Yes | Add stop |
| PUT | /stops/:id | Yes | Update stop |
| DELETE | /stops/:id | Yes | Delete stop |
| PUT | /trips/:tripId/stops/reorder | Yes | Reorder stops |

## Activities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /activities | Yes | Search activities |
| GET | /activities/:id | Yes | Activity detail |
| POST | /stops/:stopId/activities | Yes | Add to stop |
| DELETE | /stop-activities/:id | Yes | Remove from stop |
| PUT | /trips/:tripId/activities/reorder | Yes | Reorder activities |

## Cities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /cities | Yes | Search cities |
| GET | /cities/:id | Yes | City detail |

## Budget

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /trips/:id/budget | Yes | Budget summary |
| PUT | /trips/:id/budget | Yes | Set budget limit |
| GET | /trips/:id/expenses | Yes | List expenses |
| POST | /trips/:id/expenses | Yes | Add expense |
| PUT | /expenses/:id | Yes | Update expense |
| DELETE | /expenses/:id | Yes | Delete expense |

## Sharing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /trips/:id/share | Yes | Generate share link |
| DELETE | /trips/:id/share | Yes | Revoke sharing |
| GET | /shared/:token | No | Public itinerary |
| POST | /shared/:token/copy | Yes | Copy trip |

## Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /users/me | Yes | Get profile |
| PUT | /users/me | Yes | Update profile |
| DELETE | /users/me | Yes | Delete account |
| GET | /users/me/saved-destinations | Yes | Saved cities |
| POST | /users/me/saved-destinations | Yes | Save city |
| DELETE | /users/me/saved-destinations/:cityId | Yes | Unsave city |

## Collaborators

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /trips/:id/collaborators | Yes | List collaborators |
| POST | /trips/:id/collaborators | Yes | Invite user |
| PUT | /trips/:id/collaborators/:userId | Yes | Update role |
| DELETE | /trips/:id/collaborators/:userId | Yes | Remove |

## Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /admin/analytics | Admin | Platform analytics |

## Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /dashboard | Yes | Dashboard data |

## Recommendations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /recommendations | Yes | Recommended cities |
