const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    externalId: { type: String, index: true }, // unique id from feed (if exists)
    title: String,
    company: String,
    location: String,
    description: String,
    url: String,
    raw: mongoose.Schema.Types.Mixed,
    source: String, // fileName / url
    lastFetchedAt: Date,
  },
  { timestamps: true }
);

JobSchema.index({ url: 1 }, { unique: false });

module.exports = mongoose.model("Job", JobSchema);
