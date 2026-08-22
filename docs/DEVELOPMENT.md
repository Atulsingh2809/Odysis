# Development Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)
- npm 10+

## Quick Start (without Docker)

```bash
# Clone and install
git clone https://github.com/Atulsingh2809/Odysis.git
cd Odysis
npm install

# Configure environment
cp .env.example .env
# Edit DATABASE_URL and JWT secrets

# Database setup
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## Demo Credentials

```
Email: demo@globetrotter.local
Password: Demo@12345
```

## Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server |
| `npm run build` | Production build |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:reset` | Reset and reseed |

## Server Development

```bash
cd server
npm run dev        # tsx watch
npm run test       # vitest
npm run db:studio  # Prisma Studio
```

## Client Development

```bash
cd client
npm run dev        # Vite dev server
npm run test       # vitest
npm run build      # Production build
```

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- Layered backend architecture
- Feature-based frontend folders

## Forgot Password (Development)

In development mode, reset tokens are logged to the server console instead of being emailed.
