# Database Schema

## Entity Relationship

```
User ──┬── Profile
       ├── Trips ──┬── TripStops ──┬── City
       │           │               └── StopActivities ── Activity
       │           ├── Expenses
       │           ├── Budget
       │           └── TripCollaborators
       ├── SavedDestinations ── City
       ├── RefreshTokens
       └── PasswordResetTokens
```

## Tables

### User
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| email | String | Unique |
| passwordHash | String | Argon2 |
| name | String | |
| role | Enum | USER, ADMIN |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Profile
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userId | UUID | FK → User, unique |
| avatarUrl | String? | |
| language | String | Default: en |
| currency | Enum | INR, USD, EUR, GBP, JPY, AED |

### Trip
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userId | UUID | FK → User (owner) |
| name | String | |
| description | String? | |
| startDate | DateTime | |
| endDate | DateTime | |
| coverImageUrl | String? | |
| status | Enum | DRAFT, PLANNED, ACTIVE, COMPLETED |
| currency | Enum | |
| shareToken | String? | Unique, nullable |
| isPublic | Boolean | Default false |

### TripStop
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tripId | UUID | FK → Trip |
| cityId | UUID | FK → City |
| orderIndex | Int | |
| arrivalDate | DateTime? | |
| departureDate | DateTime? | |
| arrivalTime | String? | |
| departureTime | String? | |
| notes | String? | |

### City
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | String | Indexed |
| country | String | Indexed |
| region | String | |
| description | String | |
| imageUrl | String | |
| costIndex | Int | 1-5 |
| popularity | Int | 0-100 |
| latitude | Float? | |
| longitude | Float? | |

### Activity
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| cityId | UUID | FK → City |
| name | String | Indexed |
| description | String | |
| category | Enum | Sightseeing, Food, etc. |
| estimatedCost | Decimal | |
| currency | Enum | |
| durationMinutes | Int | |
| imageUrl | String | |
| rating | Float | |
| popularity | Int | |

### StopActivity
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| stopId | UUID | FK → TripStop |
| activityId | UUID | FK → Activity |
| orderIndex | Int | |
| scheduledTime | String? | HH:mm |
| scheduledDate | DateTime? | |
| notes | String? | |

### Expense
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tripId | UUID | FK → Trip |
| category | Enum | Transport, Accommodation, etc. |
| amount | Decimal | |
| currency | Enum | |
| description | String? | |
| date | DateTime | |

### Budget
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tripId | UUID | FK → Trip, unique |
| totalAmount | Decimal | |
| currency | Enum | |

### TripCollaborator
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tripId | UUID | FK → Trip |
| userId | UUID | FK → User |
| role | Enum | OWNER, EDITOR, VIEWER |
| Unique | (tripId, userId) | |

## Cascade Rules

- Delete User → cascade Profile, RefreshTokens, PasswordResetTokens, SavedDestinations
- Delete Trip → cascade Stops, Expenses, Budget, Collaborators
- Delete TripStop → cascade StopActivities
- Delete City → restrict if referenced (seed data protected)

## Indexes

- User.email (unique)
- Trip.userId, Trip.shareToken (unique)
- TripStop.(tripId, orderIndex)
- City.(name, country)
- Activity.(cityId, category, name)
- StopActivity.(stopId, orderIndex)
