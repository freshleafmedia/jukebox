#!/bin/bash

# The file to load the options from
if [ -z $OPT_FILE ]; then
	OPT_FILE="$HOME/.bash_opt"
fi

# The character(s) that signify the start of a comment
if [ -z $OPT_COMMENT ]; then
	OPT_COMMENT="#"
fi

# Persist any changes of the options back to the option file
if [ -z $OPT_PERSIST_CHANGES ]; then
	OPT_PERSIST_CHANGES=true
fi

# Create the option file if it doesn't exist
if [ -z $OPT_FILE_CREATE_IF_MISSING ]; then
	OPT_FILE_CREATE_IF_MISSING=true
fi

# Debug mode
if [ -z $OPT_DEBUG ]; then
	OPT_DEBUG=false
fi

# Define the regex to match an option
regexOption="^[:space:]*([^=[:space:]$OPT_COMMENT]+)[[:space:]]*=[[:space:]]*(.*)$"

# Initialise some variables
declare -A opts
declare -A optLines

optFileExists() {
	# Check if the option file exists
	if [ ! -e "$OPT_FILE" ]; then

		# Check if we should create the file if its missing
		if [ "$OPT_FILE_CREATE_IF_MISSING" == true ]; then
			# Create the missing option file
			touch "$OPT_FILE_CREATE_IF_MISSING"

			return 1
		fi
		return 0
	fi
	return 1
}

optFileWriteable() {
	if [ -w "$OPT_FILE" ]; then
		return 1
	fi

	return 0
}

optFileReadable() {
	if [ -r "$OPT_FILE" ]; then
		return 1
	fi

	return 0
}

optExists() {
	if [ -z ${opts["$1"]+abc} ]; then
		return 1
	else
		return 0
	fi
}

optValue() {
	if optExists "$1"; then
		echo "${opts["$1"]}"
	fi
}

optParse() {

	# Check the option file exists
	optFileExists
	if [ "$?" == 0 ]; then
		echo "ERROR: Option file does not exist"
		exit 1
	fi

	# Check we can read the option file
	optFileReadable
	if [ "$?" == 0 ]; then
		echo "ERROR: Option file not readable!";
		exit 1;
	fi

	# Set the line counter to 0
	lineNo=0

	# Loop over every line of the option file
	while read line; do

		# Increment the line counter
		lineNo=$((lineNo + 1))

		# Try and match the line against our REGEX
		[[ $line =~ $regexOption ]]
		if [[ ${BASH_REMATCH[@]} == '' ]]; then
			# Nothing matched the regex
			continue
		fi

		# Get the key/value pairs
		key="${BASH_REMATCH[1]}"
		value="${BASH_REMATCH[2]}"

		# Add the value to the associative array
		opts["$key"]="$value"

		# Add the line number of this option to an associative array
		optLines["$key"]="$lineNo"

	done < "$OPT_FILE"
}

optWrite() {

	# The key of the option we want to write to
	local key="$1";

	# The new value we want to give the option
	local value="$2"

	# Check we are actually being asked to change the value
	if [ "$2" == "$(optValue "$1")" ]; then
		return
	fi

	# Update the array
	opts["$1"]="$2"

	# Check we want to persist changes to the option file
	if [ "$OPT_PERSIST_CHANGES" != true ]; then
		return
	fi

	# Check the option file exists
	optFileExists
	if [ "$?" == 0 ]; then
		echo "ERROR: Option file does not exist"
		exit 1
	fi

	# Check we can write to the option file (if we want to)
	optFileWriteable
	if [ "$?" == 0 ]; then
		echo "ERROR: Option file not writeable!";
		exit 1;
	fi

	# Check if this is a new option
	if [ ! -z ${optLines["$1"]+abc} ]; then

		# Get the line number of this option
		local lineNo=${optLines["$1"]}

		# Remove the option
		sed -i "${lineNo}d" "$OPT_FILE"

		# Write the new option
		sed -i "${lineNo}i$1=$2" "$OPT_FILE"

	else
		# Add the new option to the end of the option file
		echo "$1=$2" >> "$OPT_FILE"
	fi
}

# If we are accessing this script directly run the argument parser, useful for testing
if [ "$0" == "$BASH_SOURCE" ]; then
	optParse

	[ "$OPT_DEBUG" == true ] && for k in "${!opts[@]}"
	do
		echo "OPT: $k = ${opts[$k]}"
	done
fi