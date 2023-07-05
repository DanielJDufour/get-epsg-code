const isWKT = require("is-wkt");
const wktcrs = require("wkt-crs");

const { FORMATS } = require("./enums.js");

const { ESRI_WKT, GEOSERVER, MAPFILE, MAPNIK, OGC_GML, OGC_XML, OGC_WKT, POSTGIS, PROJ_4, PROJ_4_JS, PROJJSON, WKT_2 } = FORMATS;

function getProjType(input, { debug = false } = { debug: false }) {
  // check WKT
  if (input.startsWith("{") && input.includes("projjson")) {
    return PROJJSON;
  } else if (isWKT(input)) {
    const parsed = wktcrs.parse(input.toUpperCase()).data;
    if ("AUTHORITY" in (parsed.PROJCS || parsed.PROJCRS || parsed.GEOGCS || parsed.GEOGCRS)) {
      return OGC_WKT;
    } else if ("ID" in parsed) {
      return WKT_2;
    } else {
      // appears to be ESRI WKT
      return ESRI_WKT;
    }
  } else if (input.includes("gml:ProjectedCRS") || input.includes("gml:GeodeticCRS") || input.includes("gml:GeographicCRS")) {
    if (input.includes("gml:srsID")) {
      return OGC_XML;
    } else {
      return OGC_GML;
    }
  } else if (input.startsWith("+") && input.includes("+proj=")) {
    return PROJ_4;
  } else if (input.startsWith(`proj4.defs(`)) {
    return PROJ_4_JS;
  } else if (/^\d{1,6}\=(PROJCS|GEOGCS)/.test(input)) {
    return GEOSERVER;
  } else if (input.startsWith("PROJECTION") && input.endsWith("END")) {
    return MAPFILE;
  } else if (input.endsWith("</Map>")) {
    return MAPNIK;
  } else if (input.startsWith("INSERT")) {
    return POSTGIS;
  } else {
    if (debug) console.log('get-proj-type could not identify "' + input + '"');
    return "SOMETHING ELSE";
  }
}

module.exports = getProjType;
module.exports.default = getProjType;
