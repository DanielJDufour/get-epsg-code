const test = require("flug");
const { readdirSync, readFileSync } = require("fs");
const findAndRead = require("find-and-read");
const readTestData = fp => findAndRead(fp, { encoding: "utf-8" });

const TEST_CASE = "esriwkt-mapfile-proj4";

const { getEPSGCode, getEPSGCodes } = require(`../lib/lookup-esriwkt-mapfile-proj4.js`);

const DEBUG = process.env.DEBUG || false;

test("Throw error when unsupported", ({ eq }) => {
  const esriwkt = readTestData("3857.esriwkt");
  let msg;
  try {
    require(`../lib/lookup-proj4.js`)(esriwkt, { debug: true });
  } catch (error) {
    msg = error.message;
  }
  eq(msg, "[get-epsg-code] esriwkt not supported");
});

test("Should identify MapServer mapfile with init", ({ eq }) => {
  try {
    const input = `PROJECTION\n   "init=epsg:26915"\nEND`;
    const actualCode = getEPSGCode(input, { debug: DEBUG });
    eq(actualCode, 26915);
  } catch (error) {
    if (!TEST_CASE.includes("mapfile")) {
      console.error(error);
      process.exit(1);
    }
  }
});

test("Should identify all files correctly", ({ eq }) => {
  const files = readdirSync("test/data").filter(fn => !fn.endsWith(".sh"));
  console.log("files: " + files.join(", "));
  files.forEach(filename => {
    if (filename.startsWith("32149")) return;
    const dataType = filename.split(".").pop();
    const expectedCode = Number(filename.split(".")[0]);
    const filepath = `test/data/${filename}`;
    const text = readFileSync(filepath, "utf-8");
    if (text.trim() !== "") {
      let actualCodes, actualDataType;
      try {
        ({ type: actualDataType, codes: actualCodes } = getEPSGCodes(text, {
          debug: DEBUG
        }));
        eq(actualCodes.includes(expectedCode), true);
      } catch (error) {
        getEPSGCodes(text, { debug: true });
        console.log("================START ERROR LOGGING================");
        console.log("TEST_CASE:", [TEST_CASE]);
        console.log("dataType:", [dataType]);
        console.log("actualDataType:", [actualDataType]);
        console.log("text:", [text]);
        console.log("expectedCode:", [expectedCode]);
        console.error("actualCodes:", actualCodes);
        console.log("error.message:", error);
        console.log("================END ERROR LOGGING================");
        process.exit(1);
      }
    }
  });
});
