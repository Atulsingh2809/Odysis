# Deployment Guide

## Docker Compose (Recommended)

```bash
docker compose up --build
```

Services:
- `postgres` — PostgreSQL 15 on port 5432
- `server` — API on port 3001
- `client` — Nginx serving SPA on port 80

## Environment Variables (Production)

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Access token secret (32+ chars) |
| JWT_REFRESH_SECRET | Yes | Refresh token secret |
| CLIENT_URL | Yes | Frontend origin for CORS |
| NODE_ENV | Yes | `production` |
| SERVER_PORT | No | Default 3001 |

## Production Build

```bash
npm run build
```

## Database Migrations

```bash
npm run db:migrate
npm run db:seed
```

## Health Check

```
GET /api/health
```

Returns `{ "status": "ok" }`.

## Security Checklist

- [ ] Set strong JWT secrets
- [ ] Configure CORS to production domain
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure email service for password reset
- [ ] Review rate limits

## Platform Options

- **Railway / Render**: Deploy server + managed PostgreSQL
- **Vercel / Netlify**: Deploy client static build
- **AWS**: ECS + RDS + CloudFront
- **Fly.io**: Full stack with Docker
