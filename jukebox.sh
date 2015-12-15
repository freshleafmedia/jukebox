#!/bin/bash

# Start the node server
echo -n "Starting the node server... "
node server/server.js &
echo "[$!]"
