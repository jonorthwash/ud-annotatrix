#!/bin/sh

usage() {
  echo "usage: graph.sh [build|connect|show] [\"FILES\" (default=\"standalone/lib/*.js\")]" >&2
  exit 1
}

get_func() {
  echo "$line" |\
  perl -lane 'if (/function (.*)\(/g) { print "$1" }'
}

get_inner_func() {
  echo "$line" |\
  perl -lane 'if (! /\/\// && ! /^\W*\*[^\/]/ && /\W([^ |^\(]*)\(.*\)/) { print "$1" }'
}

match_func() {
  if [ ! -z "$inner_func" ]; then
    if cat $funcs | grep -w $inner_func >/dev/null 2>/dev/null; then
      echo "+$inner_func"
    fi
  fi
}

build() {

  echo "sh: building func names" >&2

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

  echo "sh: connecting funcs" >&2

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

if [ -z "$2" ]; then
  files=standalone/lib/*.js
else
  files=$2
fi

funcs=/tmp/funcs.txt
graph=/tmp/graph.txt

if [ "$1" = build ]; then
  build
  connect
  python scripts/graph.py
elif [ "$1" = connect ]; then
  connect
  python scripts/graph.py
elif [ "$1" = show ]; then
  python scripts/graph.py
else
  usage
fi
