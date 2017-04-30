#!/usr/bin/env bash

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "                      v0.1.0"
echo "-------------------------------------------------"

# Install APT packages
sudo apt-get update
sudo apt-get install -y apache2 vlc

# Install NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

source ~/.bashrc

nvm install v7

# NPM install
npm install

# Install Youtube DL
sudo curl https://yt-dl.org/latest/youtube-dl -o /usr/local/bin/youtube-dl
sudo chmod a+rx /usr/local/bin/youtube-dl
