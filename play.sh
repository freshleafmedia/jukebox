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

# The binary to use to play the songs
PLAYER=$(optValue 'PLAYER')

# The regex to match split youtube IDs from the URL
songRegex='^([^:]+):(.+)$'

$PLAYER "$URL"
