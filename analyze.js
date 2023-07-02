const { readFileSync } = require("fs");
const { parse } = require("papaparse");
const normalize_rows = require("./normalize/rows.js");

// first read all rows from original CSv
const string = readFileSync("./crs.csv", "utf-8");
const parsed = parse(string, { header: true, skipEmptyLines: true });
const original_rows = parsed.data;

// find dupes
normalize_rows(original_rows);

const hashed_rows = require("./lib/lookup-esriwkt-mapfile-proj4.js")._load_rows();

const hash2code = {};
hashed_rows.reduce((acc, { epsg_code, ...rest }) => {
  Object.entries(rest).forEach(([field, hash]) => {
    if (!hash2code[field]) hash2code[field] = {};
    if (!hash2code[field][hash]) hash2code[field][hash] = [];
    hash2code[field][hash].push(epsg_code);
  });
}, {});
// console.log("hash2code:", hash2code);

let collisions = 0;

// remove uniques
for (let fieldName in hash2code) {
  for (let hash in hash2code[fieldName]) {
    if (hash2code[fieldName][hash].length == 1) {
      delete hash2code[fieldName][hash];
    } else {
      const inputs = hash2code[fieldName][hash].map(code => {
        return original_rows.find(r => r.code == code)[fieldName];
      });
      if (new Set(inputs).size > 1) {
        // only collision if inputs aren't the same
        collisions++;
        // throw new Error("collision for field " + fieldName + " hash " + hash + " for codes " + hash2code[fieldName][hash]);
      }
    }
  }
}

console.log("collisions:", collisions);

if (collisions > 0) {
  throw Error("there are collisions");
}
