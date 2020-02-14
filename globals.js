let HASHED_FIELDS;

if (typeof process !== "undefined" && process.env && process.env.HASHED_FIELDS) {
  HASHED_FIELDS = process.env.HASHED_FIELDS.split(',').map(str => str.trim());
} else {
  HASHED_FIELDS = ['esriwkt', 'mapfile', 'mapnik', 'proj4'];
}
console.log("HASHED_FIELDS set to:", HASHED_FIELDS);

const NUM_HASHED_FIELDS = HASHED_FIELDS.length;
const NUM_FIELDS = NUM_HASHED_FIELDS + 1; // adding one for epsg code field
const ARRAY_TYPE = Int16Array;
const DATA_VIEW_READER_NAME = "getInt16";
const BYTES_PER_VALUE = 2;

module.exports = {
  ARRAY_TYPE,
  DATA_VIEW_READER_NAME,
  BYTES_PER_VALUE,
  HASHED_FIELDS,
  NUM_HASHED_FIELDS,
  NUM_FIELDS
};
