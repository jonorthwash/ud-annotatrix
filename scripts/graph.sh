#!/bin/sh

get_func() {
  echo "$line" |\
  perl -lane 'if (/function (.*)\(/g) { print "$1" }'
}

get_inner_func() {
  echo "$line" |\
  perl -lane 'if (! /(\/\/)/) { print "$_" }' |\
  perl -lane 'if (! /\W*\*/) { print "$_" }' |\
  perl -lane 'if (/\W([^ |^\(]*)\(.*\)/) { print "$1" }'
}

match_func() {
  if [ ! -z "$inner_func" ]; then
    if cat $funcs | grep -w $inner_func >/dev/null 2>/dev/null; then
      echo "+$inner_func"
    fi
  fi
}

build() {

  echo "building func names"

  for file in $files; do
    echo " - reading $file" >&2
    while read -r line; do
      func=`get_func`
      if [[ ! -z "$func" ]]; then
        echo $func
      fi
    done < $file
  done > $funcs

}

connect() {

  echo "connecting funcs"

  for file in $files; do
    echo " - reading $file" >&2
    while read -r line; do
      func=`get_func`
      if [[ -z "$func" ]]; then
        inner_func=`get_inner_func`
        match_func
      else
        echo "$func"
      fi
    done < $file
  done > $graph

}

files=standalone/lib/*.js
funcs=/tmp/funcs.txt
graph=/tmp/graph.txt

if [ "$1" = build ]; then
  build
  connect
fi

python scripts/graph.py
