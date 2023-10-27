#!/bin/bash -e

#
# Kevin Murphy
# 8/27/18
#
# This script helps install the UD-Annotatrix tool to run in server mode.
#

read_to_env() {

  echo $1
  echo `echo \$$1`

  if [ -z ${!1+NULL} ]; then
    return
  fi

  echo setting

  printf "(OPTIONAL) client secret for GitHub integration: "
  read ENVVAR

  if [ ! -z $ENVVAR ]; then
    echo hi
    echo "$1=$ENVVAR" >> .env
  fi

#  if [ -z $1 ];
}

# get the most recent versions
#git checkout master
#git pull

# install recent version of Node dependencies
#npm install

# read environment configuration
if [ -f .env ]; then
  while read line; do
    export $line;
  done < .env
fi

#if [ -z $ANNOTATRIX_GH_CLIENT_SECRET ]; then
#  printf "(OPTIONAL) client secret for GitHub integration: "
#  read ANNOTATRIX_GH_CLIENT_SECRET
#
#  if [ ! -z $ANNOTATRIX_GH_CLIENT_SECRET ]; then
#    echo hi
#    echo ANNOTATRIX_GH_CLIENT_SECRET=$ANNOTATRIX_GH_CLIENT_SECRET >> .env
#  fi
#fi

read_to_env hello || true
echo 'AFTER THE FUNCTION'
if [ -f .env ]; then cat .env; fi
echo
echo $hello
