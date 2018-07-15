#!/bin/bash

# colors
GREEN="\033[1;32m"
RESET="\033[0m"
RED="\033[1;91m"

# python virtual environment setup
VENV=""
if hash virtualenv 2>/dev/null; then
  VENV="ud-env"

  if [ ! -d $VENV ]; then
    virtualenv $VENV --python=python3.6
  fi
  . ./$VENV/bin/activate

  # virtual environment use instructions
  echo ""
  echo -e "NOTE: Python virtual environment activated ($GREEN$VENV$RESET);"
  echo -e "  to deactivate, type ${GREEN}deactivate${RESET}."
  echo ""

else
  echo -e "NOTE: ${RED}command${RESET} virtualenv ${RED}not found${RESET}."
fi

# install required python packages
# without "Requirement already satisfied warnings"
echo "installing python packages ..." >&2
pip3 install --user -r requirements.txt 1> >(grep -v 'Requirement already satisfied' 1>&2)

# basic ENV file
ENV=.env
if [ ! -f $ENV ]; then
  echo "writing env file ..." >&2
  echo "VIRTUAL_ENV=$VENV
PATH_TO_CORPORA=corpora
SECRET_KEY=annotatrixareforkids
HOST=127.0.0.1
PORT=5316
DEBUG=DEBUG" > $ENV
fi

# install js stuff
echo "installing node packages ..." >&2
npm install
