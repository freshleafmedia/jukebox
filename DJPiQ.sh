#!/bin/bash

PLAYLIST="playlist"

tail -f $PLAYLIST | while read URL; do
    echo "Playing $URL";

    real_url=`youtube-dl -f 171 -g $URL`
    if [ $? != 0 ]; then
    continue
    fi
    echo "$real_url"
    #omxplayer https://www.youtube.com/watch?v=$real_url 
    cvlc --play-and-exit --no-video $real_url 
done
