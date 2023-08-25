#!/usr/bin/env bash

tag="synbiohub/plugin-visual-seqviz:local"

docker build . --no-cache --tag $tag
