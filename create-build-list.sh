#!/bin/bash

echo "starting create-build-list.sh"

echo '# Builds' > BUILDS.md

echo '| name | file size |' >> BUILDS.md

echo '| ---- | --------- |' >> BUILDS.md

ls dist -alsh | grep 'get-epsg-code' |  awk 'BEGIN { OFS = " | " }{ print "| "$10,$1" |" }' | grep '.js ' >> BUILDS.md
