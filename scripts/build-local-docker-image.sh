#!/usr/bin/env bash

VERSION=`git describe --abbrev=0 --tags`

tag="synbiohub/plugin-visual-seqviz-sbol"

docker build . \
  --no-cache \
  --tag "${tag}:${VERSION}" \
  --tag "${tag}:latest"
