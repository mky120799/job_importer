# Job Importer - Frontend

## Overview

Frontend admin dashboard for the Scalable Job Importer. Built with Next.js 16, React 19, and Tailwind CSS 4. Provides a user-friendly interface to view import history, trigger manual imports, and monitor job import statistics.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

## Features

- 📊 **Import History Dashboard** - View paginated import logs with detailed statistics
- 🚀 **Manual Import Trigger** - Trigger job imports on-demand
- 📈 **Statistics Display** - See fetched, imported, new, updated, and failed job counts
- 🔄 **Pagination** - Navigate through import history with page controls
- 🎨 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Real-time Updates** - Fetch latest import data on page load

## Setup (Local Development)

1. **Navigate to the client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables (optional):**

   - Create a `.env.local` file in the `client` directory
   - Set the backend API URL if different from default:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:4000
     # or
     API_URL=http://localhost:4000
     # or
     BACKEND_URL=http://localhost:4000
     ```
   - If not set, defaults to `http://localhost:4000`

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
client/
├── app/
│   ├── api/                    # Next.js API routes (proxies to backend)
│   │   ├── import-history/     # GET /api/import-history
│   │   └── trigger-import/     # GET /api/trigger-import
│   ├── components/             # React components
│   │   ├── ImportCard.tsx      # Stat card component
│   │   ├── LogTable.tsx        # Import logs table
│   │   └── Pagination.tsx      # Pagination controls
│   ├── import-history/         # Import history page
│   │   └── page.tsx
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── lib/
│   └── getApiBaseUrl.ts        # API base URL helper
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Pages

### Home Page (`/`)

- Dashboard overview
- Link to import history
- Button to trigger manual import

### Import History (`/import-history`)

- Paginated table of import logs
- Shows source, fetched count, imported count, new jobs, updated jobs, failed jobs, and timestamp
- Pagination controls with page numbers
- Loading and error states

## API Routes

The frontend includes Next.js API routes that proxy requests to the backend:

### `GET /api/import-history`

Fetches paginated import logs from the backend.

**Query Parameters:**

- `page` (optional): Page number (default: 0)
- `limit` (optional): Items per page (default: 20)

**Response:**

```json
{
  "page": 0,
  "limit": 20,
  "total": 100,
  "data": [
    {
      "source": "https://example.com/feed.xml",
      "totalFetched": 50,
      "totalImported": 48,
      "newJobs": 30,
      "updatedJobs": 18,
      "failedJobs": [],
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### `GET /api/trigger-import`

Triggers a manual import job on the backend.

**Response:**

```json
{
  "message": "Import triggered",
  "jobId": "12345"
}
```

## Components

### LogTable

Displays import logs in a table format with:

- Sortable columns
- Color-coded statistics (green for new, blue for updated, red for failed)
- Empty state message
- Responsive design

**Props:**

```typescript
interface LogTableProps {
  logs: Log[];
}
```

### Pagination

Provides pagination controls with:

- Previous/Next buttons
- Page number buttons with ellipsis
- Item count display
- Responsive mobile/desktop layouts

**Props:**

```typescript
interface PaginationProps {
  currentPage: number;
  limit: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}
```

### ImportCard

Displays a statistic card (currently unused but available for future use).

## Configuration

### Next.js Configuration (`next.config.ts`)

- **API Rewrites**: Proxies `/api/*` requests to `http://localhost:4000/api/*` in development
- **Turbopack**: Enabled for faster development builds

### Tailwind CSS

- Configured with Tailwind CSS 4
- Custom theme variables in `globals.css`
- Dark mode support via CSS variables

## Environment Variables

Create a `.env.local` file in the `client` directory:

```env
# Backend API URL (optional, defaults to http://localhost:4000)
NEXT_PUBLIC_API_URL=http://localhost:4000
# Alternative variable names also supported:
# API_URL=http://localhost:4000
# BACKEND_URL=http://localhost:4000
```

**Note:** The `getApiBaseUrl()` helper checks these variables in order and falls back to `http://localhost:4000` if none are set.

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Prerequisites

- **Node.js** 18+ and npm
- **Backend server** running on `http://localhost:4000` (or configured URL)
- Backend should have MongoDB and Redis running (see backend README)

## Usage

1. **View Import History:**

   - Navigate to `/import-history`
   - Browse through paginated import logs
   - Use pagination controls to navigate between pages

2. **Trigger Manual Import:**

   - Click "Trigger Import Manually" on the home page
   - Or navigate directly to `/api/trigger-import`
   - The import will be queued and processed by the backend worker

3. **Monitor Statistics:**
   - View total fetched, imported, new, updated, and failed job counts
   - Check timestamps to see when imports were last run
   - Review failed jobs to identify issues

## Troubleshooting

### API Connection Issues

- Ensure the backend server is running on the configured port (default: 4000)
- Check that `NEXT_PUBLIC_API_URL` or other environment variables are set correctly
- Verify the backend API is accessible from the frontend

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Clear `.next` directory: `rm -rf .next` and rebuild
- Check TypeScript errors: `npx tsc --noEmit`

### Styling Issues

- Ensure Tailwind CSS is properly configured
- Check that `globals.css` is imported in `layout.tsx`
- Verify PostCSS configuration in `postcss.config.mjs`

### Pagination Not Working

- Check browser console for API errors
- Verify backend returns `total` count in response
- Ensure pagination state is properly managed

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Set the following environment variables in your deployment platform:

- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://api.example.com`)

### Recommended Platforms

- **Vercel** - Optimized for Next.js deployments
- **Netlify** - Supports Next.js with minimal configuration
- **Docker** - Containerize the application

## Next Steps

- Add real-time updates using WebSockets or polling
- Implement filtering and sorting for import logs
- Add export functionality for import history
- Create detailed view for individual import logs
- Add charts and graphs for import statistics
- Implement user authentication and authorization

## Notes

- The frontend uses Next.js API routes as proxies to the backend
- All API calls go through the Next.js server to avoid CORS issues
- The pagination component automatically hides when there's only one page
- Error states are displayed with user-friendly messages
- Loading states provide feedback during API calls








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