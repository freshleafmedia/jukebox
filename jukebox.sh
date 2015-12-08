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

# Check for and create the logging directory
if [ ! -d "$LOG_DIR" ]; then
	mkdir -p "$LOG_DIR"
fi

# Start the node server
echo -n "Starting the node server... "
nohup node websocketserver.js >> "$LOG_DIR/node" &
echo "[$!]"

