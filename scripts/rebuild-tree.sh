#!/bin/bash -e

#
# Kevin Murphy
# 5/30/18
#
# This script makes editing the "tree" layout extension for cytoscape
# much simpler and easier.  Simply edit the version of "client/tree.js" in the
# current repository, and run this script before viewing your changes
# in the browser.  (It takes care of copying and building stuff.)
#

cytoscape_git_url=https://github.com/cytoscape/cytoscape.js.git
this_dir=`pwd`
cytoscape_dir=${CYTOSCAPE:=../cytoscape.js}
layout_dir=$cytoscape_dir/src/extensions/layout

if [ "$1" == "auto-install" ]; then
  cd /tmp
  if [ ! -d cytoscape.js ]; then
    git clone $cytoscape_git_url
  fi
  cd cytoscape.js
  git checkout master
  git pull
  cytoscape_dir=/tmp/cytoscape.js
  layout_dir=$cytoscape_dir/src/extensions/layout
elif [ ! -d $layout_dir ]; then
  echo "Error: unable to automatically locate $layout_dir; try running"
  echo " $ cd .."
  echo " $ git clone $cytoscape_git_url"
  echo " $ cd cytoscape.js"
  echo " $ npm install"
  echo ""
  echo "OR to install automatically, try running"
  echo " $ $0 auto-install"
  echo ""
  echo "OR if it's installed elsewhere, try running"
  echo " $ CYTOSCAPE=/path/to/cytoscape.js $0"
  exit 1
fi

tree_path=$this_dir/client/graph/tree.js

if [ ! -f $tree_path ]; then
  echo "Error: unable to locate $tree_path (aborting)"
  exit 1
fi

cp $tree_path $layout_dir

# add the implementation to this layout index
if ! grep "name:\W*tree\W*impl:\W*require(\W*tree\W*)" $layout_dir/index.js >/dev/null; then
  sed -i .backup $'s/}$/},\\\n  { name: \'tree\', impl: require( \'.\/tree\' ) }/g' $layout_dir/index.js
fi

cd $cytoscape_dir

if [ ! -d node_modules ]; then
  npm install
fi

npm run build
cp build/cytoscape.* $this_dir/client/graph/cytoscape
cd $this_dir
npm run build

echo "successfully copied built files into client/cytoscape/"

exit 0
