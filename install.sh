#!/usr/bin/env bash

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "                      v2.0.0"
echo "-------------------------------------------------"

if [ "$EUID" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

# Install APT packages
apt-get install -y software-properties-common
add-apt-repository ppa:ondrej/php
apt-get update
apt-get install -y vlc ffmpeg php8.2 php8.2-sqlite git unzip

# Install Yt-dlp
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp
chmod a+rx /usr/local/bin/yt-dlp

# Install Composer
curl -sS https://getcomposer.org/installer | /usr/bin/php -- --install-dir=/usr/bin --filename=composer
chmod 0755 /usr/bin/composer
