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

MYSQL_HOST='localhost'
MYSQL_USER='root'
MYSQL_PASS='password'
MYSQL_DB='jukebox'

RESOLVE_LIST="resolve_list"
QUEUE_LIST="queue_list"

function implode { local IFS="$1"; shift; echo "$*"; }

function writeToQueue {

    local youTubeID="$1"
    local URL="$2"

    echo "$youTubeID:$URL" >> "$QUEUE_LIST"

}

formatRegex='^([0-9]+)[[:space:]]+([^[:space:]]+).+$'

tail -f "$RESOLVE_LIST" | while read youTubeID; do

    # Reset
    streamURL="";
    usableFormatID="";

    echo "Resolving $youTubeID";

    # Check if we have already resolved this ID
    resolvedCheck=$(mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" -AN -se "SELECT URL FROM URLCache WHERE youTubeID = '$youTubeID'" "$MYSQL_DB")

    if [ "$resolvedCheck" != "" ]; then
        echo "$youTubeID has already been resolved"
        writeToQueue "$youTubeID" "$resolvedCheck"
        continue;
    fi

    echo "Fetching available formats..."

    # Get all the formats this video can be played in reverse order
    formats=$(youtube-dl -F "$youTubeID" | grep 'audio only' | tac)

    # Count the number of returned formats
    formatCount=$(echo "$formats" | wc -l)

    # Check we found some qualities
    if [[ $formatCount == 0 ]]; then
        echo "ERROR - No formats could be found!"
        continue;
    fi

    declare -a formatIDs

    # Loop through each of the formats found
    while read -r format; do

        [[ $format =~ $formatRegex ]]

        formatID="${BASH_REMATCH[1]}"
        formatType="${BASH_REMATCH[2]}"

        if [ "$formatID" != "" ] && [ "formatType" != "" ]; then
            # Add this ID to the array
            formatIDs=(${formatIDs[@]} $formatID)
        else
            echo "Ignoring bad format: $format"
        fi

    done <<< "$formats"

    echo "Found $formatCount Formats: ${formatIDs[@]}"

    # Try each format in turn
    for formatID in "${formatIDs[@]}"; do

        echo -n "Trying format $formatID..."
        streamURL=$(youtube-dl -f "$formatID" -g $youTubeID)

        # Check the response we got
        if [ $? == 0 ]; then
            usableFormatID="$formatID"
            echo " OK!"
            break;
        else
            echo " BAD! Moving on..."
            continue;
        fi

    done

    # Write this URL to the database
    mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASS" -e "INSERT IGNORE INTO URLCache VALUES ('$youTubeID','$usableFormatID','$streamURL')" "$MYSQL_DB"

    # Write this URL to the queue list
    writeToQueue "$youTubeID" "$streamURL"

done
