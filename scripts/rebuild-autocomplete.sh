#!/bin/sh

echo "const jQuery = require('jquery');" > src/autocomplete.js
cat node_modules/jquery-autocomplete/jquery.autocomplete.js > src/autocomplete.js