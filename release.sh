#! /bin/bash

cat static/forminput.js js/lib.js js/app.js | uglifyjs | sed 's/\$/jQuery/g' > release/release.min.js
