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



LOG_DIRECTORY='./logs'

# Check for and create the logging directory
if [ ! -d "$LOG_DIRECTORY" ]; then
	mkdir -p "$LOG_DIRECTORY"
fi

# Touch all the necessary files to make sure they exist
touch "$(optValue 'FILE_QUEUE')"
touch "$(optValue 'FILE_RESOLVE')"

# Start the resolver
echo -n "Starting the resolver... "
./resolve.sh >> "$LOG_DIRECTORY/reslove" &
echo "[$!]"

# Start the player
echo -n "Starting the player... "
./play.sh >> "$LOG_DIRECTORY/play" &
echo "[$!]"

# Start the node server
echo -n "Starting the node server... "
nohup node websocketserver.js >> "$LOG_DIRECTORY/node" &
echo "[$!]"

