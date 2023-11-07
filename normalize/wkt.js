const wktcrs = require("wkt-crs");

function sort_wkt(wkt) {
  const { data } = wktcrs.parse(wkt, { raw: true });
  wktcrs.sort(data);
  return wktcrs.unparse(data, { raw: true }).data;
}

function normalize_wkt(wkt, { debug = false } = { debug: false }) {
  wkt = wkt.trim();

  // replace new lines with spaces
  wkt = wkt.replace(/\n/g, " ");

  // replace tabs with spaces
  wkt = wkt.replace(/\t/g, " ");

  // remove any extra spaces
  wkt = wkt.replace(/ +/g, " ");

  // replace spaces with underscores
  wkt = wkt.replace(/ /g, "_");

  wkt = wkt.replace(`GEOGCS["GCS_`, `GEOGCS["`);

  wkt = wkt.replace(`DATUM["D_`, `DATUM["`);

  wkt = wkt.replace("Gauss_Kruger", "GK");

  // reduce precision of decimal numbers to 15 digits
  wkt = wkt.replace(/\.\d{16,}/g, n => n.substr(0, 16));

  // replace \d.0 with 0
  wkt = wkt.replace(/\d+\.0[,"'\]]/g, s => s.substring(0, s.indexOf(".")) + s.charAt(s.length - 1));

  // replace 1984 with 84
  // ex: replace WGS_1984_Antarctic_Polar_Stereographic with WGS_84_Antarctic_Polar_Stereographic
  //     which is what happened with https://epsg.io/3031.esriwkt
  wkt = wkt.replace(/[_|"]1984[_|"]/g, s => s.charAt(0) + "84" + s.charAt(s.length - 1));

  // happened in epsg.io/3031.esriwkt
  // wkt = wkt.replace(/false_easting/g, "False_Easting");
  // wkt = wkt.replace(/false_northing/g, "False_Northing");

  // lower case value strings
  wkt = wkt.replace(/"[A-Za-z_\d]+"/g, s => '"' + s.substring(1, s.length - 1).toLowerCase() + '"');

  // sort parameters
  wkt = sort_wkt(wkt);

  if (debug) console.log('[get-epsg-code] wkt after cleaning: "' + wkt + '"');
  return wkt;
}

module.exports = normalize_wkt;
module.exports.default = normalize_wkt;
