#!/bin/bash

PLAYLIST="playlist"

tail -f $PLAYLIST | while read URL; do
    echo "Playing $URL";
    cvlc --no-video https://www.youtube.com/watch?v=$URL
done
