# get-epsg-code
Gets EPSG Code for Various Inputs (incl. OGC WKT, ESRI WKT, PROJ String, Proj4js String)

# approach
Takes the crs-csv, hashes the columns and stores the result in a binary file.  This is done in order to compress the data enough, so this package can be run completely client-side.

