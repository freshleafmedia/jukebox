#!/usr/bin/env bash

set -euo pipefail

__DIR__="$(realpath "$(dirname "${BASH_SOURCE[0]}")")"

echo "-------------------------------------------------"
echo "                JUKEBOX INSTALLER"
echo "-------------------------------------------------"

OS_ID="$(. /etc/os-release && echo "${ID}")"

if [[ "${OS_ID}" == "ubuntu" ]]; then
    sudo apt-get install -y software-properties-common
    sudo add-apt-repository -y ppa:ondrej/php
elif [[ "${OS_ID}" == "debian" || "${OS_ID}" == "raspbian" ]]; then
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    sudo curl -sSL https://packages.sury.org/php/apt.gpg -o /usr/share/keyrings/deb.sury.org-php.gpg
    echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/php.list > /dev/null
else
    echo "Unsupported OS: ${OS_ID}" >&2

    exit 1
fi

sudo apt-get update
sudo apt-get install -y vlc ffmpeg nodejs php8.5-cli php8.5-sqlite3 php8.5-curl sqlite3 curl

if [[ ! -f /usr/local/bin/yt-dlp ]]; then
    sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
    sudo chmod a+rx /usr/local/bin/yt-dlp
fi

if [[ ! -f "${__DIR__}/config.php" ]]; then
    cp "${__DIR__}/config.example.php" "${__DIR__}/config.php"

    NODE_PATH="$(command -v node || true)"

    if [[ -n "${NODE_PATH}" ]]; then
        sed -i "s|node:/path/to/node/runtime/for/yt-dlp|node:${NODE_PATH}|" "${__DIR__}/config.php"
    fi

    echo ""
    echo "Set YOUTUBE_API_KEY in ${__DIR__}/config.php before starting the jukebox."
    echo ""
fi

mkdir -p "${__DIR__}/storage/"{songs,cache}

if [[ ! -f "${__DIR__}/storage/jukebox.sqlite" ]]; then
    touch "${__DIR__}/storage/jukebox.sqlite"

    for migration in "${__DIR__}"/src/migrations/*.sql; do
        sqlite3 "${__DIR__}/storage/jukebox.sqlite" < "${migration}"
    done
fi

for service in jukebox-download-worker jukebox-vlc-player; do
    sudo sed -e "s|{{ PWD }}|${__DIR__}|g" -e "s|{{ UID }}|${UID}|g" \
        "${__DIR__}/stubs/systemctl/${service}.service" \
        | sudo tee "/etc/systemd/system/${service}.service" > /dev/null
done

sudo chmod 644 /etc/systemd/system/jukebox-*.service
sudo systemctl daemon-reload

sudo systemctl enable jukebox-download-worker
sudo systemctl enable jukebox-vlc-player
sudo systemctl restart jukebox-download-worker
sudo systemctl restart jukebox-vlc-player
