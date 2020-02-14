# Advanced Usage

## Builds
The identification of the following formats are included in all the available builds.
This is because it doesn't add any significant size to your bundle to identify the EPSG code for these formats:
 - GeoServer Config
 - Graphic Markup Language (GML)
 - Mapfile (MapServer Configuration)
 - Mapnik Configuration
 - Open Geospatial Consortium Well-Known Text (OGC WKT)
 - PostGIS Statement
 - Proj4js Definition Statement
 - Open Geospatial Consortium XML

However, identifying ESRI WKT, Mapfiles, Mapnik Configurations, and Proj4 Strings require embedding a compressed data file of valid hashes.
Therefore, trimmed builds are provided as well, noting which formats are excluded.

You can require a specific build with the following code:
```javascript
const getEPSGCode = require('get-epsg-code/dist/get-epsg-code-excluding-mapfile-mapnik.node.min.js');
```

You can find a list of all of the builds and their file size at [BUILDS.md](https://github.com/DanielJDufour/get-epsg-code/blob/master/BUILDS.md)