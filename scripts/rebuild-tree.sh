#!/bin/bash -e

#
# Kevin Murphy
# 5/30/18
#
# This script makes editing the "tree" layout extension for cytoscape
# much simpler and easier.  Simply edit the version of "tree.js" in the
# current repository, and run this script before viewing your changes
# in the browser.  (It takes care of copying and building stuff.)
#
# NB: this should be run in the top-level project directory with
#      cytoscape.js in a neighbor directory, e.g.:
#
# projects
# \-- cytoscape.js
# |   \-- files .....
# \-- ud-annotatrix [CWD]
#    \-- files
#

this_dir=`pwd`
cytoscape_dir=../cytoscape.js
layout_dir=$cytoscape_dir/src/extensions/layout

if [ ! -d $layout_dir ]; then
  echo "Error: unable to locate $layout_dir try running"
  echo " $ cd .."
  echo " $ git clone https://github.com/cytoscape/cytoscape.js.git"
  echo " $ npm install"
  exit 1
fi

tree_path=./src/tree.js

if [ ! -f $tree_path ]; then
  echo "Error: unable to locate $tree_path (aborting)"
  exit 1
fi

cp $tree_path $layout_dir

echo "add the following line to $layout_dir/index.js:"
echo ""
echo " { name: 'tree', impl: require('./tree') }"
echo ""
echo -n "press <Enter> to confirm "
read

cd $cytoscape_dir

if [ ! -d node_modules ]; then
  npm install
fi

npm run build
cp build/cytoscape*.js $this_dir/src/cytoscape

echo "successfully copied built files into src/cytoscape/"

exit 0
