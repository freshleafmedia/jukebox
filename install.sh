#!/usr/bin/env bash

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "                      v0.0.2"
echo "-------------------------------------------------"

# Install APT packages
sudo apt-get update
sudo apt-get install -y apache2 nodejs nodejs-legacy npm vlc

# Install NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash

# Set the Node version to v4.0
source ~/.nvm/nvm.sh
nvm install 4.0
nvm alias default v4.0


# Install Youtube DL
curl https://yt-dl.org/downloads/2015.12.05/youtube-dl -o /usr/local/bin/youtube-dl
chmod a+rx /usr/local/bin/youtube-dl

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

read -e -p "Logging directory: " -i "./logs" LOG_DIR
read -e -p "Cache directory: " -i "./cache" CACHE_DIR

# Set the player
PLAYER="cvlc --play-and-exit -I rc --rc-host localhost:11337"

# Write the details
echo "LOG_DIR=$LOG_DIR" >> "$CONFIG_PATH"
echo "CACHE_DIR=$CACHE_DIR" >> "$CONFIG_PATH"
echo "PLAYER=$PLAYER" >> "$CONFIG_PATH"
