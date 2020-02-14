# get-epsg-code: *beta*
Gets the EPSG Code for Nearly All Coordinate Reference System Formats (including. OGC WKT, ESRI WKT, GeoServer Config, Mapfile, Mapnik Config, PostGIS Statement, PROJ String, Proj4js String)

# usage
```javascript
const getEPSGCode = require("get-epsg-code");

const proj4string = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";

const epsgCode = getEPSGCode(proj4string);
// 3857
```

# purpose
Get the EPSG code for input without the need for a remote server

# algorithm
Take a CSV of Coordinate Reference System formats, hash the columns and stores the result in a binary file.

# limitations
This package goes only one way. It only gets EPSG codes for a given input. It cannot provide coordinate information for an EPSG code.

# advanced usage
For advanced usage, see [ADVANCED_USAGE.md](https://github.com/DanielJDufour/get-epsg-code/blob/master/ADVANCED_USAGE.md)

# contact
Post an issue at https://github.com/danieljdufour/get-epsg-code/issues or email the package author at daniel.j.dufour@gmail.com
