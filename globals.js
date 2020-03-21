const DEFAULT_HASHED_FIELDS = ['esriwkt', 'mapfile', 'proj4'];

let HASHED_FIELDS = DEFAULT_HASHED_FIELDS;
if (typeof process !== "undefined" && process.env && process.env.HASHED_FIELDS) {
  HASHED_FIELDS = process.env.HASHED_FIELDS.split(',');
}

let EXCLUDED_FORMATS = [];
if (typeof process !== "undefined" && process.env && process.env.EXCLUDED_FORMATS) {
  EXCLUDED_FORMATS = process.env.EXCLUDED_FORMATS.split(',');
}

if (!HASHED_FIELDS.includes('esriwkt')) EXCLUDED_FORMATS.push('esriwkt');
if (!HASHED_FIELDS.includes('mapfile')) EXCLUDED_FORMATS.push('mapfile');
if (!HASHED_FIELDS.includes('proj4')) {
  EXCLUDED_FORMATS.push('mapnik'); // mapnik parsing depends on proj4
  EXCLUDED_FORMATS.push('proj4');
}
EXCLUDED_FORMATS.sort();

const NUM_HASHED_FIELDS = HASHED_FIELDS.length;
const NUM_FIELDS = NUM_HASHED_FIELDS + 1; // adding one for epsg code field
const ARRAY_TYPE = Int16Array;
const DATA_VIEW_READER_NAME = "getInt16";
const BYTES_PER_VALUE = 2;

const UNSUPPORTED_MSG = "[get-epsg-code] {} format not supported";

const FORMATS = {
  ESRI_WKT: 'esriwkt',
  GEOSERVER: 'geoserver',
  MAPFILE: 'mapfile',
  MAPNIK: 'mapnik',
  OGC_GML: 'gml',
  OGC_XML: 'xml',
  OGC_WKT: 'wkt',
  POSTGIS: 'postgis',
  PROJ_4: 'proj4',
  PROJ_4_JS: 'js'
};

module.exports = {
  ARRAY_TYPE,
  DATA_VIEW_READER_NAME,
  BYTES_PER_VALUE,
  DEFAULT_HASHED_FIELDS,
  EXCLUDED_FORMATS,
  FORMATS,
  HASHED_FIELDS,
  NUM_HASHED_FIELDS,
  NUM_FIELDS,
  UNSUPPORTED_MSG  
};
