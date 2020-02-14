const findTagByPath = require('xml-utils/src/find-tag-by-path');
const parseWKT = require('wkt-parser').default;
const {
  ARRAY_TYPE,
  BYTES_PER_VALUE,
  DATA_VIEW_READER_NAME
} = require('../globals.js');
const buffer = require('../crs.dat');
//console.log("buffer:", buffer);

//console.log("values:", new ARRAY_TYPE(buffer));
const view = new DataView(buffer);

const { hash } = require('../utils.js');
const {
  HASHED_FIELDS,
  NUM_FIELDS,
  NUM_HASHED_FIELDS
} = require('../globals.js');

const hash2code = {};

// from proj4js
const codeWords = ['PROJECTEDCRS', 'PROJCRS', 'GEOGCS','GEOCCS','PROJCS','LOCAL_CS', 'GEODCRS', 'GEODETICCRS', 'GEODETICDATUM', 'ENGCRS', 'ENGINEERINGCRS'];
function testWKT(input){

  // clean any blank spaces in beginning
  input = input.trim();

  if (input.startsWith('PROJCS[') || input.startsWith('GEOGCS[')) {
    return codeWords.some(word => input.includes(word));
  } else {
    return false;
  }
}

function getDataType(input) {
  // check WKT
  if (testWKT(input)) {
    if (input.includes("AUTHORITY")) {
      return "OGC WKT";
    } else {
      // appears to be ESRI WKT
      return "ESRI WKT";
    }
  } else if (input.includes("gml:ProjectedCRS") || input.includes("gml:GeodeticCRS") || input.includes("gml:GeographicCRS")) {
    if (input.includes("gml:srsID")) {
      return "XML";
    } else {
      return "GML";
    }
  } else if (input.startsWith("+proj=")) {
    return "Proj.4";
  } else if (input.startsWith(`proj4.defs("EPSG:`)) {
    return "proj4js";
  } else if (/^\d{1,6}\=(PROJCS|GEOGCS)/.test(input)) {
    return "GeoServer";
  } else if (input.startsWith("PROJECTION") && input.endsWith("END")) {
    return "MapServer";
  } else if (input.endsWith('</Map>')) {
    return "Mapnik";
  } else if (input.startsWith('INSERT')) {
    return "PostGIS";
  } else {
    return "SOMETHING ELSE";
  }
}

function lookup(input, dataType, debug) {
  if (debug) console.log("looking up " + dataType);

  const hashed = hash(input);
  if (debug) console.log("hashed:", hashed);

  const offset = HASHED_FIELDS.indexOf(dataType) + 1;
  if (debug) console.log("offset:", offset);

  for (let byteOffset = offset * BYTES_PER_VALUE; byteOffset < buffer.byteLength; byteOffset += NUM_FIELDS * BYTES_PER_VALUE) {
    const value = view[DATA_VIEW_READER_NAME](byteOffset, true);
    if (hashed === value) {
      return view[DATA_VIEW_READER_NAME](byteOffset - offset * BYTES_PER_VALUE, true);
    }
  }
}

function getEPSGCode(input, options) {
  //console.log("starting get-epsg-code with", input, options);
  var debug = options && options.debug ? options.debug : false;

  const dataType = getDataType(input);
  if (debug) console.log("dataType:", dataType);

  if (dataType === "OGC WKT") {
    const parsed = parseWKT(input);
    if (debug) console.log("parsed:", parsed);
    if (parsed.AUTHORITY) {
      const authority = parsed.AUTHORITY;
      return Number(authority.epsg || authority.EPSG);
    }
  } else if (dataType == "ESRI WKT") {
    return lookup(input, "esriwkt", true);
  } else if (dataType === "GML") {
    const identifier = findTagByPath(input, ["gml:identifier"], { debug }).inner;
    return Number(identifier.replace("urn:ogc:def:crs:EPSG::", ""));
  } else if (dataType === "XML") {
    return Number(findTagByPath(input, ["gml:srsID", "gml:name"], { debug }).inner);
  } else if (dataType === "Proj.4") {
    return lookup(input, "proj4");
  } else if (dataType === "proj4js") {
    return Number(input.substring(17, input.indexOf(`"`, 17)));
  } else if (dataType === "GeoServer") {
    return Number(input.match(/^\d{1,6}/)[0]);
  } else if (dataType === "MapServer") {
    return lookup(input, "mapfile");
  } else if (dataType === "Mapnik") {
    return lookup(input, "mapnik");
  } else if (dataType === "PostGIS") {
    return Number(input.substring(input.indexOf("values (") + 8, input.indexOf("EPSG") - 3).trim());
  }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = getEPSGCode;
}
if (typeof window !== 'undefined') {
  window['getEPSGCode'] = getEPSGCode;
} else if (typeof self !== 'undefined') {
  self['getEPSGCode'] = getEPSGCode; // jshint ignore:line
}
