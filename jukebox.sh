#!/bin/bash

# Start the node server
echo -n "Starting the node server... "
nohup node server/server.js &
echo "[$!]"
