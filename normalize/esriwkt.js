const normalize_wkt = require("./wkt.js");

function normalize_esriwkt(esriwkt, { debug = false } = { debug: false }) {
  return normalize_wkt(esriwkt, { debug });
}

module.exports = normalize_esriwkt;
module.exports.default = normalize_esriwkt;
