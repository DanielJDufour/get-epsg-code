const normalize_esriwkt = require("./esriwkt.js");
const normalize_ogcwkt = require("./ogcwkt.js");
const normalize_proj4 = require("./proj4.js");

// mutates rows
function normalize_rows(rows) {
  rows.forEach(row => {
    if ("esriwkt" in row) row.esriwkt = normalize_esriwkt(row.esriwkt);
    if ("proj4" in row) row.proj4 = normalize_proj4(row.proj4);
    if ("wkt" in row) row.wkt = normalize_ogcwkt(row.wkt);
  });
}

module.exports = normalize_rows;
module.exports.default = normalize_rows;
