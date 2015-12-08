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
optParse

LOG_DIR=$(optValue 'LOG_DIR')
LOG_FILE="$LOG_DIR/resolve"

formatRegex='^([0-9]+)[[:space:]]+([^[:space:]]+).+$'

youTubeID="$1"

echo "Resolving $youTubeID" >> "$LOG_FILE"

echo "Fetching available formats..." >> "$LOG_FILE"

# Get all the formats this video can be played in reverse order
formats=$(youtube-dl -F "$youTubeID" | grep 'audio only' | tac)

# Count the number of returned formats
formatCount=$(echo "$formats" | wc -l)

# Check we found some qualities
if [[ $formatCount == 0 ]]; then
    echo "ERROR - No formats could be found!" >> "$LOG_FILE"
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
        echo "Ignoring bad format: $format" >> "$LOG_FILE"
    fi

done <<< "$formats"

#echo "Found $formatCount Formats: ${formatIDs[@]}"

# Try each format in turn
for formatID in "${formatIDs[@]}"; do

    #echo -n "Trying format $formatID..."
    streamURL=$(youtube-dl -f "$formatID" -g $youTubeID)

    # Check the response we got
    if [ $? == 0 ]; then
        usableFormatID="$formatID"
        echo " OK!" >> "$LOG_FILE"
        break;
    else
        echo " BAD! Moving on..." >> "$LOG_FILE"
        continue;
    fi

done

# Write this URL to the queue list
echo -n "$streamURL"
