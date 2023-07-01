function normalize_ogcwkt(ogcwkt) {
  ogcwkt = ogcwkt.replace(`DATUM["D_`, `DATUM["`);

  // reduce precision of decimal numbers to 15 digits
  ogcwkt = ogcwkt.replace(/\.\d{16,}/g, n => n.substr(0, 16));

  // replace \d.0 with 0
  ogcwkt = ogcwkt.replace(/\d+\.0[,"'\]]/g, s => s.substring(0, s.indexOf(".")) + s.charAt(s.length - 1));

  return ogcwkt;
}

module.exports = normalize_ogcwkt;
module.exports.default = normalize_ogcwkt;
