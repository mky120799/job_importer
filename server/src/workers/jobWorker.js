require("dotenv").config();
const mongoose = require("mongoose");
const bullmq = require("bullmq");
const { Worker } = bullmq;
const QueueScheduler =
  typeof bullmq.QueueScheduler === "function" ? bullmq.QueueScheduler : null;
const Redis = require("ioredis");
const { fetchAllFeeds, extractJobItems } = require("../services/fetchJobs");
const { upsertJob } = require("../services/jobService");
const ImportLog = require("../models/ImportLog");
const { createLogger } = require("../utils/logger");

const logger = createLogger(process.env.LOG_LEVEL || "info");

const {
  MONGODB_URI,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  QUEUE_NAME,
  WORKER_CONCURRENCY = 5,
  BATCH_SIZE = 50,
} = process.env;

async function start() {
  await mongoose.connect(MONGODB_URI, {});
  const connection = new Redis({
    port: Number(REDIS_PORT || 6379),
    host: REDIS_HOST || "127.0.0.1",
    password: REDIS_PASSWORD || undefined,
    // BullMQ v5 requires disabling retries for blocking connections
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  // Queue scheduler ensures retries, delayed jobs behave. BullMQ v5+ handles
  // this internally, so QueueScheduler may no longer be available.
  let scheduler;
  if (QueueScheduler) {
    scheduler = new QueueScheduler(QUEUE_NAME || "jobQueue", { connection });
    await scheduler.waitUntilReady();
  } else {
    logger.warn(
      "QueueScheduler not found in current BullMQ version, relying on built-in scheduling."
    );
  }

  const worker = new Worker(
    QUEUE_NAME || "jobQueue",
    async (job) => {
      logger.info(`Processing job ${job.id} of type ${job.name}`);
      if (job.name === "scheduled-fetch" || job.name === "manual-import") {
        const sources = job.data.sources || [];
        const fetchResults = await fetchAllFeeds(sources, { concurrency: 3 });

        // For each source, enqueue individual job items as processing tasks OR process in batch
        const importLogs = [];

        for (const res of fetchResults) {
          const log = {
            source: res.source,
            timestamp: new Date(),
            totalFetched: res.items.length,
            totalImported: 0,
            newJobs: 0,
            updatedJobs: 0,
            failedJobs: [],
          };

          // process items in batches to avoid overloading DB
          const items = res.items || [];
          for (let i = 0; i < items.length; i += Number(BATCH_SIZE)) {
            const batch = items.slice(i, i + Number(BATCH_SIZE));
            for (const item of batch) {
              try {
                const result = await upsertJob(item);
                log.totalImported += 1;
                if (result.created) log.newJobs += 1;
                else log.updatedJobs += 1;
              } catch (err) {
                // log and continue - do not crash the worker
                logger.error("Upsert failed", err);
                log.failedJobs.push({
                  item: { title: item.title, url: item.url },
                  reason: err.message,
                });
              }
            }
          }

          // Save import summary per source
          await ImportLog.create(log);
          importLogs.push(log);
        }

        return { ok: true, importLogsCount: importLogs.length };
      }

      if (job.name === "process-single-job") {
        // optional: process a single job item
        const item = job.data.item;
        try {
          const result = await upsertJob(item);
          return { created: result.created };
        } catch (err) {
          throw err;
        }
      }

      return { ok: true };
    },
    {
      connection,
      concurrency: Number(WORKER_CONCURRENCY || 5),
    }
  );

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job.id} failed: ${err.message}`);
  });

  worker.on("completed", (job, result) => {
    logger.info(`Job ${job.id} completed. Result: ${JSON.stringify(result)}`);
  });

  logger.info("Worker started and listening for jobs");
}

start().catch((err) => {
  console.error("Worker startup error", err);
  process.exit(1);
});
