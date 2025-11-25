# Job Importer - Backend

## Overview
Backend for the Scalable Job Importer: fetches XML/ RSS job feeds, converts to JSON, and imports into MongoDB using a BullMQ Redis-backed queue. Import history logs are saved in `import_logs`.

## Tech
- Node.js + Express
- MongoDB (Mongoose)
- Redis (BullMQ)
- xml2js, axios
- node-cron for scheduling

## Setup (local)
1. Clone repository and `cd server`
2. Create an environment file and fill values:
   - If a `.env.example` is present, copy it: `cp .env.example .env` (or on Windows PowerShell: `copy .env.example .env`).
   - If not, create a file named `.env` at the project root with the variables shown below.
3. Install dependencies:
   - `npm install`
4. Start infrastructure (Redis + MongoDB):
   - Option A — Docker Compose (recommended for local dev):

     ```bash
     docker-compose up -d
     ```

   - Option B — Start services locally / use cloud URIs for `MONGODB_URI` and `REDIS_HOST`.
5. Start the server and worker processes (two terminals):
   - Start server (dev mode with auto-reload):

     ```bash
     npm run dev
     ```

   - Start worker (processes queue jobs):

     ```bash
     npm run worker
     ```

   - Or run production server:

     ```bash
     npm start
     ```

## API
- `GET /health` — health check
- `POST /api/trigger-import` — manually queue an import (body `{ "sources": ["https://..."] }`)
- `GET /api/import-logs` — list import logs (pagination: `?page=0&limit=20`)

### Example curl requests

- Health check:

```bash
curl http://localhost:4000/health
```

- Trigger an import with custom sources:

```bash
curl -X POST http://localhost:4000/api/trigger-import \
   -H "Content-Type: application/json" \
   -d '{"sources":["https://www.w3schools.com/xml/note.xml","https://www.w3schools.com/xml/cd_catalog.xml"]}'
```

- Fetch import logs (page 0, limit 20):

```bash
curl "http://localhost:4000/api/import-logs?page=0&limit=20"
```

## Notes & Assumptions
- Upsert logic tries `url`, then `externalId`, fallback `title+company`.
- Cron queueing logic enqueues a `scheduled-fetch` job every hour by default. Workers process fetch -> upsert and create import logs.
- Errors in processing an item don't stop the run — they are captured in `failedJobs` in the log.

## Bonus ideas implemented
- Concurrency (via `WORKER_CONCURRENCY`)
- Batch size (via `BATCH_SIZE`)
- Import logs stored per-source with reasons for failures.

**Testing with VS Code REST Client**

The project includes a `request.http` file with ready-to-run examples. Install the `REST Client` extension in VS Code, open `request.http`, and click `Send Request` above any request to run it.

**Environment Variables**

Create a `.env` file in the project root and set the following variables (example values shown):

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/job_importer
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
QUEUE_NAME=jobQueue
WORKER_CONCURRENCY=5
BATCH_SIZE=50
LOG_LEVEL=info
```

- `MONGODB_URI`: MongoDB connection string used by Mongoose.
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Redis connection used by BullMQ.
- `QUEUE_NAME`: BullMQ queue name (default `jobQueue`).
- `WORKER_CONCURRENCY`: number of parallel jobs the worker should process.
- `BATCH_SIZE`: maximum items processed per batch.
- `LOG_LEVEL`: logging level for `winston`/logger.

**Docker Compose**

This repository includes a `docker-compose.yml` that will bring up Redis, MongoDB, the API server (`app`) and the background `worker` service. The `app` service runs the HTTP server; the `worker` runs queue processors (`npm run worker`). Both services read environment variables from the project `.env` file.

Recommended commands:

- Build and start everything (app + worker + infra):

```bash
docker-compose up --build -d
```

- View logs for the API server:

```bash
docker-compose logs -f app
```

- View logs for the worker:

```bash
docker-compose logs -f worker
```

- Stop and remove containers (volumes preserved):

```bash
docker-compose down
```

- Stop, remove containers and volumes (data reset):

```bash
docker-compose down -v
```

Notes:

- `docker-compose up` will create two named volumes `redis-data` and `mongo-data` mapped to `./redis-data` and `./mongo-data` for local persistence.
- The `app` and `worker` services use the project `Dockerfile` to build the image. To run only the API server without the worker, use `docker-compose up --build -d app`.

**Troubleshooting**

- If `npm run dev` fails with connection errors, confirm MongoDB and Redis are reachable using the URIs in `.env`.
- Worker and server are separate processes — ensure both are running for scheduled imports to process.
- For debugging, set `LOG_LEVEL=debug`.

**Next steps**

- Start the server and the worker in separate terminals. Use `request.http` or the curl examples above to trigger imports and verify `import_logs` are created in MongoDB.
- If you'd like, I can start the server locally (if you want me to run commands here) or run a quick smoke test against the endpoints.