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
apt-get install -y git apache2 vlc-nox

# Install NVM
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

source ~/.bashrc

nvm install v7

# NPM install
npm install

# Install Youtube DL
curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
chmod a+rx /usr/local/bin/youtube-dl

# Get the code
mkdir -p /var/www/vhosts/jukebox

git clone https://github.com/freshleafmedia/jukebox.git /var/www/vhosts/jukebox/

# Apache
cat << 'EOF' > /etc/apache2/sites-available/jukebox.conf
<VirtualHost *:80>
    DocumentRoot /var/www/vhosts/jukebox
</VirtualHost>
EOF

a2dissite 000-default
a2ensite jukebox

service apache2 reload
