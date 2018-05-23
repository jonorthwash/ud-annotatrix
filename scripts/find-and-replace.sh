#!/bin/bash

parse() {
  line=`echo $line | tr = ' '`
  old=`echo "$line" | sed 's/ .*//g'`
  new=`echo "$line" | sed 's/.* //g'`
}

dir=standalone/lib
replacements=`cat /tmp/ids`

for file in `find $dir -type f | grep -v /ext/`; do
  if [[ $file =~ .html$ ]] || [[ $file =~ .css$ ]] || [[ $file =~ .js$ ]]; then
    for line in $replacements; do
      parse
      sed -i '' s/$old/$new/g $file
    done
  fi
done
