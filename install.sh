#!/usr/bin/env bash

__DIR__="$(realpath $(dirname "${BASH_SOURCE[0]}"))"

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "                      v2.0.0"
echo "-------------------------------------------------"

# Install APT packages
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update
sudo apt-get install -y vlc ffmpeg php8.2-cli php8.2-sqlite php8.2-curl php8.2-xml php8.2-mbstring git unzip

# Install Yt-dlp
if [[ ! -f /usr/local/bin/yt-dlp ]]; then
    if [[ "$(dpkg --print-architecture)" == "amd64" ]]; then
        sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp
    elif [[ "$(dpkg --print-architecture)" == "armhf" ]]; then
        sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_armv7l -o /usr/local/bin/yt-dlp
    else
        echo "Error: unknown arch."
        echo "Please install Yt-dlp manually: https://github.com/yt-dlp/yt-dlp/releases/latest/"
        exit 1
    fi

    sudo chmod a+rx /usr/local/bin/yt-dlp
fi


# Install Composer
curl -sS https://getcomposer.org/installer | sudo /usr/bin/php -- --install-dir=/usr/bin --filename=composer
sudo chmod 0755 /usr/bin/composer

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
sudo sed -i "s|{{ PWD }}|${__DIR__}|g" "${__DIR__}/stubs/systemctl/jukebox-queue-worker.service"
sudo sed -i "s|{{ UID }}|${UID}|g" "${__DIR__}/stubs/systemctl/jukebox-queue-worker.service"
sudo cp "${__DIR__}/stubs/systemctl/jukebox-queue-worker.service" /etc/systemd/system/

sudo sed -i "s|{{ PWD }}|${__DIR__}|g" "${__DIR__}/stubs/systemctl/jukebox-server-artisan.service"
sudo sed -i "s|{{ UID }}|${UID}|g" "${__DIR__}/stubs/systemctl/jukebox-server-artisan.service"
sudo cp "${__DIR__}/stubs/systemctl/jukebox-server-artisan.service" /etc/systemd/system/

sudo sed -i "s|{{ PWD }}|${__DIR__}|g" "${__DIR__}/stubs/systemctl/jukebox-server-octane.service"
sudo sed -i "s|{{ UID }}|${UID}|g" "${__DIR__}/stubs/systemctl/jukebox-server-octane.service"
sudo cp "${__DIR__}/stubs/systemctl/jukebox-server-octane.service" /etc/systemd/system/

sudo sed -i "s|{{ PWD }}|${__DIR__}|g" "${__DIR__}/stubs/systemctl/jukebox-vlc-player.service"
sudo sed -i "s|{{ UID }}|${UID}|g" "${__DIR__}/stubs/systemctl/jukebox-vlc-player.service"
sudo cp "${__DIR__}/stubs/systemctl/jukebox-vlc-player.service" /etc/systemd/system/

sudo chmod 644 /etc/systemd/system/jukebox-*.service
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable jukebox-queue-worker
sudo systemctl enable jukebox-server-artisan
#sudo systemctl enable jukebox-server-octane
sudo systemctl enable jukebox-vlc-player

# Start services
sudo systemctl start jukebox-queue-worker
sudo systemctl start jukebox-server-artisan
#sudo systemctl start jukebox-server-octane
sudo systemctl start jukebox-vlc-player
