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
CACHE_DIR=$(optValue 'CACHE_DIR')
PLAYER=$(optValue 'PLAYER')

# Check the required variables defined
if [ "$LOG_DIR" == "" ]; then
	echo "ERROR: LOG_DIR undefined in $OPT_FILE";
	exit 1;
fi

if [ "$PLAYER" == "" ]; then
	echo "ERROR: PLAYER undefined in $OPT_FILE";
	exit 1;
fi

if [ "$CACHE_DIR" == "" ]; then
	echo "ERROR: CACHE_DIR undefined in $OPT_FILE";
	exit 1;
fi

if [ ! -w "$CACHE_DIR" ]; then
	echo "ERROR: CACHE_DIR ($CACHE_DIR) not writeable";
	exit 1;
fi

# Check for and create the logging directory
if [ ! -d "$LOG_DIR" ]; then
	mkdir -p "$LOG_DIR"
fi

# Check for and create the cache directory
if [ ! -d "$CACHE_DIR" ]; then
	mkdir -p "$CACHE_DIR"
fi

# Check the JSON files are populated
if [ -s songcache.json ]; then
	echo -n "{}" > songcache.json
fi
if [ -s songqueue.json ]; then
	echo -n "[]" > songqueue.json
fi
if [ -s songstats.json ]; then
	echo -n "{}" > songstats.json
fi

# Start the node server
echo -n "Starting the node server... "
node websocketserver.js 2&>1 "$LOG_DIR/node" &
echo "[$!]"
echo

