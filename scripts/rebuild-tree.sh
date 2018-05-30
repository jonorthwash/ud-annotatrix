#!/bin/bash -e

#
# NB: this should be run in the top-level project directory with
#      cytoscape.js in a neighbor directory, e.g.:
#
# -- cytoscape.js
#    \-- files .....
# -- ud-annotatrix [CWD]
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

tree_path=standalone/lib/ext/cytoscape/tree.js

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
npm run build
cp build/cytoscape.min.js $this_dir/standalone/lib/ext

echo "successfully copied $build_dir/cytoscape.min.js into extensions"

exit 0
