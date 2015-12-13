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
LOG_FILE="$LOG_DIR/play"
CACHE_DIR=$(optValue 'CACHE_DIR')

YTID="$1"

# The binary to use to play the songs
PLAYER=$(optValue 'PLAYER')

$PLAYER "$CACHE_DIR/$YTID" >> "$LOG_FILE"
