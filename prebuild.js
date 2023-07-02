const { copyFileSync, mkdirSync, readFileSync, writeFileSync } = require("fs");

const b64ab = require("b64ab");
const rimraf = require("rimraf");
const { parse } = require("papaparse");
const { isUTM } = require("utm-utils");
const { FORMATS } = require("./enums.js");
const hash = require("./hash.js");
const normalize_rows = require("./normalize/rows.js");

const reset = dirpath => {
  rimraf.rimrafSync(dirpath);
  mkdirSync(dirpath);
};

reset("./lib");
console.log("[get-epsg-code] reset lib directory");

reset("./log");
console.log("[get-epsg-code] reset log directory");

mkdirSync("./lib/data");
mkdirSync("./lib/normalize");
mkdirSync("./lib/parse");

// copy a few files over
copyFileSync("./hash.js", "./lib/hash.js");
copyFileSync("./enums.js", "./lib/enums.js");
copyFileSync("./src/get-proj-type.js", "./lib/get-proj-type.js");
copyFileSync("./normalize/esriwkt.js", "./lib/normalize/esriwkt.js");
copyFileSync("./normalize/wkt.js", "./lib/normalize/wkt.js");
copyFileSync("./normalize/proj4.js", "./lib/normalize/proj4.js");
copyFileSync("./parse/proj4js.js", "./lib/parse/proj4js.js");

const string = readFileSync("./crs.csv", "utf-8");
console.log("[get-epsg-code] read crs.csv");
const parsed = parse(string, { header: true, skipEmptyLines: true });
console.log("[get-epsg-code] parsed crs.csv");

let rows = parsed.data;

// convert code to numbers
rows.forEach(row => (row.code = Number(row.code)));

// filter out UTM which is calculated by pulling out info from input data
console.log("[get-epsg-code] number of rows before filtering out UTM:", rows.length);
rows = rows.filter(({ code }) => !isUTM(code));

normalize_rows(rows);

rows.sort((a, b) => a.code - b.code);

writeFileSync("./log/esriwkt", rows.map(r => r.code + "\t" + r.esriwkt).join("\n"), "utf-8");
writeFileSync("./log/proj4", rows.map(r => r.code + "\t" + r.proj4).join("\n"), "utf-8");

console.log("[get-epsg-code] parsed.meta:", parsed.meta);
const num_rows = rows.length;
console.log("[get-epsg-code] number of rows after filtering out UTM:", num_rows);

const { ESRI_WKT, MAPFILE, PROJ_4 } = FORMATS;

[[ESRI_WKT, MAPFILE, PROJ_4], [ESRI_WKT, PROJ_4], [PROJ_4]].forEach(hashed_fields => {
  const num_fields = hashed_fields.length + 1;
  console.log("[get-epsg-code] num_fields:", num_fields);
  const num_values = num_rows * num_fields;
  console.log("[get-epsg-code] num_values:", num_values);

  const hashed_rows = rows.map(row => [row.code, ...hashed_fields.map(fieldname => hash(row[fieldname]))]);

  writeFileSync(`./log/${hashed_fields.join("-")}.jsonl`, hashed_rows.map(row => row.join("\t")).join("\n"), "utf-8");

  const data = hashed_rows.flat();

  const typedData = Int32Array.from(data);

  // verify we can use data type
  if (JSON.stringify(data) !== JSON.stringify(Array.from(typedData))) {
    throw Error("[get-epsg-code] invalid array data type");
  }

  const arrayBuffer = typedData.buffer;

  const dataBase64 = b64ab.toBase64String(arrayBuffer);

  console.log("[get-epsg-code] dataBase64:", dataBase64.substring(0, 100), "...");

  // check round-trip through b64ab
  if (JSON.stringify(data) !== JSON.stringify(Array.from(new Int32Array(b64ab.toArrayBuffer(dataBase64))))) {
    throw Error("[get-epsg-code] invalid b64ab round-trip");
  }

  const result = {
    properties: {
      columns: ["epsg_code"].concat(hashed_fields),
      key: "epsg_code", // assuming in first position
      dataType: "int32"
    },
    data: dataBase64
  };

  const stringified = JSON.stringify(result, undefined, 2);
  console.log("[get-epsg-code] stringified:", stringified.replaceAll("\n", "\\n").substring(0, 500), "...");

  const filename = hashed_fields.sort().join("-");
  console.log("[get-epsg-code] filename:", filename);

  writeFileSync(`./lib/data/${filename}.json`, stringified, "utf-8");

  const template = readFileSync("./src/index.js", "utf-8");

  const content = template.replace("REPLACE_ME", `"./data/${filename}.json"`);

  const filepath = `./lib/lookup-${filename}.js`;
  writeFileSync(filepath, content, "utf-8");

  console.log(`[get-epsg-code] created ${filepath}`);
});
