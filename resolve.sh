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

CACHE_DIR=$(optValue 'CACHE_DIR')

formatRegex='^([0-9]+)[[:space:]]+([^[:space:]]+).+$'

youTubeID="$1"

echo "$youTubeID: Checking file cache..." >> "$LOG_FILE"

if [ -f "$CACHE_DIR/$youTubeID" ]; then
    echo "$youTubeID: Cache file found" >> "$LOG_FILE"
    echo -n "$CACHE_DIR/$youTubeID"
    exit 0;
fi

echo "$youTubeID: Resolving" >> "$LOG_FILE"


echo "$youTubeID: Fetching available formats..." >> "$LOG_FILE"

# Get all the formats this video can be played in reverse order
formats=$(youtube-dl -F "$youTubeID" | grep 'audio only' | tac)

# Count the number of returned formats
formatCount=$(echo "$formats" | wc -l)

# Check we found some qualities
if [[ $formatCount == 0 ]]; then
    echo "$youTubeID: ERROR - No formats could be found!" >> "$LOG_FILE"
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
        echo "$youTubeID: Ignoring bad format: $format" >> "$LOG_FILE"
    fi

done <<< "$formats"

#echo "Found $formatCount Formats: ${formatIDs[@]}"

downloaded=false

# Try each format in turn
for formatID in "${formatIDs[@]}"; do

    echo "$youTubeID: Trying format $formatID..." >> "$LOG_FILE"
    youtube-dl -o "$CACHE_DIR/%(id)s" --no-progress --write-info-json -f "$formatID" "$youTubeID" >> "$LOG_FILE"

    # Check the response we got
    if [ $? == 0 ]; then
        downloaded=true
        echo "$youTubeID: Format $formatID downloaded!" >> "$LOG_FILE"
        break;
    else
        echo "$youTubeID: Format $formatID BAD! Moving on..." >> "$LOG_FILE"
        continue;
    fi

done

# Check a URL was resolved
if [ "$downloaded" == "false" ]; then
    echo "$youTubeID: ERROR: No formats found" >> "$LOG_FILE"
else
    # Write this URL to the queue list
    echo -n "$CACHE_DIR/$youTubeID"
fi
