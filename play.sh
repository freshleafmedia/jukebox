#!/bin/bash

# Get the source directory
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi

# Set the library root path
LIBRARY_PATH_ROOT="$DIR/libs"

# Option file config
OPT_FILE="$HOME/.jukebox"

# Include all libraries
for f in "$LIBRARY_PATH_ROOT"/*.sh; do
	# Include the directory
	source "$f"
done

# Call the option parser
optParser

MYSQL_HOST='localhost'
MYSQL_USER='root'
MYSQL_PASS='password'
MYSQL_DB='jukebox'

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

    # Record this play in the DB
    mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" -e "INSERT INTO songs (youTubeID) VALUES('$youTubeID') ON DUPLICATE KEY UPDATE plays=plays+1" "$MYSQL_DB"

    $PLAYER "$URL"
done
