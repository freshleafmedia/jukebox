#!/bin/bash

youTubeID="$1"
CACHE_DIR="$2"

LOG_DIR="$3"
LOG_FILE="$LOG_DIR/download"

echo "$youTubeID: Checking file cache..." >> "$LOG_FILE"

if [ -f "$CACHE_DIR/$youTubeID" ]; then
    echo "$youTubeID: Cache file found" >> "$LOG_FILE"
    exit 0;
fi

echo "$youTubeID: Resolving" >> "$LOG_FILE"


echo "$youTubeID: Fetching available formats..." >> "$LOG_FILE"

formatRegex='^([0-9]+)[[:space:]]+([^[:space:]]+).+$'

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
    youtube-dl -o "$CACHE_DIR/%(id)s" --write-info-json -f "$formatID" "$youTubeID" >> "$LOG_FILE"

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
    exit 1;
fi
