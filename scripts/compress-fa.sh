#!/bin/sh

#
# Kevin Murphy
# 8/15/18
#
# This script makes compressing the font-awesome woff font into a base64-encoded
#  string in the css more replicable.
#

usage() {
  echo "usage: $ $0 /path/to/fontawesome"
  exit 1
}

if [ -z $1 ]; then
  usage
fi

OUTPUT=server/public/css/font-awesome-base64.min.css
FA_PATH=$1
SOLID_CSS=`tail -n 1 $FA_PATH/css/solid.min.css`
BRANDS_CSS=`tail -n 1 $FA_PATH/css/brands.min.css`

echo $SOLID_CSS | sed s/src:.*$// > $OUTPUT
printf 'src:url(data:application/font-woff;base64,' >> $OUTPUT
base64 $FA_PATH/webfonts/fa-solid-900.woff >> $OUTPUT
printf ')' >> $OUTPUT
echo $SOLID_CSS | sed s/^.*\)// >> $OUTPUT

echo $BRANDS_CSS | sed s/src:.*$// >> $OUTPUT
printf 'src:url(data:application/font-woff;base64,' >> $OUTPUT
base64 $FA_PATH/webfonts/fa-brands-400.woff >> $OUTPUT
printf ')' >> $OUTPUT
echo $BRANDS_CSS | sed s/^.*\)// >> $OUTPUT

tail -n 1 $FA_PATH/css/fontawesome.min.css >> $OUTPUT
