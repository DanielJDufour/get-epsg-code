# get-epsg-code
Gets EPSG Code for Various Inputs (incl. OGC WKT, ESRI WKT, PROJ String, Proj4js String)

# approach
Takes the crs-csv, hashes the columns and stores the result in a binary file.  This is done in order to compress the data enough, so this package can be run completely client-side.

# limitation
This package only goes one way (to EPSG code). It does not convert an EPSG code into WKT.
