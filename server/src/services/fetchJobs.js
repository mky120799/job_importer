const axios = require("axios");
const { xmlToJson } = require("../utils/xmlToJson");
const { default: PQueue } = require("p-queue"); // small queue for concurrent fetches
const { createLogger } = require("../utils/logger");

const logger = createLogger(process.env.LOG_LEVEL || "info");

async function fetchFeed(url) {
  try {
    const resp = await axios.get(url, { responseType: "text", timeout: 20000 });
    const xml = resp.data;
    const json = await xmlToJson(xml);
    return { success: true, data: json };
  } catch (err) {
    logger.error(`Fetch error for ${url} - ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Extracts list of job items given parsed RSS/XML response.
 * This function attempts to be tolerant to different feed shapes.
 */
function extractJobItems(parsed, sourceUrl) {
  // common feed shapes: rss.channel.item, feed.entry (atom)
  const items = [];
  try {
    if (!parsed) return items;
    // rss
    if (parsed.rss && parsed.rss.channel) {
      let channel = parsed.rss.channel;
      const rawItems = channel.item || [];
      const arr = Array.isArray(rawItems)
        ? rawItems
        : [rawItems].filter(Boolean);
      arr.forEach((i) => items.push(mapItemToJob(i, sourceUrl)));
    } else if (parsed.feed && parsed.feed.entry) {
      const rawItems = parsed.feed.entry;
      const arr = Array.isArray(rawItems)
        ? rawItems
        : [rawItems].filter(Boolean);
      arr.forEach((i) => items.push(mapEntryToJob(i, sourceUrl)));
    } else {
      // try to search for 'item' anywhere
      const findItems = parsed?.channel?.item || parsed?.item;
      if (findItems) {
        const arr = Array.isArray(findItems)
          ? findItems
          : [findItems].filter(Boolean);
        arr.forEach((i) => items.push(mapItemToJob(i, sourceUrl)));
      }
    }
  } catch (err) {
    // ignore, return whatever we collected
  }
  return items;
}

function mapItemToJob(item, source) {
  const title = item.title && (item.title._ || item.title);
  const description = item.description || item.summary || "";
  const link =
    item.link &&
    (typeof item.link === "string" ? item.link : item.link._ || item.link.href);
  const company = (
    item.company ||
    item["dc:creator"] ||
    item["author"] ||
    ""
  ).toString();
  const location = item.location || item["job:location"] || "";
  const id = item.guid && (item.guid._ || item.guid);

  return {
    externalId: id && String(id),
    title: title && String(title),
    company: company && String(company),
    location: location && String(location),
    description: description && String(description),
    url: link && String(link),
    raw: item,
    source,
  };
}

function mapEntryToJob(entry, source) {
  const title = entry.title && (entry.title._ || entry.title);
  const content = entry.content || entry.summary || "";
  const link = Array.isArray(entry.link)
    ? entry.link.find((l) => l.rel === "alternate")?.href || entry.link[0]?.href
    : entry.link?.href || entry.link;
  const id = entry.id || entry.guid;
  return {
    externalId: id && String(id),
    title: title && String(title),
    company: (entry.author && (entry.author.name || entry.author)) || "",
    location: entry.location || "",
    description: content && String(content),
    url: link && String(link),
    raw: entry,
    source,
  };
}

/**
 * Given a list of source URLs, fetch them concurrently (limit concurrency)
 * and return a merged list of items with a per-source summary.
 */
async function fetchAllFeeds(sources = [], options = {}) {
  const concurrency = options.concurrency || 3;
  const queue = new PQueue({ concurrency });
  const results = [];

  await Promise.all(
    sources.map((src) =>
      queue.add(async () => {
        const res = await fetchFeed(src);
        if (!res.success) {
          results.push({
            source: src,
            success: false,
            error: res.error,
            items: [],
          });
        } else {
          const items = extractJobItems(res.data, src);
          results.push({ source: src, success: true, items, raw: res.data });
        }
      })
    )
  );

  return results;
}

module.exports = { fetchAllFeeds, fetchFeed, extractJobItems };
