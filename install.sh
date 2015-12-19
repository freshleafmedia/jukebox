#!/usr/bin/env bash

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "                      v0.0.3"
echo "-------------------------------------------------"

# Install APT packages
sudo apt-get update
sudo apt-get install -y apache2 npm vlc

# Install NVM
curl https://raw.githubusercontent.com/creationix/nvm/v0.11.1/install.sh | bash
source ~/.nvm/nvm.sh

nvm install v5.0

# Install Youtube DL
sudo curl https://yt-dl.org/latest/youtube-dl -o /usr/local/bin/youtube-dl
sudo chmod a+rx /usr/local/bin/youtube-dl
