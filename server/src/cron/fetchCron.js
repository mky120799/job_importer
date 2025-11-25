const cron = require("node-cron");
const { fetchAllFeeds } = require("../services/fetchJobs");
const ImportLog = require("../models/ImportLog");
const { createLogger } = require("../utils/logger");

const logger = createLogger(process.env.LOG_LEVEL || "info");

function start() {
  const schedule = process.env.CRON_SCHEDULE || "0 * * * *"; // default every hour
  logger.info(`Scheduling fetch cron: ${schedule}`);

  cron.schedule(
    schedule,
    async () => {
      logger.info("Cron started - preparing to queue fetch job");
      // In this architecture, we'll queue a 'fetch-and-enqueue' job into BullMQ queue
      // However this file gets an access to the queue via a closure in server.js
    },
    { scheduled: false }
  );
}

/**
 * Because we need the queue instance created inside server.js, we provide a function that
 * starts the cron and adds logic to queue jobs.
 */
function start({ queue, jobSources = [], logger: extLogger }) {
  const schedule = process.env.CRON_SCHEDULE || "0 * * * *";
  const log = extLogger || logger;
  log.info(`Scheduling fetch cron: ${schedule}`);
  cron.schedule(
    schedule,
    async () => {
      log.info("Cron triggered: queuing a fetch job");
      try {
        await queue.add(
          "scheduled-fetch",
          { sources: jobSources },
          { removeOnComplete: true, removeOnFail: false }
        );
      } catch (err) {
        log.error("Failed to queue scheduled fetch", err);
      }
    },
    { scheduled: true }
  );
}

module.exports = { start };
