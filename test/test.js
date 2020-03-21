const { expect } = require('chai');
const { readdirSync, readFileSync } = require('fs');

const { UNSUPPORTED_MSG } = require('../globals.js');

const TEST_BUNDLE = process.env.TEST_BUNDLE || "get-epsg-code-all.node.min.js";
const getEPSGCode = require(`../dist/${TEST_BUNDLE}`);

const DEBUG = process.env.DEBUG || false;

describe('Checking Other Files', function() {
  it("Should identify MapServer mapfile with init", function() {
    try {
      const input = `PROJECTION\n   "init=epsg:26915"\nEND`;
      const actualCode = getEPSGCode(input, { debug: DEBUG });
      expect(actualCode).to.equal(26915);  
    } catch (error) {
      if (!TEST_BUNDLE.includes('mapfile')) {
        console.error(error);
        process.exit(1);
      }
    }
  });
});


describe('Checking Files Downloaded from epsg.io', function() {
  it("Should identify all files correctly", function() {
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
          expect(actualCode).to.equal(expectedCode);
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
});
