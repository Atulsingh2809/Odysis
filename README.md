# GlobeTrotter

Personalized travel planning for multi-city trips. Create itineraries, discover cities and activities, estimate budgets, collaborate, and share plans with a public link.

## Features

- Email/password authentication with JWT access + refresh tokens
- Dashboard with upcoming trips, recommendations, and budget highlights
- Trip CRUD, duplicate, search, sort, and status filters
- Multi-city itinerary builder with persisted drag-and-drop ordering
- City and activity discovery with server-side search, filters, and pagination
- Automatic budget calculation, category charts, and over-budget alerts
- Calendar/timeline generated from trip dates
- Public share URLs and Copy Trip
- Collaborators (OWNER / EDITOR / VIEWER) with server-side authorization
- Saved destinations, profile, and settings
- Admin analytics dashboard
- Docker Compose for Postgres, API, and SPA

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod, Recharts |
| Backend | Node.js, Express, TypeScript, Prisma, Zod, JWT, Argon2 |
| Database | PostgreSQL 15 |
| Tests | Vitest, Testing Library |
| Deploy | Docker Compose, Nginx |

## Architecture

React SPA talks to a layered Express REST API (`routes → controllers → services → Prisma`). PostgreSQL stores users, trips, stops, activities, budgets, expenses, collaborators, and share tokens. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Screenshots

Place product screenshots in `docs/screenshots/`:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/itinerary.png`
- `docs/screenshots/budget.png`
- `docs/screenshots/share.png`

## Local Setup

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (or Docker for the database only)

```bash
git clone https://github.com/Atulsingh2809/Odysis.git
cd Odysis
npm install
cp .env.example .env
```

Edit `.env` if your Postgres credentials differ from the defaults.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Prisma PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret (reserved for future HMAC) |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default `7d`) |
| `CLIENT_URL` | Frontend origin for CORS |
| `SERVER_PORT` | API port (default `3001`) |
| `NODE_ENV` | `development` or `production` |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Auth rate-limit window |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts per window |

Never commit a real `.env` file.

## Database Setup

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Seed creates 32 cities, activities per city, a demo Europe trip, and two accounts:

```text
Demo:  demo@globetrotter.local / Demo@12345
Admin: admin@globetrotter.local / Admin@12345
```

These credentials are for local/demo use only.

Forgot-password in development returns `devToken` in the API response and logs a reset URL. Production should send the token by email.

## Running the App

Development (API `:3001`, Vite `:5173` with `/api` proxy):

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Then start the API with `npm run start -w server` and serve `client/dist`.

## Testing

```bash
npm run test
npm run lint
```

## Docker

```bash
docker compose up --build
```

- App: http://localhost
- API: http://localhost:3001
- Docs: http://localhost:3001/api/docs

Docker is not required for local development.

## API

Interactive OpenAPI UI: http://localhost:3001/api/docs

Full reference: [docs/API.md](docs/API.md)

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## License

MIT
