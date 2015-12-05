# Fresh Jukebox

## Setup

On a basic install of Raspbian you will need to install LAMP, `youtube-dl` and `vlc`

```
sudo apt-get install vlc
sudo curl https://yt-dl.org/latest/youtube-dl -o /usr/local/bin/youtube-dl
sudo chmod a+rx /usr/local/bin/youtube-dl
```


## MySQL

### URLCache

This is the schema for the database used to store the URLs of the songs

```mysql
CREATE TABLE `URLCache` (
  `youTubeID` varchar(12) NOT NULL,
  `formatID` int(3) DEFAULT NULL,
  `URL` text,
  PRIMARY KEY (`youTubeID`),
  UNIQUE KEY `youTubeID_UNIQUE` (`youTubeID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

```