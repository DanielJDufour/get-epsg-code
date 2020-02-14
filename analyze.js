const { readFileSync } = require("fs");
const { parse } = require('papaparse');
const {
  ARRAY_TYPE,
  HASHED_FIELDS,
  NUM_HASHED_FIELDS,
  NUM_FIELDS
} = require('./globals.js');

// first read all rows from original CSv
const string = readFileSync('./crs.csv', 'utf-8');
const parsed = parse(string, { header: true, skipEmptyLines: true });
const rows = parsed.data;

// read hashed values
const data = readFileSync('./crs.dat');
const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
const values = new ARRAY_TYPE(arrayBuffer);

console.log("first value:", values[0]);

const epsg_codes = [];
for (let i = 0; i < values.length; i+=NUM_FIELDS) {
  epsg_codes.push(Number(values[i]));
}
epsg_codes.sort((a, b) => a > b ? 1 : -1);

console.log("epsg_codes.length:", epsg_codes.length);
console.log("max epsg code is:", Math.max(...epsg_codes));
console.log("min epsg code is:", Math.min(...epsg_codes));

const diffs = [];
for (let i = 1; i < epsg_codes.length; i++) {
  const current = epsg_codes[i];
  const previous = epsg_codes[i-1];
  const diff = current - previous;
  if (diff > 256) {
    console.log(`${current} - ${previous} = ${diff}`);
  }
  diffs.push(diff);
}
//console.log("diffs:", diffs);
console.log("Math.max(...diffs):", Math.max(...diffs));
console.log("Math.min(...diffs):", Math.min(...diffs));
process.exit();

const hash2code = HASHED_FIELDS.reduce((obj, v) => {
  obj[v] = {};
  return obj;
}, {});

console.log("hash2code:", hash2code);

for (let i = 0; i < values.length; i += NUM_FIELDS) {
  const code = values[i];
  const row = rows.find(row => Number(row.code) === code);
  HASHED_FIELDS.forEach((fieldName, b) => {
    const hash = values[i+b+1];
    const hash2code4field = hash2code[fieldName];
    if (Object.hasOwnProperty(hash2code4field, hash)) hash2code4field[hash].push(code);
    else hash2code4field[hash] = [code];
  });
}

//console.log("hash2code:", hash2code);

// remove uniques
for (let fieldName in hash2code) {
  for (let hash in hash2code[fieldName]) {
    if (hash2code[fieldName][hash].length == 1) {
      delete hash2code[fieldName][hash];
    } else {
      throw new Error("collision for field", fieldName, " and codes ", hash2code[fieldName][hash]);
    }
  }
}
console.log("hash2code:", hash2code);

process.exit();
console.log("rows:", rows[1], rows[1].esriwkt_hash);

const rows_without_hashes = rows.filter(row => {
  return row.esriwkt_hash === undefined || row.wkt_hash === undefined;
});
console.log("rows_without_hashes:", rows_without_hashes.length);
