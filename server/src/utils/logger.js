const winston = require("winston");

function createLogger(level = "info") {
  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(
        (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
      )
    ),
    transports: [new winston.transports.Console()],
  });
}

module.exports = { createLogger };
