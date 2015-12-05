#!/bin/bash

queueFile="queue_list"

# The regex to match split youtube IDs from the URL
songRegex='^([^:]+):(.+)$'

tail -f $queueFile | while read song; do

    [[ $song =~ songRegex ]]

    youTubeID="${BASH_REMATCH[1]}"
    URL="${BASH_REMATCH[2]}"

    echo "Playing $youTubeID";

    omxplayer "$URL"
done
