const { Queue } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis({
  port: Number(process.env.REDIS_PORT || 6379),
  host: process.env.REDIS_HOST || "127.0.0.1",
  password: process.env.REDIS_PASSWORD || undefined,
});

const jobQueue = new Queue(process.env.QUEUE_NAME || "jobQueue", {
  connection,
});

module.exports = { jobQueue, connection };

