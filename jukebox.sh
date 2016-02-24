#!/bin/bash

# Update the Youtube Downloader
sudo youtube-dl -U

# Start the node server
echo -n "Starting the node server... "
nohup node server/server.js &
echo "[$!]"
