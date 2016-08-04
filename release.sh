#! /bin/bash

cat release/lib.js release/app.js | uglifyjs | sed 's/\$/jQuery/g' > release/release_lib.min.js
