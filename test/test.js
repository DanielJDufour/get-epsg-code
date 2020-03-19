const { expect } = require('chai');
const { readdirSync, readFileSync } = require('fs');
const getEPSGCode = require('../dist/get-epsg-code-all.node.min.js');

describe('Checking Other Files', function() {
  it("Should identify MapServer mapfile with init", function() {
    const input = `PROJECTION\n   "init=epsg:26915"\nEND`;
    const actualCode = getEPSGCode(input);
    expect(actualCode).to.equal(26915);
  });
});

describe('Checking Files Downloaded from epsg.io', function() {
  it("Should identify all files correctly", function() {
    const files = readdirSync('test/data').filter(fn => !fn.endsWith('.sh'));
    console.log('files:', files);
    files.forEach(filename => {
      if (filename.startsWith('32149')) return;
      const expectedCode = Number(filename.split('.')[0]);
      const filepath = `test/data/${filename}`;
      const text = readFileSync(filepath, 'utf-8');
      if (text.trim() !== '') {
        let actualCode;
        try {
          actualCode = getEPSGCode(text, { debug: false });
          expect(actualCode).to.equal(expectedCode);
        } catch (error) {
          console.log("expectedCode:", [expectedCode]);
          console.error("actualCode:", [actualCode]);
          throw new Error(`Failed to get EPSG Code for ${filename}.`);
        }
      }
    });
  });
});
