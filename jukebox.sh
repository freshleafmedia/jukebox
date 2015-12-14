#!/bin/bash

# Start the node server
echo -n "Starting the node server... "
node server/src/server.js &
echo "[$!]"
