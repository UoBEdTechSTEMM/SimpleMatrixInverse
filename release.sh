#! /bin/bash

cat js/app.js js/lib.js bower_components/two.js/build/two.min.js static/forminput.js | uglifyjs | sed 's/\$/jQuery/g' > release/release.min.js
cp static/style.css release
cp index.html release
