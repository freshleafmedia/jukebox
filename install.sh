#!/usr/bin/env bash

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "                      v0.0.1"
echo "-------------------------------------------------"

# Install APT packages
apt-get update
apt-get install -y apache2 mysql-server php5

# Not sure if these are needed or how to install
# apt-get install -y nodejs npm
# apt-get install -y vlc

# Ask the user for the details
read -e -p "Path to the config file: " -i "$HOME/.jukebox" CONFIG_PATH

# Check if the config file already exists
if [ -f "$CONFIG_PATH" ]; then
	echo "The config file already exists, overwrite?"
	select yn in "Yes" "No"; do
		case $yn in
			Yes ) echo -n > "$CONFIG_PATH"; break;;
			No ) exit;;
		esac
	done
fi

# Ask for the MySQL details
read -e -p "MySQL username: " MYSQL_USER
read -e -p "MySQL hostname: " -i "localhost" MYSQL_HOST
read -e -s -p "MySQL password: " MYSQL_PASS && echo
read -e -s -p "MySQL password again: " MYSQL_PASS_AGAIN && echo

# Check the passwords matched
if [[ "$MYSQL_PASS" != "$MYSQL_PASS_AGAIN" ]]; then
	echo "ERROR - passwords didn't match. Config file not written"
	exit 1;
fi

MYSQL_DATABASE="jukebox"

# Set the file names
FILE_QUEUE="queue_list"
FILE_RESOLVE="resolve_list"

# Set the player
PLAYER="omxplayer"

# Write the details
echo "MYSQL_USER=$MYSQL_USER" >> "$CONFIG_PATH"
echo "MYSQL_HOST=$MYSQL_HOST" >> "$CONFIG_PATH"
echo "MYSQL_PASS=$MYSQL_PASS" >> "$CONFIG_PATH"
echo "MYSQL_DATABASE=$MYSQL_DATABASE" >> "$CONFIG_PATH"
echo "FILE_QUEUE=$FILE_QUEUE" >> "$CONFIG_PATH"
echo "FILE_RESOLVE=$FILE_RESOLVE" >> "$CONFIG_PATH"
echo "PLAYER=$PLAYER" >> "$CONFIG_PATH"
