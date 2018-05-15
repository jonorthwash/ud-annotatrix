#!/bin/sh

in_func=false

for file in standalone/lib/*.js; do
  echo $file
  cat $file |\
  while read line; do
    echo "$line"
  done  
done

