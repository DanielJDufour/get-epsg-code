function normalize_esriwkt(esriwkt, { debug = false } = { debug: false }) {
  esriwkt = esriwkt.replace(`DATUM["D_`, `DATUM["`);

  // reduce precision of decimal numbers to 15 digits
  esriwkt = esriwkt.replace(/\.\d{16,}/g, n => n.substr(0, 16));

  // replace \d.0 with 0
  esriwkt = esriwkt.replace(/\d+\.0[,"'\]]/g, s => s.substring(0, s.indexOf(".")) + s.charAt(s.length - 1));

  if (debug) console.log('[get-epsg-code] esriwkt after cleaning: "' + esriwkt + '"');
  return esriwkt;
}

module.exports = normalize_esriwkt;
module.exports.default = normalize_esriwkt;
