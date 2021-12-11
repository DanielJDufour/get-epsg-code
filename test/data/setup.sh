for epsg_code in 3857 4326 26916 32149 32617 32717 32739
do
  echo "EPSG Code: $epsg_code"
  for crs_format in esriwkt geoserver gml js mapfile mapnik postgis proj4 wkt xml
  do
    echo "    CRS Format: $crs_format"
    crs_filename="${epsg_code}.${crs_format}"

    # clean previous downloads
    rm $crs_filename*

    url="https://epsg.io/$crs_filename"
    echo "    Getting $url"
    wget $url
    sleep 2
  done
done