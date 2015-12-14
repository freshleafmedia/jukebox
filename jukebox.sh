#!/bin/bash

# Start the node server
echo -n "Starting the node server... "
node websocketserver.js 2&>1 "$LOG_DIR/node" &
echo "[$!]"
