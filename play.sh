#!/bin/bash

queueFile="queue_list"

# The binary to use to play the songs
PLAYER='omxplayer'

# The regex to match split youtube IDs from the URL
songRegex='^([^:]+):(.+)$'

tail -f $queueFile | while read song; do

    [[ $song =~ $songRegex ]]

    youTubeID="${BASH_REMATCH[1]}"
    URL="${BASH_REMATCH[2]}"

    if [ "$youTubeID" == "" ] || [ "$URL" == "" ]; then
        echo "ERROR with $song"
        continue;
    fi

    echo "Playing $youTubeID";

    $PLAYER "$URL"
done
