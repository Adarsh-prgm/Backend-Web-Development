# Database Integration

This API keeps the repository boundary as the storage interface. The post repository uses PostgreSQL through Prisma; services and controllers continue to use the same asynchronous repository methods and response shapes.

## Prerequisites

- Node.js
- PostgreSQL, with a database created for this project

## First-time setup

Run these commands from this directory:

```bash
npm install
cp .env.example .env
```

Edit `.env` with your local PostgreSQL connection details. Never commit `.env`; the committed `.env.example` contains placeholders only.

Apply the committed migration, generate the Prisma Client, and seed the sample data:

```bash
npm run db:migrate
npm run prisma:generate
npm run db:seed
npm start
```

The seed is repeatable: it upserts the sample author and only creates a sample post if that author does not already have a post with the same title. It does not delete or reset existing data.

For a deployment environment, apply already-committed migrations with `npm run db:deploy`. Check migration status with `npm run db:status`.

## API

- `GET /posts` — list posts
- `GET /posts/:id` — read one post
- `POST /posts` — create a post
- `PATCH /posts/:id` — update a post
- `DELETE /posts/:id` — remove a post

The API keeps the existing response envelopes, status codes, validation behavior, and not-found responses. Database constraint failures are translated into safe conflict messages; unexpected database failures return a generic message rather than raw database details.
