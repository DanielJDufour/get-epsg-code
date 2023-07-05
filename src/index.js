const b64ab = require("b64ab");
const findTagByPath = require("xml-utils/find-tag-by-path");
const findTagByName = require("xml-utils/find-tag-by-name");
const getAttribute = require("xml-utils/get-attribute");
const parseWKT = require("wkt-parser");
const utmUtils_getCodeFromEsriWKT = require("utm-utils/src/getCodeFromEsriWKT.js");
const utmUtils_getCodeFromProjString = require("utm-utils/src/getCodeFromProjString.js");

const hash = require("./hash.js");
const normalize_esriwkt = require("./normalize/esriwkt.js");
const normalize_proj4 = require("./normalize/proj4.js");

const getProjType = require("./get-proj-type.js");
const parseProj4JS = require("./parse/proj4js.js");
const { FORMATS } = require("./enums.js");

const data = require(REPLACE_ME);

const getDefault = fn => fn.default || fn;

const rows = [];

function _load_rows(debug) {
  const decoded = b64ab.toArrayBuffer(data.data);
  const arr = new Int32Array(decoded);
  if (debug) console.log("arr:", arr);

  const num_fields = data.properties.columns.length;
  const num_rows = arr.length / num_fields;

  for (let r = 0; r < num_rows; r++) {
    const row = {};
    for (let f = 0; f < num_fields; f++) {
      row[data.properties.columns[f]] = arr[r * num_fields + f];
    }
    rows.push(row);
  }
  if (debug) console.log("[get-epsg-code] rows:", rows);

  return rows;
}

function lookup(input, dataType, debug = false) {
  if (!data.properties.columns.includes(dataType)) {
    throw new Error("[get-epsg-code] " + dataType + " not supported");
  }

  if (rows.length === 0) {
    _load_rows(debug);
  }

  const hashed = hash(input);
  if (debug) console.log("[get-epsg-code] hashed:", hashed);

  const found = rows.filter(row => row[dataType] === hashed);
  if (debug) console.log("[get-epsg-code] found:", found);

  return found.map(row => row.epsg_code);
}

const { ESRI_WKT, GEOSERVER, MAPFILE, MAPNIK, OGC_GML, OGC_XML, OGC_WKT, POSTGIS, PROJJSON, PROJ_4, PROJ_4_JS, WKT_2 } = FORMATS;

function getEPSGCodes(input, options) {
  //console.log("starting get-epsg-code with", input, options);
  var debug = options && options.debug ? options.debug : false;

  if (typeof input === "string") input = input.trim();

  const dataType = getProjType(input, { debug });
  if (debug) console.log("dataType:", dataType);

  if (dataType === OGC_WKT) {
    const parsed = getDefault(parseWKT)(input);
    if (debug) console.log("parsed:", parsed);
    if (parsed.AUTHORITY) {
      const authority = parsed.AUTHORITY;
      return {
        type: dataType,
        codes: [Number(authority.epsg || authority.EPSG)]
      };
    }
  } else if (dataType === WKT_2) {
    const parsed = getDefault(parseWKT)(input);
    if (debug) console.log("parsed:", parsed);
    if (typeof parsed.ID === "object" && typeof parsed.ID.EPSG === "number") {
      return {
        type: dataType,
        codes: [parsed.ID.EPSG]
      };
    }
  } else if (dataType == ESRI_WKT) {
    // try utm parsing
    const code = utmUtils_getCodeFromEsriWKT(input);
    if (code) return { type: dataType, codes: [code] };

    input = normalize_esriwkt(input, { debug });
    return { type: dataType, codes: lookup(input, ESRI_WKT, debug) };
  } else if (dataType === OGC_GML) {
    const identifier = getDefault(findTagByName)(input, "gml:identifier", {
      debug
    }).inner;
    return {
      type: dataType,
      codes: [Number(identifier.replace("urn:ogc:def:crs:EPSG::", ""))]
    };
  } else if (dataType === OGC_XML) {
    return {
      type: dataType,
      codes: [Number(getDefault(findTagByPath)(input, ["gml:srsID", "gml:name"], { debug }).inner)]
    };
  } else if (dataType === PROJ_4) {
    input = normalize_proj4(input, { debug });

    if (input.startsWith("+") && input.includes("+proj=utm")) {
      return { type: dataType, codes: [utmUtils_getCodeFromProjString(input)] };
    } else {
      return { type: dataType, codes: lookup(input, PROJ_4, debug) };
    }
  } else if (dataType === PROJ_4_JS) {
    const code = parseProj4JS(input);
    return {
      type: dataType,
      codes: code ? [code] : []
    };
  } else if (dataType === GEOSERVER) {
    return { type: dataType, codes: [Number(input.match(/^\d{1,6}/)[0])] };
  } else if (dataType === MAPFILE) {
    if (input.includes("init=epsg:")) {
      return {
        type: dataType,
        codes: [Number.parseInt(/("init\=epsg:)(\d{1,10})(")/.exec(input)[2])]
      };
    } else if (input.includes('"proj=utm"')) {
      const zone = /("zone\=)(\d{1,2})(")/.exec(input)[2];
      const south = input.includes('"south"');
      if (input.includes("ellps=GRS80") && south === false) {
        return { type: dataType, codes: [Number.parseInt("269" + zone)] };
      } else {
        const hemisphere = south ? "7" : "6";
        return {
          type: dataType,
          codes: [Number.parseInt("32" + hemisphere + zone)]
        };
      }
    } else {
      return { type: dataType, codes: lookup(input, MAPFILE, debug) };
    }
  } else if (dataType === MAPNIK) {
    const map = findTagByName(input, "Map");
    const srs = getAttribute(map.outer, "srs"); // Proj.4 String
    return { type: dataType, codes: getEPSGCodes(srs).codes };
  } else if (dataType === POSTGIS) {
    return {
      type: dataType,
      codes: [Number(input.substring(input.indexOf("values (") + 8, input.indexOf("EPSG") - 3).trim())]
    };
  } else if (dataType === PROJJSON) {
    const data = JSON.parse(input);
    if (typeof data.id === "object") {
      if (data.id.authority === "EPSG" || !("authority" in data.id)) {
        if (typeof data.id.code === "number") {
          return {
            type: dataType,
            codes: [data.id.code]
          };
        }
      }
    }
  }
}

function getEPSGCode(input, options) {
  const result = getEPSGCodes(input, options);
  if (result) return result.codes[0];
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = getEPSGCode;
  module.exports.getEPSGCode = getEPSGCode;
  module.exports.getEPSGCodes = getEPSGCodes;
  module.exports._load_rows = _load_rows;
}
if (typeof window !== "undefined") {
  window["getEPSGCode"] = getEPSGCode;
  window["getEPSGCodes"] = getEPSGCodes;
} else if (typeof self !== "undefined") {
  self["getEPSGCode"] = getEPSGCode; // jshint ignore:line
  self["getEPSGCodes"] = getEPSGCodes; // jshint ignore:line
}
