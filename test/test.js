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

test("issue #16", ({ eq }) => {
  const old_esriwkt = `GEOGCS["China Geodetic Coordinate System 2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943]]`;
  eq(getEPSGCode(old_esriwkt, { debug: DEBUG }), 4490);

  const new_esriwkt = `GEOGCS["GCS_China_Geodetic_Coordinate_System_2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`;
  eq(getEPSGCode(new_esriwkt, { debug: DEBUG }), 4490);
});

// test("issue #16 EPSG:4507", ({ eq }) => {
//   const old_esriwkt4507 = `PROJCS["CGCS2000_Gauss_Kruger_CM_105E",GEOGCS["GCS_China Geodetic Coordinate System 2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",105],PARAMETER["scale_factor",1],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]`;
//   eq(getEPSGCode(old_esriwkt4507, { debug: DEBUG }), 4507);

//   const new_esriwkt4507 = `PROJCS["CGCS2000_GK_CM_105E",GEOGCS["GCS_China_Geodetic_Coordinate_System_2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Gauss_Kruger"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",105.0],PARAMETER["Scale_Factor",1.0],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]`;
//   eq(getEPSGCode(new_esriwkt4507, { debug: DEBUG }), 4507);
// });
