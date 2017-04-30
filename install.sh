#!/usr/bin/env bash

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "                      v0.1.0"
echo "-------------------------------------------------"

if [ "$EUID" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

# Install APT packages
apt-get update
apt-get install -y apache2 vlc-nox

# Install NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

source ~/.bashrc

nvm install v7

# NPM install
npm install

# Install Youtube DL
curl https://yt-dl.org/latest/youtube-dl -o /usr/local/bin/youtube-dl
chmod a+rx /usr/local/bin/youtube-dl
