const test = require("flug");
const esriwkt = require("./esriwkt");
const proj4 = require("./proj4");

test("proj-normalize: esriwkt", ({ eq }) => {
  // from https://epsg.io/32617.esriwkt
  const txt = `PROJCS["WGS_1984_UTM_Zone_17N",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",-81.0],PARAMETER["Scale_Factor",0.9996],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]`;
  const expected = `PROJCS["wgs_84_utm_zone_17n",GEOGCS["wgs_84",DATUM["wgs_84",SPHEROID["wgs_84",6378137,298.257223563]],PRIMEM["greenwich",0],UNIT["degree",0.017453292519943]],PROJECTION["transverse_mercator"],PARAMETER["central_meridian",-81],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],PARAMETER["latitude_of_origin",0],PARAMETER["scale_factor",0.9996],UNIT["meter",1]]`;
  eq(esriwkt(txt), expected);
});

test("proj-normalize: esriwkt 4326", ({ eq }) => {
  // from https://epsg.io/32617.esriwkt
  const txt = `GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]`;
  const expected = `GEOGCS["wgs_84",DATUM["wgs_84",SPHEROID["wgs_84",6378137,298.257223563]],PRIMEM["greenwich",0],UNIT["degree",0.017453292519943]]`;
  eq(esriwkt(txt), expected);
});

test("proj-normalize: esriwkt 3031", ({ eq }) => {
  // from https://epsg.io/3031.esriwkt
  const older_version = `PROJCS["WGS_84_Antarctic_Polar_Stereographic",GEOGCS["GCS_WGS_1984",DATUM["WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943]],PROJECTION["Stereographic_South_Pole"],PARAMETER["standard_parallel_1",-71],PARAMETER["central_meridian",0],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1]]`;
  const older_normalized = esriwkt(older_version);
  const newer_version = `PROJCS["WGS_1984_Antarctic_Polar_Stereographic",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Stereographic_South_Pole"],PARAMETER["False_Easting",0.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",0.0],PARAMETER["Standard_Parallel_1",-71.0],UNIT["Meter",1.0]]  `;
  const newer_normalized = esriwkt(newer_version);

  const expected = `PROJCS["wgs_84_antarctic_polar_stereographic",GEOGCS["wgs_84",DATUM["wgs_84",SPHEROID["wgs_84",6378137,298.257223563]],PRIMEM["greenwich",0],UNIT["degree",0.017453292519943]],PROJECTION["stereographic_south_pole"],PARAMETER["central_meridian",0],PARAMETER["false_easting",0],PARAMETER["false_northing",0],PARAMETER["standard_parallel_1",-71],UNIT["meter",1]]`;
  eq(older_normalized === newer_normalized, true);
  eq(older_normalized, expected);
  eq(newer_normalized, expected);
});

test("normalize proj4", ({ eq }) => {
  const txt = `+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs`;
  const expected = "+datum=WGS84 +lat_0=-90 +lat_ts=-71 +lon_0=0 +proj=stere +units=m +x_0=0 +y_0=0";
  eq(proj4(txt), expected);
});
