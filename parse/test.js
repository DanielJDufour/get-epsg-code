const test = require("flug");
const parseProj4JS = require("./proj4js.js");

test("parse multiline", ({ eq }) => {
  const text = 'proj4.defs(\n"EPSG:26916",\n"+proj=utm +zone=16 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"\n\n);\n';
  eq(parseProj4JS(text, { debug: false }), 26916);
});

test("single line", ({ eq }) => {
  const text = 'proj4.defs( "EPSG:26916", "+proj=utm +zone=16 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs" );';
  eq(parseProj4JS(text, { debug: false }), 26916);
});
