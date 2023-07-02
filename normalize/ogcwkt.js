const normalize_wkt = require("./wkt.js");

function normalize_ogcwkt(ogcwkt, { debug = false } = { debug: false }) {
  return normalize_wkt(ogcwkt, { debug });
}

module.exports = normalize_ogcwkt;
module.exports.default = normalize_ogcwkt;
