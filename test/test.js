const test = require('flug');
const { readdirSync, readFileSync } = require('fs');

const { UNSUPPORTED_MSG } = require('../globals.js');

const TEST_BUNDLE = process.env.TEST_BUNDLE || "get-epsg-code-all.node.min.js";
const getEPSGCode = require(`../dist/${TEST_BUNDLE}`);

const DEBUG = process.env.DEBUG || false;

test("Should identify MapServer mapfile with init", ({ eq }) => {
  try {
    const input = `PROJECTION\n   "init=epsg:26915"\nEND`;
    const actualCode = getEPSGCode(input, { debug: DEBUG });
    eq(actualCode, 26915);  
  } catch (error) {
    if (!TEST_BUNDLE.includes('mapfile')) {
      console.error(error);
      process.exit(1);
    }
  }
});


test("Should identify all files correctly", ({ eq }) => {
  const files = readdirSync('test/data').filter(fn => !fn.endsWith('.sh'));
  console.log('files:', files);
  files.forEach(filename => {
    if (filename.startsWith('32149')) return;
    const dataType = filename.split('.').pop();
    const expectedCode = Number(filename.split('.')[0]);
    const filepath = `test/data/${filename}`;
    const text = readFileSync(filepath, 'utf-8');
    if (text.trim() !== '') {
      let actualCode;
      try {
        actualCode = getEPSGCode(text, { debug: DEBUG });
        eq(actualCode, expectedCode);
      } catch (error) {
        if (TEST_BUNDLE.includes(dataType.toLowerCase())) {
          if (!error.message.toLowerCase() === UNSUPPORTED_MSG.replace('{}', dataType)) {
            throw error;
          }
        } else {
          console.log("================START ERROR LOGGING================");
          console.log("TEST_BUNDLE:", [TEST_BUNDLE]);
          console.log("dataType:", [dataType]);
          console.log("error.message:", error);
          console.log("expectedCode:", [expectedCode]);
          console.error("actualCode:", [actualCode]);
          console.log("================END ERROR LOGGING================");
          process.exit(1);
          //throw new Error(`Failed to get EPSG Code for ${filename}.`);
        }
      }
    }
  });
});
