const { parseStringPromise } = require("xml2js");

async function xmlToJson(xml) {
  // xml2js parse
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    trim: true,
  });
  return parsed;
}

module.exports = { xmlToJson };
