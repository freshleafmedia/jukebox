#!/usr/bin/env bash

__DIR__="$(realpath $(dirname "${BASH_SOURCE[0]}"))"

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
add-apt-repository -y ppa:ondrej/php
apt-get update
apt-get install -y vlc ffmpeg php8.2-cli php8.2-sqlite php8.2-curl php8.2-xml git unzip

# Install Yt-dlp
if [[ ! -f /usr/local/bin/yt-dlp ]]; then
    if [[ "$(dpkg --print-architecture)" == "amd64" ]]; then
        curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp
    elif [[ "$(dpkg --print-architecture)" == "armhf" ]]; then
        curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_armv7l -o /usr/local/bin/yt-dlp
    else
        echo "Error: unknown arch."
        echo "Please install Yt-dlp manually: https://github.com/yt-dlp/yt-dlp/releases/latest/"
        exit 1
    fi

    chmod a+rx /usr/local/bin/yt-dlp
fi


# Install Composer
curl -sS https://getcomposer.org/installer | /usr/bin/php -- --install-dir=/usr/bin --filename=composer
chmod 0755 /usr/bin/composer

# Install dependencies
if [[ ! -d "${__DIR__}/vendor" ]]; then
    composer install
    #php artisan octane:install
fi

# Configure project
if [[ ! -f "${__DIR__}/.env" ]]; then
    cp .env.example .env
    php artisan key:generate
fi

# Initiate database
if [[ ! -f "${__DIR__}/database/database.sqlite" ]]; then
    touch database/database.sqlite
    php artisan migrate
fi

# Install services
sed "s|{{ PWD }}|${__DIR__}|g" "${__DIR__}/stubs/systemctl/jukebox-queue-worker.service" > /etc/systemd/system/jukebox-queue-worker.service
sed "s|{{ PWD }}|${__DIR__}|g" "${__DIR__}/stubs/systemctl/jukebox-server-artisan.service" > /etc/systemd/system/jukebox-server-artisan.service
sed "s|{{ PWD }}|${__DIR__}|g" "${__DIR__}/stubs/systemctl/jukebox-server-octane.service" > /etc/systemd/system/jukebox-server-octane.service
sed "s|{{ PWD }}|${__DIR__}|g" "${__DIR__}/stubs/systemctl/jukebox-vlc-player.service" > /etc/systemd/system/jukebox-vlc-player.service
chmod 644 /etc/systemd/system/jukebox-*.service
systemctl daemon-reload

# Enable services
systemctl enable jukebox-queue-worker
systemctl enable jukebox-server-artisan
#systemctl enable jukebox-server-octane
systemctl enable jukebox-vlc-player

# Start services
systemctl start jukebox-queue-worker
systemctl start jukebox-server-artisan
#systemctl start jukebox-server-octane
systemctl start jukebox-vlc-player
