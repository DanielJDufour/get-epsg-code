const { readFileSync, writeFileSync } = require('fs');
const { parse } = require('papaparse');
const { isUTM } = require('utm-utils');
const { hash } = require('./utils.js');
const clean_esriwkt = require('./clean-esriwkt');
const {
    ARRAY_TYPE,
    HASHED_FIELDS,
    NUM_FIELDS,
    NUM_HASHED_FIELDS
} = require('./globals.js');

const string = readFileSync('./crs.csv', 'utf-8');
const parsed = parse(string, { header: true, skipEmptyLines: true });
let rows = parsed.data;

// filter out UTM which is calculated by pulling out info from input data
console.log("rows before filtering out UTM:", rows.length);
rows = rows.filter(({ code }) => !isUTM(code));
console.log("rows after filtering out UTM:", rows.length);

rows.forEach(row => row.esriwkt = clean_esriwkt(row.esriwkt));

console.log("parsed.meta:", parsed.meta);
const num_rows = rows.length;
console.log("num_rows:", num_rows);
const num_values = num_rows * NUM_FIELDS;
console.log("num_values:", num_values);
//const num_bytes = 2 * num_rows + 4 * num_hashed_fields;
//const bytes_per_row = 2 + (4 * num_hashed_fields);
//const output = new ArrayBuffer(num_bytes);
//const dataView = new DataView(output);

const codes = rows.map(row => row['code']);
console.log("codes:", JSON.stringify(codes.slice(0, 5)), "...");
const min = Math.min(...codes);
console.log("min:", min);
const max = Math.max(...codes);
console.log("max:", max);

const output_combined = new ARRAY_TYPE(num_values);
//console.log("cell count:", output.length);

rows.forEach((row, index) => {
    const rowStart = index * NUM_FIELDS;
    output_combined[rowStart] = Number(row['code']);
    //dataView.setInt16()
    HASHED_FIELDS.forEach((hashed_field, hashed_field_index) => {
        output_combined[rowStart + 1 + hashed_field_index] = hash(row[hashed_field]);
    });
});
console.log("output_combined:", JSON.stringify(output_combined.slice(0, 5)), "...");

console.log("output buffer:", output_combined.buffer);
console.log("first value before writing:", output_combined[0]);

const output_buffer = Buffer.from(output_combined.buffer);
writeFileSync('crs.dat', output_buffer);

//writeFileSync('crs-b64.js', `module.exports = "${output_buffer.toString('base64')}";`, "utf-8");
