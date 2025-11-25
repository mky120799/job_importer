const Job = require("../models/Job");

/**
 * Upsert a job object into DB.
 * Logic:
 *  - Try match by URL -> externalId -> title+company fallback
 */
async function upsertJob(jobData) {
  const { url, externalId, title, company } = jobData;
  const queryCandidates = [];

  if (url) queryCandidates.push({ url });
  if (externalId) queryCandidates.push({ externalId });
  if (title && company) queryCandidates.push({ title, company });

  let existing = null;
  for (const q of queryCandidates) {
    existing = await Job.findOne(q);
    if (existing) break;
  }

  if (!existing) {
    const created = await Job.create({ ...jobData, lastFetchedAt: new Date() });
    return { created: true, job: created };
  } else {
    // update fields
    existing.title = jobData.title || existing.title;
    existing.company = jobData.company || existing.company;
    existing.location = jobData.location || existing.location;
    existing.description = jobData.description || existing.description;
    existing.url = jobData.url || existing.url;
    existing.raw = jobData.raw || existing.raw;
    existing.source = jobData.source || existing.source;
    existing.lastFetchedAt = new Date();
    await existing.save();
    return { created: false, job: existing };
  }
}

module.exports = { upsertJob };
