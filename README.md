# Fresh Jukebox

## Setup

On a basic install of Raspbian you will need to install Apache, Nodejs, `youtube-dl` and `vlc`

```
sudo apt-get install vlc
sudo curl https://yt-dl.org/latest/youtube-dl -o /usr/local/bin/youtube-dl
sudo chmod a+rx /usr/local/bin/youtube-dl
```

You will need to run the websocket server `nodejs /var/www/html/websocketserver.js`