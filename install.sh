#!/usr/bin/env bash

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "                      v0.0.3"
echo "-------------------------------------------------"

# Install APT packages
sudo apt-get update
sudo apt-get install -y apache2 nodejs nodejs-legacy npm vlc

# Install NVM
curl https://raw.githubusercontent.com/creationix/nvm/v0.11.1/install.sh | bash
source ~/.nvm/nvm.sh

nvm install v5.0
nvm use v5.0
nvm alias default v5.0

# Install Youtube DL
curl https://yt-dl.org/downloads/2015.12.05/youtube-dl -o /usr/local/bin/youtube-dl
chmod a+rx /usr/local/bin/youtube-dl
