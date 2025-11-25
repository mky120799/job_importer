require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { Queue } = require("bullmq");
const Redis = require("ioredis");
const fetchCron = require("./cron/fetchCron");
const ImportLog = require("./models/ImportLog");
const { defaultJobSources } = require("./config/jobSources");
const { createLogger } = require("./utils/logger");

const app = express();
app.use(express.json());

const logger = createLogger(process.env.LOG_LEVEL || "info");

const { MONGODB_URI, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, QUEUE_NAME } =
  process.env;

async function start() {
  // MongoDB
  try{
  await mongoose.connect(MONGODB_URI, {});
  mongoose.connection.on('connected',()=>{
    console.log('mongodb is connected❤️‍🔥')
  })
  }catch(error){
      console.log(error)
  }

  // Redis connection for Queue
  const connection = new Redis({
    port: Number(REDIS_PORT || 6379),
    host: REDIS_HOST || "127.0.0.1",
    password: REDIS_PASSWORD || undefined,
  });

  // Expose a queue for manual triggers
  const queue = new Queue(QUEUE_NAME || "jobQueue", { connection });

  // Start cron job which uses the queue
  fetchCron.start({ queue, jobSources: defaultJobSources, logger });

  // Admin endpoints
  app.get("/health", (req, res) => res.json({ ok: true }));

  app.post("/api/trigger-import", async (req, res) => {
    const sources = req.body.sources || defaultJobSources;
    try {
      const job = await queue.add(
        "manual-import",
        { sources },
        { removeOnComplete: true, removeOnFail: false }
      );
      res.json({ status: "queued", jobId: job.id });
    } catch (err) {
      logger.error("Trigger failed", err);
      res.status(500).json({ error: "Failed to queue import" });
    }
  });

  // view import logs with pagination
  app.get("/api/import-logs", async (req, res) => {
    const page = Math.max(0, Number(req.query.page) || 0);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const [logs, total] = await Promise.all([
      ImportLog.find()
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .lean(),
      ImportLog.countDocuments(),
    ]);
    res.json({ page, limit, total, data: logs });
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    logger.info(`Server listening on ${port}`);
    logger.info("Worker should be started separately with npm run worker");
  });
}

start().catch((err) => {
  console.error("Startup error", err);
  process.exit(1);
});
