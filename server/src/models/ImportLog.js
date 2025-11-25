const mongoose = require("mongoose");

const ImportLogSchema = new mongoose.Schema(
  {
    source: String, // URL or fileName
    timestamp: { type: Date, default: Date.now },
    totalFetched: Number,
    totalImported: Number,
    newJobs: Number,
    updatedJobs: Number,
    failedJobs: [
      {
        item: mongoose.Schema.Types.Mixed,
        reason: String,
      },
    ],
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImportLog", ImportLogSchema);
